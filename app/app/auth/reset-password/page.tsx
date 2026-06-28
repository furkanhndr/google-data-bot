'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/auth/AuthInput'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady]       = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  // The recovery link (via /auth/callback) sets a session before we land here.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.')
      }
      setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (authError) { setError(authError.message); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-text">
        Yeni Şifre Belirle
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabın için yeni bir şifre gir.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Yeni Şifre"
          icon="lock"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="En az 8 karakter"
          disabled={!ready}
          autoComplete="new-password"
        />
        <AuthInput
          label="Yeni Şifre (Tekrar)"
          icon="lock"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
          disabled={!ready}
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-md border border-red-300 bg-dangerLight p-3 text-sm text-danger">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !ready}
          className="w-full cursor-pointer rounded-lg border-none bg-primary p-2.5 text-base font-semibold text-white transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:bg-textLight"
        >
          {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </>
  )
}
