'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COLORS, FONT_SIZE } from '@/lib/constants'

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
      <h1 style={{
        margin: '0 0 8px',
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.text,
      }}>
        Giriş Yap
      </h1>
      <p style={{
        margin: '0 0 28px',
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
      }}>
        Hesabınıza erişmek için giriş yapın.
      </p>

      <form onSubmit={handleSubmit}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label style={labelStyle}>Şifre</label>
            <Link href="/auth/forgot-password" style={{ fontSize: FONT_SIZE.xs, color: COLORS.primary, textDecoration: 'none' }}>
              Şifremi unuttum?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
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
            transition: 'background-color 0.15s',
          }}
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
      }}>
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '500' }}>
          Kayıt Ol
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
  transition: 'border-color 0.15s',
}
