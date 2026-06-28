import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailViaSmtp, type SmtpConfig } from '@/lib/email'
import { renderTemplate, getDefaultTemplate } from '@/lib/outreach'
import { getPlanDailyEmailLimit } from '@/lib/plan'
import type { BusinessResult, OutreachSettings } from '@googlebusinessdata/shared-types'

export const maxDuration = 60

const BATCH = 5
const THROTTLE_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type Params = { params: Promise<{ campaignId: string }> }

// POST /api/campaigns/[id]/run — process one bounded batch of pending recipients.
// The client loops this until { remaining: 0 } or { dailyLimitReached: true }.
export async function POST(_request: NextRequest, { params }: Params) {
  const { campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns').select('*').eq('id', campaignId).eq('user_id', user.id).single()
  if (!campaign) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })
  if (campaign.status === 'completed') return NextResponse.json({ processed: 0, sent: 0, failed: 0, remaining: 0 })

  const { data: cfg } = await supabase
    .from('email_provider_settings')
    .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_encrypted, from_email, from_name')
    .eq('user_id', user.id).maybeSingle()
  if (!cfg) return NextResponse.json({ error: 'Önce SMTP ayarlarını yapın.' }, { status: 400 })

  // Mark running on first/resumed run.
  if (campaign.status !== 'running') {
    await supabase.from('campaigns')
      .update({ status: 'running', started_at: campaign.started_at ?? new Date().toISOString() })
      .eq('id', campaign.id)
  }

  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)

  // Plan-wide daily email cap.
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const planLimit = getPlanDailyEmailLimit(profile?.plan ?? 'free')
  const { count: sentTodayPlan } = await supabase
    .from('outreach_events').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('channel', 'email').eq('event_type', 'sent')
    .gte('created_at', dayStart.toISOString())

  // Per-campaign daily cap.
  const { count: sentTodayCampaign } = await supabase
    .from('campaign_recipients').select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id).eq('status', 'sent')
    .gte('sent_at', dayStart.toISOString())

  const planRemaining = planLimit - (sentTodayPlan ?? 0)
  const campaignRemaining = campaign.daily_limit - (sentTodayCampaign ?? 0)
  const allowance = Math.min(BATCH, planRemaining, campaignRemaining)

  const { count: pendingTotal } = await supabase
    .from('campaign_recipients').select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id).eq('status', 'pending')

  if (allowance <= 0) {
    return NextResponse.json({ processed: 0, sent: 0, failed: 0, remaining: pendingTotal ?? 0, dailyLimitReached: true })
  }

  // Identity + template for rendering.
  const { data: settings } = await supabase
    .from('outreach_settings').select('*').eq('user_id', user.id).maybeSingle()

  let subjectTpl = getDefaultTemplate('email').subject ?? ''
  let bodyTpl = getDefaultTemplate('email').body
  if (campaign.template_id) {
    const { data: tpl } = await supabase
      .from('message_templates').select('subject, body').eq('id', campaign.template_id).eq('user_id', user.id).maybeSingle()
    if (tpl) { subjectTpl = tpl.subject ?? subjectTpl; bodyTpl = tpl.body }
  }

  const { data: recipients } = await supabase
    .from('campaign_recipients').select('id, business_result_id')
    .eq('campaign_id', campaign.id).eq('status', 'pending').limit(allowance)

  let sent = 0, failed = 0
  for (const rec of recipients ?? []) {
    const { data: biz } = await supabase
      .from('business_results').select('*').eq('id', rec.business_result_id).single()
    const lead = biz as BusinessResult | null

    if (!lead?.email) {
      await supabase.from('campaign_recipients').update({ status: 'skipped', error_message: 'E-posta yok' }).eq('id', rec.id)
      continue
    }

    const subject = renderTemplate(subjectTpl, lead, settings as OutreachSettings | null)
    const text = renderTemplate(bodyTpl, lead, settings as OutreachSettings | null)

    try {
      const messageId = await sendEmailViaSmtp(cfg as SmtpConfig, {
        to: lead.email, subject, text,
        replyTo: (settings as OutreachSettings | null)?.reply_to_email ?? null,
      })
      await supabase.from('campaign_recipients')
        .update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', rec.id)
      await supabase.from('outreach_events').insert({
        user_id: user.id, business_result_id: lead.id, template_id: campaign.template_id,
        channel: 'email', event_type: 'sent', subject, body: text,
        provider: 'smtp', provider_message_id: messageId,
      })
      await supabase.from('lead_outreach_status').upsert({
        user_id: user.id, business_result_id: lead.id, status: 'sent',
        last_channel: 'email', last_template_id: campaign.template_id, last_contacted_at: new Date().toISOString(),
      }, { onConflict: 'user_id,business_result_id' })
      sent++
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gönderim hatası'
      await supabase.from('campaign_recipients').update({ status: 'failed', error_message: message }).eq('id', rec.id)
      await supabase.from('outreach_events').insert({
        user_id: user.id, business_result_id: lead.id, template_id: campaign.template_id,
        channel: 'email', event_type: 'failed', subject, body: text, provider: 'smtp', error_message: message,
      })
      failed++
    }
    await sleep(THROTTLE_MS)
  }

  // Update counters + completion.
  const { count: remaining } = await supabase
    .from('campaign_recipients').select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id).eq('status', 'pending')

  const patch: Record<string, unknown> = {
    sent_count: campaign.sent_count + sent,
    failed_count: campaign.failed_count + failed,
  }
  if ((remaining ?? 0) === 0) { patch.status = 'completed'; patch.completed_at = new Date().toISOString() }
  await supabase.from('campaigns').update(patch).eq('id', campaign.id)

  return NextResponse.json({ processed: (recipients ?? []).length, sent, failed, remaining: remaining ?? 0 })
}
