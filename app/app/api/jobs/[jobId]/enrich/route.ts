import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ENRICH_BATCH_SIZE, ENRICH_CONCURRENCY } from '@/lib/constants'
import { findEmailForWebsite, mapWithConcurrency } from '@/lib/utils/email-enrich'

type Params = { params: Promise<{ jobId: string }> }

// Allow up to 60s — crawling external sites is slow even when bounded.
export const maxDuration = 60

// POST /api/jobs/[jobId]/enrich
// Crawls business websites to discover emails. Processes one bounded batch
// per call and reports how many rows still need work, so the client can loop.
export async function POST(_request: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership + completion.
  const { data: job } = await supabase
    .from('scraping_jobs')
    .select('id, status')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'İş bulunamadı.' }, { status: 404 })
  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Sadece tamamlanmış işler zenginleştirilebilir.' }, { status: 400 })
  }

  // Service client: results UPDATE is admin-only under RLS, and we are
  // writing on behalf of an already-verified owner.
  const service = await createServiceClient()

  // First, flag rows that have no website at all so they aren't retried forever.
  await service
    .from('business_results')
    .update({ email_status: 'no_website' })
    .eq('job_id', jobId)
    .is('email_status', null)
    .is('website', null)

  // Pull the next batch of rows that still need a crawl.
  const { data: rows, error: fetchError } = await service
    .from('business_results')
    .select('id, website')
    .eq('job_id', jobId)
    .is('email_status', null)
    .not('website', 'is', null)
    .limit(ENRICH_BATCH_SIZE)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  let found = 0
  if (rows && rows.length > 0) {
    await mapWithConcurrency(rows, ENRICH_CONCURRENCY, async (row) => {
      const outcome = await findEmailForWebsite(row.website as string)
      const update = outcome.status === 'found'
        ? { email: outcome.email, email_status: 'found' as const }
        : { email_status: 'not_found' as const }

      if (outcome.status === 'found') found++

      await service.from('business_results').update(update).eq('id', row.id)
    })
  }

  // How many rows still need a crawl after this batch?
  const { count: remaining } = await service
    .from('business_results')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .is('email_status', null)
    .not('website', 'is', null)

  return NextResponse.json({
    processed: rows?.length ?? 0,
    found,
    remaining: remaining ?? 0,
  })
}

// GET /api/jobs/[jobId]/enrich — enrichment progress for this job.
export async function GET(_request: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: job } = await supabase
    .from('scraping_jobs')
    .select('id')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'İş bulunamadı.' }, { status: 404 })

  const base = () => supabase
    .from('business_results')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId)

  const [total, withWebsite, found, pending] = await Promise.all([
    base(),
    base().not('website', 'is', null),
    base().eq('email_status', 'found'),
    base().is('email_status', null).not('website', 'is', null),
  ])

  return NextResponse.json({
    total:       total.count ?? 0,
    withWebsite: withWebsite.count ?? 0,
    found:       found.count ?? 0,
    remaining:   pending.count ?? 0,
  })
}
