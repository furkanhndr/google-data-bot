'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COLORS, FONT_SIZE } from '@/lib/constants'

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
      <h1 style={{
        margin: '0 0 8px',
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.text,
      }}>
        Hesap Oluştur
      </h1>
      <p style={{
        margin: '0 0 28px',
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
      }}>
        Ücretsiz hesabınızla 100 veri hakkı kazanın.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Ad Soyad</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            placeholder="Ali Veli"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>E-posta</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="ornek@sirket.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="En az 8 karakter"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: COLORS.dangerLight,
            border: `1px solid #FCA5A5`,
            borderRadius: '6px',
            fontSize: FONT_SIZE.sm,
            color: COLORS.danger,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? COLORS.textLight : COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: FONT_SIZE.base,
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
      }}>
        Zaten hesabınız var mı?{' '}
        <Link href="/auth/login" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '500' }}>
          Giriş Yap
        </Link>
      </p>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: FONT_SIZE.sm,
  fontWeight: '500',
  color: COLORS.text,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '8px',
  fontSize: FONT_SIZE.base,
  color: COLORS.text,
  backgroundColor: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}
