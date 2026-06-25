'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      // Land on the reset page with an active recovery session.
      redirectTo: `${window.location.origin}/auth/callback?redirectTo=/auth/reset-password`,
    })
    setLoading(false)

    // Don't reveal whether the email exists — always show success.
    if (authError && !authError.message.toLowerCase().includes('rate')) {
      setError(authError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-bold text-text">E-postanı kontrol et</h1>
        <p className="mb-6 text-sm text-textMuted">
          <strong>{email}</strong> adresine bir şifre sıfırlama bağlantısı gönderdik.
          Bağlantı kısa süre içinde gelmezse spam klasörünü kontrol et.
        </p>
        <Link href="/auth/login" className="text-sm text-primary no-underline font-medium hover:underline">
          ← Girişe dön
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-text">Şifremi Unuttum</h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabının e-postasını gir, sıfırlama bağlantısı gönderelim.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-1.5 text-sm font-medium text-text">E-posta</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="ornek@sirket.com"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-dangerLight border border-red-300 rounded-md text-sm text-danger">{error}</div>
        )}

        <button type="submit" disabled={loading} className="w-full p-2.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer disabled:bg-textLight disabled:cursor-not-allowed">
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        <Link href="/auth/login" className="text-primary no-underline font-medium hover:underline">
          ← Girişe dön
        </Link>
      </p>
    </>
  )
}
