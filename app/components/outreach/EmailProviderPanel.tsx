'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface InitialSettings {
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_user: string | null
  from_email: string
  from_name: string | null
  configured: boolean
}

export function EmailProviderPanel({ initial, fallbackEmail }: { initial: InitialSettings | null; fallbackEmail: string }) {
  const { toast } = useToast()
  const [host,    setHost]    = useState(initial?.smtp_host ?? '')
  const [port,    setPort]    = useState(String(initial?.smtp_port ?? 587))
  const [secure,  setSecure]  = useState(initial?.smtp_secure ?? false)
  const [smtpUser,setSmtpUser]= useState(initial?.smtp_user ?? '')
  const [pass,    setPass]    = useState('')
  const [fromEmail,setFromEmail] = useState(initial?.from_email ?? fallbackEmail)
  const [fromName, setFromName]  = useState(initial?.from_name ?? '')
  const [configured, setConfigured] = useState(initial?.configured ?? false)
  const [saving,  setSaving]  = useState(false)
  const [testing, setTesting] = useState(false)

  async function save() {
    if (!host.trim() || !fromEmail.trim()) { toast('SMTP sunucusu ve gönderen e-posta zorunlu.', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/outreach/email-settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smtp_host: host, smtp_port: Number(port) || 587, smtp_secure: secure,
        smtp_user: smtpUser, from_email: fromEmail, from_name: fromName,
        ...(pass ? { smtp_pass: pass } : {}),
      }),
    })
    setSaving(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { toast(data.error ?? 'Kaydedilemedi.', 'error'); return }
    if (pass) setConfigured(true)
    setPass('')
    toast('SMTP ayarları kaydedildi.', 'success')
  }

  async function sendTest() {
    setTesting(true)
    const res = await fetch('/api/outreach/email-settings/test', { method: 'POST' })
    setTesting(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { toast(data.error ?? 'Test başarısız.', 'error'); return }
    toast('Test e-postası gönderildi — gelen kutunu kontrol et.', 'success')
  }

  return (
    <Card className="mb-4">
      <h2 className="mb-1 text-lg font-semibold text-text">E-posta Gönderim (SMTP)</h2>
      <p className="mb-3 text-xs text-textMuted">
        Lead'lere e-posta kendi SMTP sunucunuzdan gönderilir. Şifreniz şifreli saklanır, hiçbir zaman geri gösterilmez.
      </p>

      <div className="mb-5 rounded-md border border-yellow-300 bg-warningLight p-3 text-xs text-warning">
        <div className="font-semibold mb-1">⚖️ Yasal sorumluluk</div>
        Gönderdiğiniz tüm ticari e-postalardan <strong>siz sorumlusunuz</strong>. Türkiye'de ticari
        elektronik ileti göndermek için alıcının <strong>onayı (İYS/açık rıza)</strong> veya meşru bir
        hukuki dayanak gerekir; KVKK ve 6563 sayılı kanuna uymak, mesajlarda kimliğinizi ve
        <strong> çıkış (unsubscribe)</strong> imkânını belirtmek sizin yükümlülüğünüzdür. BusinessData
        yalnızca aracı bir gönderim aracıdır; izinsiz/spam gönderimlerden doğacak sonuçlardan sorumlu değildir.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Input label="SMTP Sunucu" value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.gmail.com" required />
        <Input label="Port" type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="587" />
        <Input label="Kullanıcı Adı" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="ornek@sirket.com" />
        <Input
          label="Şifre / App Password" type="password" value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder={configured ? '•••••••• (kayıtlı — değiştirmek için yazın)' : 'SMTP şifresi'}
        />
        <Input label="Gönderen E-posta (From)" value={fromEmail} onChange={e => setFromEmail(e.target.value)} required />
        <Input label="Gönderen Adı" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Firma Adı" />
      </div>

      <label className="flex items-center gap-2 mt-3 text-sm text-text cursor-pointer">
        <input type="checkbox" checked={secure} onChange={e => setSecure(e.target.checked)} />
        SSL/TLS (port 465 için işaretleyin; 587 STARTTLS için boş bırakın)
      </label>

      <div className="flex gap-3 mt-5">
        <Button loading={saving} onClick={save}>Kaydet</Button>
        <Button variant="secondary" loading={testing} disabled={!configured} onClick={sendTest}>
          Test E-postası Gönder
        </Button>
      </div>
    </Card>
  )
}
