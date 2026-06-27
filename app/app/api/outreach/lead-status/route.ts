import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeadOutreachStatus, OutreachChannel } from '@googlebusinessdata/shared-types'

const VALID_STATUSES: LeadOutreachStatus[] = [
  'new',
  'prepared',
  'whatsapp_opened',
  'email_draft_opened',
  'sent',
  'replied',
  'not_interested',
  'customer',
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ids = request.nextUrl.searchParams.get('ids')
    ?.split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .slice(0, 200) ?? []

  if (ids.length === 0) return NextResponse.json({ statuses: [] })

  const { data, error } = await supabase
    .from('lead_outreach_status')
    .select('*')
    .eq('user_id', user.id)
    .in('business_result_id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ statuses: data ?? [] })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const businessResultId = clean(body.business_result_id)
  if (!businessResultId) return NextResponse.json({ error: 'Lead zorunludur.' }, { status: 400 })

  const status = VALID_STATUSES.includes(body.status) ? body.status : 'new'
  const lastChannel: OutreachChannel | null = body.last_channel === 'email' || body.last_channel === 'whatsapp'
    ? body.last_channel
    : null

  const { data: business } = await supabase
    .from('business_results')
    .select('id')
    .eq('id', businessResultId)
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'Lead bulunamadı.' }, { status: 404 })

  const payload: Record<string, unknown> = {
    user_id: user.id,
    business_result_id: business.id,
    status,
    last_channel: lastChannel,
    last_template_id: clean(body.last_template_id),
    notes: clean(body.notes),
  }
  if (body.mark_contacted) payload.last_contacted_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('lead_outreach_status')
    .upsert(payload, { onConflict: 'user_id,business_result_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: data })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
