'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'

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
  const { toast } = useToast()

  const loadProgress = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/enrich`)
    if (res.ok) setProgress(await res.json())
  }, [jobId])

  useEffect(() => { loadProgress() }, [loadProgress])

  async function handleEnrich() {
    setRunning(true)
    let totalFound = 0

    try {
      // Loop bounded batches until the server reports nothing left.
      for (;;) {
        const res  = await fetch(`/api/jobs/${jobId}/enrich`, { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          toast(data.error ?? 'Zenginleştirme başarısız.', 'error')
          break
        }

        totalFound += data.found
        await loadProgress()

        if (data.remaining <= 0 || data.processed === 0) {
          toast(`Tamamlandı — ${totalFound} e-posta bulundu.`, 'success')
          onComplete?.()
          break
        }
      }
    } finally {
      setRunning(false)
    }
  }

  // Nothing to enrich — no website on any result.
  if (progress && progress.withWebsite === 0) return null

  const done = progress ? progress.remaining === 0 : false

  return (
    <div style={{
      backgroundColor: COLORS.primaryLight,
      border: `1px solid #BFDBFE`,
      borderRadius: RADIUS.lg,
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontWeight: '600', color: COLORS.primary, fontSize: FONT_SIZE.sm }}>
          ✉ E-posta zenginleştirme
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: '2px' }}>
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
        onClick={handleEnrich}
      >
        {done ? '✓ Tamamlandı' : running ? 'Taranıyor…' : 'E-postaları bul'}
      </Button>
    </div>
  )
}
