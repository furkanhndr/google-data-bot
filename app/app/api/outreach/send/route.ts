import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailViaSmtp, type SmtpConfig } from '@/lib/email'
import { getPlanDailyEmailLimit } from '@/lib/plan'

export const maxDuration = 30

// POST — send one outreach email to a lead via the user's SMTP.
// Body: { business_result_id, subject, body, template_id? }
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const businessResultId = String(body.business_result_id ?? '').trim()
  const subject = String(body.subject ?? '').trim()
  const text    = String(body.body ?? '').trim()
  const templateId = typeof body.template_id === 'string' && body.template_id.trim() ? body.template_id.trim() : null

  if (!businessResultId || !subject || !text) {
    return NextResponse.json({ error: 'Lead, konu ve mesaj zorunludur.' }, { status: 400 })
  }

  // Plan-based daily email limit.
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const dailyLimit = getPlanDailyEmailLimit(profile?.plan ?? 'free')
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
  const { count: sentToday } = await supabase
    .from('outreach_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('channel', 'email')
    .eq('event_type', 'sent')
    .gte('created_at', dayStart.toISOString())
  if ((sentToday ?? 0) >= dailyLimit) {
    return NextResponse.json({ error: `Günlük e-posta gönderim limitinize ulaştınız (${dailyLimit}/gün).` }, { status: 429 })
  }

  // Verify the lead belongs to the user and has an email.
  const { data: lead } = await supabase
    .from('business_results')
    .select('id, email')
    .eq('id', businessResultId)
    .eq('user_id', user.id)
    .single()
  if (!lead) return NextResponse.json({ error: 'Lead bulunamadı.' }, { status: 404 })
  if (!lead.email) return NextResponse.json({ error: 'Bu lead için e-posta adresi yok.' }, { status: 400 })

  const { data: cfg } = await supabase
    .from('email_provider_settings')
    .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_encrypted, from_email, from_name')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!cfg) return NextResponse.json({ error: 'Önce SMTP ayarlarını yapın.' }, { status: 400 })

  // Reply-to from the user's outreach identity, if set.
  const { data: identity } = await supabase
    .from('outreach_settings')
    .select('reply_to_email, sender_email')
    .eq('user_id', user.id)
    .maybeSingle()

  try {
    const messageId = await sendEmailViaSmtp(cfg as SmtpConfig, {
      to: lead.email,
      subject,
      text,
      replyTo: identity?.reply_to_email ?? identity?.sender_email ?? null,
    })

    await supabase.from('outreach_events').insert({
      user_id: user.id,
      business_result_id: lead.id,
      template_id: templateId,
      channel: 'email',
      event_type: 'sent',
      subject,
      body: text,
      provider: 'smtp',
      provider_message_id: messageId,
    })

    await supabase.from('lead_outreach_status').upsert({
      user_id: user.id,
      business_result_id: lead.id,
      status: 'sent',
      last_channel: 'email',
      last_template_id: templateId,
      last_contacted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,business_result_id' })

    return NextResponse.json({ ok: true, messageId })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gönderim başarısız.'
    await supabase.from('outreach_events').insert({
      user_id: user.id,
      business_result_id: lead.id,
      template_id: templateId,
      channel: 'email',
      event_type: 'failed',
      subject,
      body: text,
      provider: 'smtp',
      error_message: message,
    })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
