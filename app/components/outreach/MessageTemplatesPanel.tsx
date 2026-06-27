'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { getDefaultTemplate, OUTREACH_VARIABLES, renderTemplate } from '@/lib/outreach'
import type { BusinessResult, MessageTemplate, OutreachChannel, OutreachSettings } from '@googlebusinessdata/shared-types'

interface Props {
  initialTemplates: MessageTemplate[]
}

const channelLabels: Record<OutreachChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-posta',
}

export function MessageTemplatesPanel({ initialTemplates }: Props) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState(initialTemplates)
  const [editing, setEditing] = useState<MessageTemplate | null>(templates[0] ?? null)
  const [saving, setSaving] = useState(false)

  async function createTemplate(channel: OutreachChannel) {
    const defaults = getDefaultTemplate(channel)
    const res = await fetch('/api/outreach/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaults),
    })
    const data = await res.json()
    if (!res.ok) {
      toast(data.error ?? 'Şablon oluşturulamadı.', 'error')
      return
    }
    setTemplates(prev => [...prev, data.template])
    setEditing(data.template)
    toast('Şablon oluşturuldu.', 'success')
  }

  async function saveTemplate() {
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/outreach/templates/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      toast(data.error ?? 'Şablon kaydedilemedi.', 'error')
      return
    }
    setTemplates(prev => prev.map(t => t.id === data.template.id ? data.template : t))
    setEditing(data.template)
    toast('Şablon kaydedildi.', 'success')
  }

  async function deleteTemplate() {
    if (!editing) return
    const res = await fetch(`/api/outreach/templates/${editing.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      toast(data.error ?? 'Şablon silinemedi.', 'error')
      return
    }
    const next = templates.filter(t => t.id !== editing.id)
    setTemplates(next)
    setEditing(next[0] ?? null)
    toast('Şablon silindi.', 'success')
  }

  function update<K extends keyof MessageTemplate>(key: K, value: MessageTemplate[K]) {
    if (!editing) return
    setEditing({ ...editing, [key]: value })
  }

  const previewBusiness = {
    id: 'preview',
    job_id: 'preview',
    user_id: 'preview',
    place_id: null,
    name: 'Örnek Diş Kliniği',
    category: 'Diş Kliniği',
    sub_categories: null,
    city: 'Kadıköy',
    address_full: 'Caferağa, Kadıköy, İstanbul',
    street: null,
    state: null,
    postal_code: null,
    country: null,
    latitude: null,
    longitude: null,
    plus_code: null,
    phone: '0212 000 00 00',
    phone_secondary: null,
    email: 'info@orneklinik.com',
    email_secondary: null,
    email_status: 'found',
    website: 'https://orneklinik.com',
    rating: 4.7,
    review_count: 128,
    price_level: null,
    hours: null,
    is_permanently_closed: false,
    is_temporarily_closed: false,
    social_facebook: null,
    social_instagram: null,
    social_twitter: null,
    social_linkedin: null,
    social_youtube: null,
    social_tiktok: null,
    description: null,
    menu_url: null,
    booking_url: null,
    order_url: null,
    photos_count: null,
    thumbnail_url: null,
    maps_url: null,
    claimed: null,
    attributes: null,
    scraped_at: new Date().toISOString(),
    raw_data: null,
  } satisfies BusinessResult

  const previewSettings = {
    id: 'preview',
    user_id: 'preview',
    sender_name: 'Ahmet Yılmaz',
    company_name: 'Dijital Ajans',
    sender_email: 'ahmet@ajans.com',
    reply_to_email: 'ahmet@ajans.com',
    sender_phone: '905xxxxxxxxx',
    website: 'https://ajans.com',
    email_signature: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } satisfies OutreachSettings

  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text">Mesaj Şablonları</h2>
          <p className="mt-1 text-sm text-textMuted">
            Lead bilgilerini değişkenlerle kişiselleştiren WhatsApp ve e-posta şablonları.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => createTemplate('whatsapp')}>+ WhatsApp</Button>
          <Button size="sm" variant="secondary" onClick={() => createTemplate('email')}>+ E-posta</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <div className="border border-border rounded-md overflow-hidden">
          {templates.length === 0 ? (
            <div className="p-4 text-sm text-textMuted">Henüz şablon yok.</div>
          ) : templates.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setEditing(t)}
              className={`w-full px-3 py-2 text-left border-b border-border text-sm ${
                editing?.id === t.id ? 'bg-primaryLight text-primary font-semibold' : 'bg-white text-text'
              }`}
            >
              <div>{t.name}</div>
              <div className="text-xs text-textMuted">{channelLabels[t.channel]}{t.is_default ? ' · Varsayılan' : ''}</div>
            </button>
          ))}
        </div>

        {editing ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-text">
                Şablon Adı
                <input
                  value={editing.name}
                  onChange={e => update('name', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md text-base font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-text">
                Kanal
                <input
                  value={channelLabels[editing.channel]}
                  disabled
                  className="px-3 py-2 border border-border rounded-md text-base font-normal bg-bg"
                />
              </label>
            </div>

            {editing.channel === 'email' && (
              <label className="block mb-4 text-sm font-medium text-text">
                E-posta Konusu
                <input
                  value={editing.subject ?? ''}
                  onChange={e => update('subject', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md text-base font-normal"
                />
              </label>
            )}

            <label className="block mb-4 text-sm font-medium text-text">
              Mesaj
              <textarea
                value={editing.body}
                onChange={e => update('body', e.target.value)}
                rows={8}
                className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm font-normal"
              />
            </label>

            <div className="mb-4 text-xs text-textMuted">
              Değişkenler: {OUTREACH_VARIABLES.map(v => `{${v}}`).join(', ')}
            </div>

            <div className="mb-4 rounded-md border border-border bg-bg p-3">
              <div className="mb-2 text-xs font-semibold text-textMuted">Önizleme</div>
              {editing.channel === 'email' && (
                <div className="mb-2 text-sm text-text">
                  <span className="font-semibold">Konu:</span>{' '}
                  {renderTemplate(editing.subject ?? '', previewBusiness, previewSettings)}
                </div>
              )}
              <pre className="whitespace-pre-wrap text-sm text-text font-sans">
                {renderTemplate(editing.body, previewBusiness, previewSettings)}
              </pre>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-textMuted">
                <input
                  type="checkbox"
                  checked={editing.is_default}
                  onChange={e => update('is_default', e.target.checked)}
                />
                Varsayılan şablon
              </label>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={deleteTemplate}>Sil</Button>
                <Button size="sm" loading={saving} onClick={saveTemplate}>Kaydet</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-textMuted border border-border rounded-md">
            Düzenlemek için bir şablon seçin veya yeni şablon oluşturun.
          </div>
        )}
      </div>
    </Card>
  )
}
