'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface EnrichPanelProps {
  jobId: string
  onComplete?: () => void
}

interface Progress {
  total: number
  withWebsite: number
  found: number
  remaining: number
}

export function EnrichPanel({ jobId, onComplete }: EnrichPanelProps) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [running,  setRunning]  = useState(false)
  const autoStarted = useRef(false)
  const { toast } = useToast()

  const loadProgress = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/enrich`)
    if (res.ok) setProgress(await res.json())
  }, [jobId])

  useEffect(() => { loadProgress() }, [loadProgress])

  const handleEnrich = useCallback(async (auto = false) => {
    setRunning(true)
    let totalFound = 0

    try {
      // Loop bounded batches until the server reports nothing left.
      for (;;) {
        const res  = await fetch(`/api/jobs/${jobId}/enrich`, { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          if (!auto) toast(data.error ?? 'Zenginleştirme başarısız.', 'error')
          break
        }

        totalFound += data.found
        await loadProgress()

        if (data.remaining <= 0 || data.processed === 0) {
          if (totalFound > 0) toast(`${totalFound} e-posta bulundu.`, 'success')
          onComplete?.()
          break
        }
      }
    } finally {
      setRunning(false)
    }
  }, [jobId, loadProgress, onComplete, toast])

  // Auto-start enrichment once when the job has un-enriched results with websites.
  useEffect(() => {
    if (!progress || autoStarted.current || running) return
    if (progress.remaining > 0 && progress.withWebsite > 0) {
      autoStarted.current = true
      handleEnrich(true)
    }
  }, [progress, running, handleEnrich])

  // Nothing to enrich — no website on any result.
  if (progress && progress.withWebsite === 0) return null

  const done = progress ? progress.remaining === 0 : false

  return (
    <div className="bg-primaryLight border border-blue-200 rounded-lg px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-semibold text-primary text-sm">
          ✉ E-posta zenginleştirme
        </div>
        <div className="text-xs text-textMuted mt-0.5">
          {progress
            ? `${progress.withWebsite.toLocaleString('tr-TR')} işletmenin web sitesi var · ` +
              `${progress.found.toLocaleString('tr-TR')} e-posta bulundu` +
              (progress.remaining > 0 ? ` · ${progress.remaining.toLocaleString('tr-TR')} bekliyor` : '')
            : 'Durum yükleniyor…'}
        </div>
      </div>

      <Button
        size="sm"
        loading={running}
        disabled={done}
        onClick={() => handleEnrich()}
      >
        {done ? '✓ Tamamlandı' : running ? 'Taranıyor…' : 'E-postaları bul'}
      </Button>
    </div>
  )
}
