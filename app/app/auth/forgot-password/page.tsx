'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COLORS, FONT_SIZE } from '@/lib/constants'

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
        <h1 style={titleStyle}>E-postanı kontrol et</h1>
        <p style={{ margin: '0 0 24px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
          <strong>{email}</strong> adresine bir şifre sıfırlama bağlantısı gönderdik.
          Bağlantı kısa süre içinde gelmezse spam klasörünü kontrol et.
        </p>
        <Link href="/auth/login" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '500', fontSize: FONT_SIZE.sm }}>
          ← Girişe dön
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 style={titleStyle}>Şifremi Unuttum</h1>
      <p style={{ margin: '0 0 28px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        Hesabının e-postasını gir, sıfırlama bağlantısı gönderelim.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>E-posta</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="ornek@sirket.com" style={inputStyle}
          />
        </div>

        {error && (
          <div style={errorBoxStyle}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        <Link href="/auth/login" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '500' }}>
          ← Girişe dön
        </Link>
      </p>
    </>
  )
}

const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: FONT_SIZE.base, color: COLORS.text, backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }
const errorBoxStyle: React.CSSProperties = { marginBottom: '16px', padding: '12px', backgroundColor: COLORS.dangerLight, border: `1px solid #FCA5A5`, borderRadius: '6px', fontSize: FONT_SIZE.sm, color: COLORS.danger }
const buttonStyle = (loading: boolean): React.CSSProperties => ({ width: '100%', padding: '10px', backgroundColor: loading ? COLORS.textLight : COLORS.primary, color: '#fff', border: 'none', borderRadius: '8px', fontSize: FONT_SIZE.base, fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' })
