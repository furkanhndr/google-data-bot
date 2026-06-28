'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import type { Campaign, CampaignStatus } from '@googlebusinessdata/shared-types'

const STATUS: Record<CampaignStatus, { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'danger' }> = {
  draft:     { label: 'Taslak',       variant: 'default' },
  running:   { label: 'Devam ediyor', variant: 'info' },
  completed: { label: 'Tamamlandı',   variant: 'success' },
  stopped:   { label: 'Durduruldu',   variant: 'warning' },
  failed:    { label: 'Hatalı',       variant: 'danger' },
}

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [counts, setCounts] = useState({ pending: 0, sent: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const stopRef = useRef(false)

  const loadDetail = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${campaignId}`)
    if (res.ok) {
      const data = await res.json()
      setCampaign(data.campaign)
      setCounts(data.counts)
    }
    setLoading(false)
  }, [campaignId])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function runCampaign() {
    setRunning(true)
    stopRef.current = false
    try {
      for (;;) {
        if (stopRef.current) break
        const res = await fetch(`/api/campaigns/${campaignId}/run`, { method: 'POST' })
        const data = await res.json()
        if (!res.ok) { toast(data.error ?? 'Gönderim hatası.', 'error'); break }
        await loadDetail()
        if (data.dailyLimitReached) { toast('Günlük gönderim limiti doldu. Yarın devam edebilirsiniz.', 'warning'); break }
        if (data.remaining <= 0) { toast('🎉 Kampanya tamamlandı.', 'success'); break }
      }
    } finally {
      setRunning(false)
    }
  }

  async function stopCampaign() {
    stopRef.current = true
    await fetch(`/api/campaigns/${campaignId}/stop`, { method: 'POST' })
    await loadDetail()
  }

  async function deleteCampaign() {
    if (!confirm('Bu kampanya silinsin mi?')) return
    const res = await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard/campaigns')
  }

  if (loading) return <div className="p-8"><PageSpinner /></div>
  if (!campaign) return <div className="p-8 text-textMuted">Kampanya bulunamadı.</div>

  const total = campaign.total_recipients || 1
  const donePct = Math.round(((counts.sent + counts.failed) / total) * 100)
  const isDone = campaign.status === 'completed'

  return (
    <div className="p-8 max-w-3xl">
      <a href="/dashboard/campaigns" className="inline-flex items-center gap-1 text-textMuted text-sm no-underline mb-5">← Kampanyalar</a>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-xl font-bold text-text">{campaign.name}</h1>
            <div className="text-xs text-textMuted mt-1">
              E-posta · {campaign.total_recipients} alıcı · günlük limit {campaign.daily_limit}
            </div>
          </div>
          <Badge variant={STATUS[campaign.status].variant}>{STATUS[campaign.status].label}</Badge>
        </div>

        {/* Progress */}
        <div className="h-2 bg-border rounded overflow-hidden mb-2">
          <div className="h-full bg-primary rounded transition-all" style={{ width: `${donePct}%` }} />
        </div>
        <div className="flex gap-4 text-sm mb-5">
          <span className="text-success">✓ Gönderildi: {counts.sent}</span>
          <span className="text-danger">✕ Hata: {counts.failed}</span>
          <span className="text-textMuted">⏳ Bekleyen: {counts.pending}</span>
        </div>

        <div className="flex gap-3 flex-wrap">
          {!isDone && (
            running ? (
              <Button variant="danger" onClick={stopCampaign}>Durdur</Button>
            ) : (
              <Button onClick={runCampaign} disabled={counts.pending === 0}>
                {campaign.status === 'draft' ? 'Başlat' : 'Devam Et'} ({counts.pending} bekliyor)
              </Button>
            )
          )}
          <Button variant="secondary" onClick={loadDetail}>Yenile</Button>
          <Button variant="ghost" onClick={deleteCampaign}>Sil</Button>
        </div>

        {running && (
          <div className="mt-4 text-xs text-textMuted">
            Gönderim sürüyor… Bu sekme açık kaldığı sürece devam eder. Sayfayı kapatırsanız “Devam Et” ile sürdürebilirsiniz.
          </div>
        )}
      </Card>
    </div>
  )
}
