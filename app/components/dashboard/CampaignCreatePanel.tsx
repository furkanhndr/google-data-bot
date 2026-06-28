'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { MessageTemplate } from '@googlebusinessdata/shared-types'

export function CampaignCreatePanel({ jobId, defaultName }: { jobId: string; defaultName: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState(defaultName)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [templateId, setTemplateId] = useState('')
  const [dailyLimit, setDailyLimit] = useState(50)
  const [consent, setConsent] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/outreach/templates')
      .then(r => r.ok ? r.json() : { templates: [] })
      .then(d => setTemplates((d.templates ?? []).filter((t: MessageTemplate) => t.channel === 'email' && t.is_active)))
      .catch(() => {})
  }, [])

  async function create() {
    if (!name.trim()) { toast('Kampanya adı girin.', 'error'); return }
    if (!consent) { toast('Yasal onayı işaretleyin.', 'error'); return }
    setCreating(true)
    const res = await fetch('/api/campaigns', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, name: name.trim(), template_id: templateId || null, daily_limit: dailyLimit }),
    })
    const data = await res.json().catch(() => ({}))
    setCreating(false)
    if (!res.ok) { toast(data.error ?? 'Kampanya oluşturulamadı.', 'error'); return }
    router.push(`/dashboard/campaigns/${data.campaign.id}`)
  }

  return (
    <div className="bg-primaryLight border border-blue-200 rounded-lg px-5 py-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold text-primary text-sm">📣 Toplu E-posta Kampanyası</div>
          <div className="text-xs text-textMuted mt-0.5">
            Bu işteki e-postası olan lead'lere kendi SMTP'nizden toplu, kontrollü e-posta gönderin.
          </div>
        </div>
        <Button size="sm" variant={open ? 'secondary' : 'primary'} onClick={() => setOpen(o => !o)}>
          {open ? 'Kapat' : 'Kampanya Oluştur'}
        </Button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm text-text md:col-span-2">
            Kampanya Adı
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm" />
          </label>
          <label className="text-sm text-text">
            Günlük Limit
            <input type="number" min={1} max={500} value={dailyLimit}
              onChange={e => setDailyLimit(Math.max(1, Math.min(500, Number(e.target.value) || 50)))}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm" />
          </label>
          <label className="text-sm text-text md:col-span-3">
            Şablon
            <select value={templateId} onChange={e => setTemplateId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-white">
              <option value="">Varsayılan e-posta taslağı</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (varsayılan)' : ''}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-2 text-xs text-textMuted md:col-span-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" />
            <span>Bu lead'lere e-posta göndermek için <strong>yasal dayanağım (onay/İYS/meşru menfaat)</strong> olduğunu, KVKK ve 6563 sayılı kanuna uyduğumu ve sorumluluğun bana ait olduğunu onaylıyorum.</span>
          </label>
          <div className="md:col-span-3">
            <Button loading={creating} disabled={!consent} onClick={create}>Kampanyayı Oluştur</Button>
          </div>
        </div>
      )}
    </div>
  )
}
