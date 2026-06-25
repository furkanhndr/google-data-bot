'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE } from '@/lib/constants'

const CONFIRM_WORD = 'SİL'

export function DangerZone() {
  const router = useRouter()
  const { toast } = useToast()
  const [open,    setOpen]    = useState(false)
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast(data.error ?? 'Hesap silinemedi.', 'error')
      setLoading(false)
      return
    }
    // Clear local session and leave.
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Card style={{ border: `1px solid #FCA5A5` }}>
      <h2 style={{ margin: '0 0 8px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.danger }}>
        Tehlikeli Bölge
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        Hesabınızı silmek tüm işlerinizi, sonuçlarınızı ve dışa aktarmalarınızı kalıcı olarak siler.
        Bu işlem geri alınamaz.
      </p>

      {!open ? (
        <Button variant="danger" onClick={() => setOpen(true)}>Hesabı Sil</Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
          <Input
            label={`Onaylamak için "${CONFIRM_WORD}" yazın`}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder={CONFIRM_WORD}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => { setOpen(false); setConfirm('') }}>
              İptal
            </Button>
            <Button
              variant="danger"
              loading={loading}
              disabled={confirm.trim().toLocaleUpperCase('tr-TR') !== CONFIRM_WORD}
              onClick={handleDelete}
            >
              Kalıcı Olarak Sil
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
