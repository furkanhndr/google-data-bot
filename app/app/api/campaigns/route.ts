import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/campaigns — list the user's campaigns (newest first).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: data ?? [] })
}

// POST /api/campaigns — create an email campaign from a job's emailed leads
// (or an explicit list of business_result_ids). Created as 'draft'.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const name = String(body.name ?? '').trim()
  const templateId = typeof body.template_id === 'string' && body.template_id.trim() ? body.template_id.trim() : null
  const dailyLimit = Math.max(1, Math.min(500, Number(body.daily_limit) || 50))
  const jobId = typeof body.job_id === 'string' ? body.job_id : null
  const explicitIds: string[] = Array.isArray(body.business_result_ids) ? body.business_result_ids : []

  if (!name) return NextResponse.json({ error: 'Kampanya adı zorunludur.' }, { status: 400 })

  // Resolve recipients: only the user's own leads that have an email.
  let q = supabase.from('business_results').select('id').eq('user_id', user.id).not('email', 'is', null)
  if (explicitIds.length > 0) q = q.in('id', explicitIds.slice(0, 1000))
  else if (jobId) q = q.eq('job_id', jobId)
  else return NextResponse.json({ error: 'job_id veya business_result_ids gerekli.' }, { status: 400 })

  const { data: leads, error: leadErr } = await q
  if (leadErr) return NextResponse.json({ error: leadErr.message }, { status: 500 })
  if (!leads || leads.length === 0) {
    return NextResponse.json({ error: 'E-posta adresi olan lead bulunamadı.' }, { status: 400 })
  }

  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id, name, channel: 'email',
      template_id: templateId, status: 'draft',
      daily_limit: dailyLimit, total_recipients: leads.length,
    })
    .select()
    .single()

  if (campErr || !campaign) return NextResponse.json({ error: campErr?.message ?? 'Kampanya oluşturulamadı.' }, { status: 500 })

  const recipients = leads.map(l => ({
    campaign_id: campaign.id, user_id: user.id, business_result_id: l.id, status: 'pending' as const,
  }))
  const { error: recErr } = await supabase.from('campaign_recipients').insert(recipients)
  if (recErr) {
    await supabase.from('campaigns').delete().eq('id', campaign.id)
    return NextResponse.json({ error: recErr.message }, { status: 500 })
  }

  return NextResponse.json({ campaign }, { status: 201 })
}
