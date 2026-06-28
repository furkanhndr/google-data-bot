import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ campaignId: string }> }

// GET /api/campaigns/[id] — campaign detail with recipient status counts.
export async function GET(_request: NextRequest, { params }: Params) {
  const { campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 })

  const countBy = (status: string) =>
    supabase.from('campaign_recipients').select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId).eq('status', status)

  const [pending, sent, failed] = await Promise.all([countBy('pending'), countBy('sent'), countBy('failed')])

  return NextResponse.json({
    campaign,
    counts: { pending: pending.count ?? 0, sent: sent.count ?? 0, failed: failed.count ?? 0 },
  })
}

// DELETE /api/campaigns/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('campaigns').delete().eq('id', campaignId).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
