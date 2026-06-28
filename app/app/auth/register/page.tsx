'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/auth/AuthInput'

export default function RegisterPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }
    if (!termsAccepted) {
      setError('Devam etmek için Kullanım Şartları ve Gizlilik Politikası\'nı kabul etmelisiniz.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-text">
        Hesap Oluştur
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Ücretsiz hesabınızla <strong className="text-text">100 veri hakkı</strong> kazanın.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Ad Soyad"
          icon="user"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          placeholder="Ali Veli"
          autoComplete="name"
        />

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

        <AuthInput
          label="Şifre"
          icon="lock"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="En az 8 karakter"
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            required
            className="mt-0.5 cursor-pointer"
          />
          <span className="text-sm text-textMuted">
            <Link href="/kullanim-sartlari" target="_blank" className="text-primary no-underline hover:underline">
              Kullanım Şartları
            </Link>
            {' ve '}
            <Link href="/gizlilik-politikasi" target="_blank" className="text-primary no-underline hover:underline">
              Gizlilik Politikası / KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum, kabul ediyorum.
          </span>
        </label>

        {error && (
          <div className="rounded-md border border-red-300 bg-dangerLight p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !termsAccepted}
          className="mt-1 w-full cursor-pointer rounded-lg border-none bg-primary p-2.5 text-base font-semibold text-white transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:bg-textLight"
        >
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        Zaten hesabınız var mı?{' '}
        <Link href="/auth/login" className="font-medium text-primary no-underline hover:underline">
          Giriş Yap
        </Link>
      </p>
    </>
  )
}
