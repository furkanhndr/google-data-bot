import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const channel = body.channel === 'email' ? 'email' : 'whatsapp'
  const eventType = ['prepared', 'copied', 'opened', 'sent', 'failed'].includes(body.event_type)
    ? body.event_type
    : 'prepared'

  const { data: business } = await supabase
    .from('business_results')
    .select('id')
    .eq('id', body.business_result_id)
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'Lead bulunamadı.' }, { status: 404 })

  const { error } = await supabase.from('outreach_events').insert({
    user_id: user.id,
    business_result_id: business.id,
    template_id: clean(body.template_id),
    channel,
    event_type: eventType,
    subject: clean(body.subject),
    body: clean(body.body),
    provider: clean(body.provider),
    error_message: clean(body.error_message),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const status = eventType === 'opened'
    ? channel === 'whatsapp' ? 'whatsapp_opened' : 'email_draft_opened'
    : 'prepared'

  const statusPayload: Record<string, unknown> = {
    user_id: user.id,
    business_result_id: business.id,
    status,
    last_channel: channel,
    last_template_id: clean(body.template_id),
  }
  if (eventType === 'opened') statusPayload.last_contacted_at = new Date().toISOString()

  await supabase
    .from('lead_outreach_status')
    .upsert(statusPayload, { onConflict: 'user_id,business_result_id' })

  return NextResponse.json({ ok: true }, { status: 201 })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
