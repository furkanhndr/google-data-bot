'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JobStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

interface JobProgressPanelProps {
  initialJob: ScrapingJob
  onResultsUpdate: () => void
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
    <div style={{
      backgroundColor: COLORS.bgCard,
      border: `1px solid ${COLORS.border}`,
      borderRadius: RADIUS.lg,
      padding: '20px 24px',
      marginBottom: '24px',
    }}>
      {/* Row 1: query + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text }}>
            {job.query}
          </h2>
          <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>📍 {job.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <JobStatusBadge status={job.status} />
          {isRunning && (
            <Button variant="secondary" size="sm" loading={cancelling} onClick={handleCancel}>
              İptal
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: isRunning ? '16px' : '0' }}>
        {[
          { label: 'Bulunan', value: job.total_found },
          { label: 'Çekilen', value: job.scraped_count },
          { label: 'Kalan',   value: Math.max(0, job.total_found - job.scraped_count) },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>{stat.label}</div>
            <div style={{ fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, lineHeight: 1.2 }}>
              {stat.value.toLocaleString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div>
          <div style={{ height: '6px', backgroundColor: COLORS.border, borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              backgroundColor: COLORS.primary,
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: '6px' }}>
            {percent}% tamamlandı
            {job.status === 'pending' && ' · Extension bağlanması bekleniyor...'}
          </div>
        </div>
      )}

      {job.status === 'failed' && job.error_message && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          backgroundColor: COLORS.dangerLight,
          border: `1px solid #FCA5A5`,
          borderRadius: RADIUS.md,
          fontSize: FONT_SIZE.sm, color: COLORS.danger,
        }}>
          Hata: {job.error_message}
        </div>
      )}
    </div>
  )
}
