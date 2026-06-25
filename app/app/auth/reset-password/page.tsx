'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      <h1 className="mb-2 text-2xl font-bold text-text">Yeni Şifre Belirle</h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabın için yeni bir şifre gir.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1.5 text-sm font-medium text-text">Yeni Şifre</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="En az 8 karakter"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border disabled:bg-bg"
            disabled={!ready}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1.5 text-sm font-medium text-text">Yeni Şifre (Tekrar)</label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
            placeholder="••••••••"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border disabled:bg-bg"
            disabled={!ready}
          />
        </div>

        {error && <div className="mb-4 p-3 bg-dangerLight border border-red-300 rounded-md text-sm text-danger">{error}</div>}

        <button type="submit" disabled={loading || !ready} className="w-full p-2.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer disabled:bg-textLight disabled:cursor-not-allowed">
          {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </>
  )
}
