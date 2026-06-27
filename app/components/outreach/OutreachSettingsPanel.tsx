'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { OutreachSettings } from '@googlebusinessdata/shared-types'

interface Props {
  initialSettings: OutreachSettings | null
  fallbackEmail: string
  fallbackName: string
}

export function OutreachSettingsPanel({ initialSettings, fallbackEmail, fallbackName }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    sender_name: initialSettings?.sender_name ?? fallbackName,
    company_name: initialSettings?.company_name ?? '',
    sender_email: initialSettings?.sender_email ?? fallbackEmail,
    reply_to_email: initialSettings?.reply_to_email ?? fallbackEmail,
    sender_phone: initialSettings?.sender_phone ?? '',
    website: initialSettings?.website ?? '',
    email_signature: initialSettings?.email_signature ?? '',
  })

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setLoading(true)
    const res = await fetch('/api/outreach/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast(data.error ?? 'Gönderim ayarları kaydedilemedi.', 'error')
      return
    }
    toast('Gönderim ayarları kaydedildi.', 'success')
  }

  return (
    <Card className="mb-4">
      <h2 className="mb-2 text-lg font-semibold text-text">
        Gönderim Ayarları
      </h2>
      <p className="mb-5 text-sm text-textMuted">
        Bu bilgiler WhatsApp ve e-posta şablonlarında değişken olarak kullanılır.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Gönderen Adı" value={form.sender_name} onChange={e => update('sender_name', e.target.value)} />
        <Input label="Firma Adı" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
        <Input label="Gönderen E-posta" type="email" value={form.sender_email} onChange={e => update('sender_email', e.target.value)} />
        <Input label="Reply-to E-posta" type="email" value={form.reply_to_email} onChange={e => update('reply_to_email', e.target.value)} />
        <Input label="WhatsApp Numarası" value={form.sender_phone} onChange={e => update('sender_phone', e.target.value)} placeholder="905xxxxxxxxx" />
        <Input label="Web Sitesi" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://..." />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-text">E-posta İmzası</label>
        <textarea
          value={form.email_signature}
          onChange={e => update('email_signature', e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm text-text bg-white outline-none"
        />
      </div>

      <Button loading={loading} onClick={save}>Kaydet</Button>
    </Card>
  )
}
