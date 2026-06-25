'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
      <h1 className="mb-2 text-2xl font-bold text-text">
        Giriş Yap
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Hesabınıza erişmek için giriş yapın.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1.5 text-sm font-medium text-text">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="ornek@sirket.com"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border transition-colors focus:border-borderFocus"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-baseline">
            <label className="block mb-1.5 text-sm font-medium text-text">Şifre</label>
            <Link href="/auth/forgot-password" className="text-xs text-primary no-underline hover:underline">
              Şifremi unuttum?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border transition-colors focus:border-borderFocus"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-dangerLight border border-red-300 rounded-md text-sm text-danger">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors disabled:bg-textLight disabled:cursor-not-allowed"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="text-primary no-underline font-medium hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </>
  )
}
