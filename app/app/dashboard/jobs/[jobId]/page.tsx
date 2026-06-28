'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { JobProgressPanel } from '@/components/dashboard/JobProgressPanel'
import { ResultsTable } from '@/components/dashboard/ResultsTable'
import { ExportPanel } from '@/components/dashboard/ExportPanel'
import { EnrichPanel } from '@/components/dashboard/EnrichPanel'
import { CampaignCreatePanel } from '@/components/dashboard/CampaignCreatePanel'
import { PageSpinner } from '@/components/ui/Spinner'
import type { ScrapingJob, BusinessResult } from '@googlebusinessdata/shared-types'

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job,     setJob]     = useState<ScrapingJob | null>(null)
  const [results, setResults] = useState<BusinessResult[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  // Increment total when Realtime fires a new result
  const handleResultsUpdate = useCallback(() => {
    setTotal(prev => prev + 1)
  }, [])

  // Re-fetch results (e.g. after email enrichment updates rows)
  const reloadResults = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('business_results')
      .select('*')
      .eq('job_id', jobId)
      .order('scraped_at', { ascending: false })
      .limit(200)
    setResults((data ?? []) as BusinessResult[])
  }, [jobId])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: jobData, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error || !jobData) { setLoading(false); return }

      const { data: resultsData, count } = await supabase
        .from('business_results')
        .select('*', { count: 'exact' })
        .eq('job_id', jobId)
        .order('scraped_at', { ascending: false })
        .limit(200)

      setJob(jobData as ScrapingJob)
      setResults((resultsData ?? []) as BusinessResult[])
      setTotal(count ?? 0)
      setLoading(false)
    }

    load()

    // Realtime: new results streaming in
    const channel = supabase
      .channel(`results-${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'business_results',
        filter: `job_id=eq.${jobId}`,
      }, payload => {
        setResults(prev => [payload.new as BusinessResult, ...prev])
        setTotal(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId])

  if (loading) return <div className="p-8"><PageSpinner /></div>
  if (!job)    return notFound()

  return (
    <div className="p-8">
      {/* Back link */}
      <a href="/dashboard/jobs" className="inline-flex items-center gap-1 text-textMuted text-sm no-underline mb-5">
        ← İşler
      </a>

      {/* Progress panel (Realtime job updates) */}
      <JobProgressPanel initialJob={job} onResultsUpdate={handleResultsUpdate} />

      {/* Email enrichment + Export (only shown when completed) */}
      {job.status === 'completed' && total > 0 && (
        <>
          <EnrichPanel jobId={jobId} onComplete={reloadResults} />
          <CampaignCreatePanel jobId={jobId} defaultName={`${job.query} — ${job.location} kampanyası`} />
          <ExportPanel jobId={jobId} resultCount={total} />
        </>
      )}

      {/* Results table */}
      <div className="text-lg font-semibold text-text mt-6 mb-3">
        Sonuçlar
      </div>
      <ResultsTable results={results} total={total} />
    </div>
  )
}
