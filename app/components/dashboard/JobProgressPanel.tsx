'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JobStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

interface JobProgressPanelProps {
  initialJob: ScrapingJob
  onResultsUpdate: () => void
}

function percentWidthClass(percent: number) {
  if (percent <= 0) return 'w-0'
  if (percent >= 100) return 'w-full'
  const steps = [
    'w-1/12', 'w-1/6', 'w-1/4', 'w-1/3', 'w-5/12', 'w-1/2',
    'w-7/12', 'w-2/3', 'w-3/4', 'w-5/6', 'w-11/12',
  ]
  return steps[Math.min(steps.length - 1, Math.floor(percent / (100 / steps.length)))]
}

export function JobProgressPanel({ initialJob, onResultsUpdate }: JobProgressPanelProps) {
  const [job, setJob]         = useState<ScrapingJob>(initialJob)
  const [cancelling, setCancelling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()

    // Realtime subscription on this specific job
    const channel = supabase
      .channel(`job-${job.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'scraping_jobs',
        filter: `id=eq.${job.id}`,
      }, payload => {
        setJob(payload.new as ScrapingJob)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'business_results',
        filter: `job_id=eq.${job.id}`,
      }, () => {
        onResultsUpdate()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [job.id, onResultsUpdate])

  async function handleCancel() {
    setCancelling(true)
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (res.ok) {
      toast('İş iptal edildi.', 'info')
    } else {
      toast('İptal başarısız.', 'error')
      setCancelling(false)
    }
  }

  const isRunning = job.status === 'running' || job.status === 'pending'
  const percent   = job.total_found > 0
    ? Math.round((job.scraped_count / job.total_found) * 100)
    : 0

  return (
    <div className="bg-bgCard border border-border rounded-lg px-6 py-5 mb-6">
      {/* Row 1: query + status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="m-0 mb-1 text-lg font-bold text-text">
            {job.query}
          </h2>
          <span className="text-sm text-textMuted">📍 {job.location}</span>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <JobStatusBadge status={job.status} />
          {isRunning && (
            <Button variant="secondary" size="sm" loading={cancelling} onClick={handleCancel}>
              İptal
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={`flex gap-8 ${isRunning ? 'mb-4' : ''}`}>
        {[
          { label: 'Bulunan', value: job.total_found },
          { label: 'Çekilen', value: job.scraped_count },
          { label: 'Kalan',   value: Math.max(0, job.total_found - job.scraped_count) },
        ].map(stat => (
          <div key={stat.label}>
            <div className="text-xs text-textMuted">{stat.label}</div>
            <div className="text-xl font-bold text-text leading-tight">
              {stat.value.toLocaleString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div>
          <div className="h-1.5 bg-border rounded overflow-hidden">
            <div className={`h-full bg-blue-500 rounded transition-all ${percentWidthClass(percent)}`} />
          </div>
          <div className="text-xs text-textMuted mt-1.5">
            {percent}% tamamlandı
            {job.status === 'pending' && ' · Extension bağlanması bekleniyor...'}
          </div>
        </div>
      )}

      {job.status === 'failed' && job.error_message && (
        <div className="mt-3 p-3.5 bg-dangerLight border border-red-300 rounded-md text-sm text-danger">
          Hata: {job.error_message}
        </div>
      )}
    </div>
  )
}
