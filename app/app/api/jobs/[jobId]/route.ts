import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ jobId: string }> }

// GET /api/jobs/[jobId]
export async function GET(_req: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: job, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (error || !job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Result count
  const { count } = await supabase
    .from('business_results')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)

  return NextResponse.json({ job, resultCount: count ?? 0 })
}

// PATCH /api/jobs/[jobId] — cancel job
export async function PATCH(request: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status } = body as { status: string }

  if (status !== 'cancelled') {
    return NextResponse.json({ error: 'Only cancellation is allowed.' }, { status: 400 })
  }

  const { data: job, error } = await supabase
    .from('scraping_jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'running'])
    .select()
    .single()

  if (error || !job) return NextResponse.json({ error: 'Update failed' }, { status: 400 })

  return NextResponse.json({ job })
}
