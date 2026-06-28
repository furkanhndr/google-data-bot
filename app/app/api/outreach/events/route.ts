import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OutreachEventType } from '@googlebusinessdata/shared-types'

const VALID_EVENT_TYPES: OutreachEventType[] = [
  'prepared',
  'copied',
  'opened',
  'sent',
  'failed',
  'status_changed',
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessResultId = clean(request.nextUrl.searchParams.get('business_result_id'))
  if (!businessResultId) return NextResponse.json({ events: [] })

  const { data: business } = await supabase
    .from('business_results')
    .select('id')
    .eq('id', businessResultId)
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'Lead bulunamadı.' }, { status: 404 })

  const { data, error } = await supabase
    .from('outreach_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('business_result_id', business.id)
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const channel = body.channel === 'email' ? 'email' : 'whatsapp'
  const eventType = VALID_EVENT_TYPES.includes(body.event_type)
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
    : eventType === 'sent'
      ? 'sent'
    : 'prepared'

  const statusPayload: Record<string, unknown> = {
    user_id: user.id,
    business_result_id: business.id,
    status,
    last_channel: channel,
    last_template_id: clean(body.template_id),
  }
  if (eventType === 'opened' || eventType === 'sent') statusPayload.last_contacted_at = new Date().toISOString()

  await supabase
    .from('lead_outreach_status')
    .upsert(statusPayload, { onConflict: 'user_id,business_result_id' })

  return NextResponse.json({ ok: true }, { status: 201 })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
