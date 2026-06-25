'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function PasswordSettings() {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast('Şifre en az 8 karakter olmalıdır.', 'error'); return }
    if (password !== confirm) { toast('Şifreler eşleşmiyor.', 'error'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { toast('Şifre değiştirilemedi: ' + error.message, 'error'); return }
    setPassword(''); setConfirm('')
    toast('Şifreniz güncellendi.', 'success')
  }

  return (
    <Card className="mb-4">
      <h2 className="mb-5 text-lg font-semibold text-text">
        Şifre Değiştir
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[360px]">
        <Input
          label="Yeni Şifre" type="password" value={password}
          onChange={e => setPassword(e.target.value)} required
          placeholder="En az 8 karakter"
        />
        <Input
          label="Yeni Şifre (Tekrar)" type="password" value={confirm}
          onChange={e => setConfirm(e.target.value)} required
          placeholder="••••••••"
        />
        <div>
          <Button type="submit" loading={loading}>Şifreyi Güncelle</Button>
        </div>
      </form>
    </Card>
  )
}
