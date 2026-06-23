import type { ScrapingJob } from '@googlebusinessdata/shared-types'
import { supabase } from './supabase.ts'
import { scrape } from './scraper.ts'
import { config } from './config.ts'

const MAX_RESULTS_FALLBACK = 100

// Atomically claim a single pending job: only one worker can flip a given row
// from 'pending' to 'running', so concurrent workers never grab the same job.
async function claimJob(): Promise<ScrapingJob | null> {
  const { data: pending } = await supabase
    .from('scraping_jobs')
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)

  const candidate = pending?.[0]
  if (!candidate) return null

  const { data: claimed } = await supabase
    .from('scraping_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', candidate.id)
    .eq('status', 'pending')   // guard against a race with another worker
    .select()
    .single()

  return (claimed as ScrapingJob) ?? null
}

async function isCancelled(jobId: string): Promise<boolean> {
  const { data } = await supabase
    .from('scraping_jobs')
    .select('status')
    .eq('id', jobId)
    .single()
  return data?.status === 'cancelled'
}

export async function processJob(job: ScrapingJob): Promise<void> {
  console.log(`[worker] job ${job.id} — "${job.query}" @ "${job.location}"`)
  const maxResults = job.filters?.max_results ?? MAX_RESULTS_FALLBACK
  let insertedTotal = 0

  try {
    await scrape({
      query: job.query,
      location: job.location,
      maxResults,
      isCancelled: () => isCancelled(job.id),
      onBatch: async (rows) => {
        const payload = rows.map(r => ({ ...r, job_id: job.id, user_id: job.user_id }))
        const { error } = await supabase.from('business_results').insert(payload)
        if (error) {
          // Surface insert failures instead of silently dropping data.
          throw new Error(`insert failed: ${error.message}`)
        }
        insertedTotal += payload.length
        // Live progress for the dashboard.
        await supabase.from('scraping_jobs')
          .update({ scraped_count: insertedTotal })
          .eq('id', job.id)
      },
    })

    // scraped_count reflects rows ACTUALLY written — credits (incremented by
    // the on-completion trigger) are therefore billed accurately.
    await supabase.from('scraping_jobs').update({
      status: 'completed',
      scraped_count: insertedTotal,
      completed_at: new Date().toISOString(),
    }).eq('id', job.id)

    console.log(`[worker] job ${job.id} done — ${insertedTotal} results`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase.from('scraping_jobs').update({
      status: 'failed',
      error_message: message,
      completed_at: new Date().toISOString(),
    }).eq('id', job.id)
    console.error(`[worker] job ${job.id} failed:`, message)
  }
}

// Continuously claims and processes jobs, up to `jobConcurrency` at a time.
export async function runWorkerLoop(): Promise<void> {
  const inFlight = new Set<Promise<void>>()

  for (;;) {
    if (inFlight.size < config.jobConcurrency) {
      const job = await claimJob()
      if (job) {
        const task = processJob(job).finally(() => inFlight.delete(task))
        inFlight.add(task)
        continue // try to fill remaining slots immediately
      }
    }
    await new Promise(r => setTimeout(r, config.pollIntervalMs))
  }
}
