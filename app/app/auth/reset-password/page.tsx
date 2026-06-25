'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS, FONT_SIZE } from '@/lib/constants'

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
      <h1 style={titleStyle}>Yeni Şifre Belirle</h1>
      <p style={{ margin: '0 0 28px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        Hesabın için yeni bir şifre gir.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Yeni Şifre</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="En az 8 karakter" style={inputStyle} disabled={!ready}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
            placeholder="••••••••" style={inputStyle} disabled={!ready}
          />
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <button type="submit" disabled={loading || !ready} style={buttonStyle(loading || !ready)}>
          {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </>
  )
}

const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: FONT_SIZE.base, color: COLORS.text, backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }
const errorBoxStyle: React.CSSProperties = { marginBottom: '16px', padding: '12px', backgroundColor: COLORS.dangerLight, border: `1px solid #FCA5A5`, borderRadius: '6px', fontSize: FONT_SIZE.sm, color: COLORS.danger }
const buttonStyle = (disabled: boolean): React.CSSProperties => ({ width: '100%', padding: '10px', backgroundColor: disabled ? COLORS.textLight : COLORS.primary, color: '#fff', border: 'none', borderRadius: '8px', fontSize: FONT_SIZE.base, fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer' })
