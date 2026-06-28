'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/auth/AuthInput'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-text">
        Giriş Yap
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabınıza erişmek için giriş yapın.
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

        <div>
          <AuthInput
            label="Şifre"
            icon="lock"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="mt-1.5 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-primary no-underline hover:underline">
              Şifremi unuttum?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-dangerLight p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full cursor-pointer rounded-lg border-none bg-primary p-2.5 text-base font-semibold text-white transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:bg-textLight"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-medium text-primary no-underline hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </>
  )
}
