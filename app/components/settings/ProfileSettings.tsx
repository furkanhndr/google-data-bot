'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE } from '@/lib/constants'

interface ProfileSettingsProps {
  userId: string
  email: string
  initialName: string
  initialAvatar: string | null
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB

export function ProfileSettings({ userId, email, initialName, initialAvatar }: ProfileSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)

  const [name,      setName]      = useState(initialName)
  const [avatar,    setAvatar]    = useState(initialAvatar)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast('Lütfen bir görsel dosyası seçin.', 'error'); return }
    if (file.size > MAX_AVATAR_BYTES)    { toast('Görsel en fazla 2 MB olabilir.', 'error'); return }

    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) { toast('Yükleme başarısız: ' + uploadError.message, 'error'); setUploading(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    // Cache-bust so the new image shows immediately (same path, upsert).
    const url = `${data.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
    if (updateError) { toast('Profil güncellenemedi: ' + updateError.message, 'error'); setUploading(false); return }

    setAvatar(url)
    setUploading(false)
    toast('Profil fotoğrafı güncellendi.', 'success')
    router.refresh()
  }

  async function handleSave() {
    if (!name.trim()) { toast('Ad Soyad boş olamaz.', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', userId)
    setSaving(false)
    if (error) { toast('Kaydedilemedi: ' + error.message, 'error'); return }
    toast('Profil kaydedildi.', 'success')
    router.refresh()
  }

  const initial = (name || email || 'U')[0].toUpperCase()

  return (
    <Card style={{ marginBottom: '16px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
        Profil Bilgileri
      </h2>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: COLORS.primary, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '700', overflow: 'hidden', flexShrink: 0,
        }}>
          {avatar
            ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileInput.current?.click()}>
            Fotoğraf Yükle
          </Button>
          <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: '6px' }}>
            JPG / PNG, en fazla 2 MB
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
        <Input label="E-posta" value={email} disabled hint="E-posta değiştirmek için destek ile iletişime geçin." />
        <Input label="Ad Soyad" value={name} onChange={e => setName(e.target.value)} required />
        <div>
          <Button loading={saving} onClick={handleSave}>Kaydet</Button>
        </div>
      </div>
    </Card>
  )
}
