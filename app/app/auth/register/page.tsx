'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
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
      <h1 className="mb-2 text-2xl font-bold text-text">
        Hesap Oluştur
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Ücretsiz hesabınızla 100 veri hakkı kazanın.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1.5 text-sm font-medium text-text">Ad Soyad</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            placeholder="Ali Veli"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-sm font-medium text-text">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="ornek@sirket.com"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1.5 text-sm font-medium text-text">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="En az 8 karakter"
            className="w-full px-3 py-[9px] border border-border rounded-lg text-base text-text bg-white outline-none box-border"
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
          className="w-full p-2.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer disabled:bg-textLight disabled:cursor-not-allowed"
        >
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-textMuted">
        Zaten hesabınız var mı?{' '}
        <Link href="/auth/login" className="text-primary no-underline font-medium hover:underline">
          Giriş Yap
        </Link>
      </p>
    </>
  )
}
