'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/auth/AuthInput'

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
        <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-text">
          E-postanı kontrol et
        </h1>
        <p className="mb-6 text-sm text-textMuted">
          <strong className="text-text">{email}</strong> adresine bir şifre sıfırlama bağlantısı gönderdik.
          Bağlantı kısa süre içinde gelmezse spam klasörünü kontrol et.
        </p>
        <Link href="/auth/login" className="text-sm font-medium text-primary no-underline hover:underline">
          ← Girişe dön
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-text">
        Şifremi Unuttum
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabının e-postasını gir, sıfırlama bağlantısı gönderelim.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="E-posta"
          icon="mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="ornek@sirket.com"
          autoComplete="email"
        />

        {error && (
          <div className="rounded-md border border-red-300 bg-dangerLight p-3 text-sm text-danger">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg border-none bg-primary p-2.5 text-base font-semibold text-white transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:bg-textLight"
        >
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        <Link href="/auth/login" className="font-medium text-primary no-underline hover:underline">
          ← Girişe dön
        </Link>
      </p>
    </>
  )
}
