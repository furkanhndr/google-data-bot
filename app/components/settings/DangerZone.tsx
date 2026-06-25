'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

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
    <Card className="border-red-300">
      <h2 className="mb-2 text-lg font-semibold text-danger">
        Tehlikeli Bölge
      </h2>
      <p className="mb-4 text-sm text-textMuted">
        Hesabınızı silmek tüm işlerinizi, sonuçlarınızı ve dışa aktarmalarınızı kalıcı olarak siler.
        Bu işlem geri alınamaz.
      </p>

      {!open ? (
        <Button variant="danger" onClick={() => setOpen(true)}>Hesabı Sil</Button>
      ) : (
        <div className="flex flex-col gap-3 max-w-[360px]">
          <Input
            label={`Onaylamak için "${CONFIRM_WORD}" yazın`}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder={CONFIRM_WORD}
          />
          <div className="flex gap-2.5">
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
