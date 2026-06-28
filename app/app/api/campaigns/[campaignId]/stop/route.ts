import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ campaignId: string }> }

// POST /api/campaigns/[id]/stop — pause a running campaign.
export async function POST(_request: NextRequest, { params }: Params) {
  const { campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: 'stopped' })
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .in('status', ['draft', 'running'])
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Durdurulamadı.' }, { status: 400 })
  return NextResponse.json({ campaign: data })
}
