import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptSecret } from '@/lib/crypto'

// GET — current SMTP settings WITHOUT the password (only a `configured` flag).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('email_provider_settings')
    .select('id, user_id, smtp_host, smtp_port, smtp_secure, smtp_user, from_email, from_name, smtp_pass_encrypted, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return NextResponse.json({ settings: null })

  const { smtp_pass_encrypted, ...rest } = data
  return NextResponse.json({ settings: { ...rest, configured: !!smtp_pass_encrypted } })
}

// PUT — upsert SMTP settings. A non-empty `smtp_pass` is encrypted; if omitted,
// the existing stored password is preserved.
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const smtp_host  = String(body.smtp_host ?? '').trim()
  const from_email = String(body.from_email ?? '').trim()
  if (!smtp_host || !from_email) {
    return NextResponse.json({ error: 'SMTP sunucusu ve gönderen e-posta zorunludur.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('email_provider_settings')
    .select('smtp_pass_encrypted')
    .eq('user_id', user.id)
    .maybeSingle()

  const newPass = typeof body.smtp_pass === 'string' && body.smtp_pass.trim() ? body.smtp_pass.trim() : null

  const payload = {
    user_id:    user.id,
    smtp_host,
    smtp_port:  Number(body.smtp_port) || 587,
    smtp_secure: body.smtp_secure === true,
    smtp_user:  typeof body.smtp_user === 'string' && body.smtp_user.trim() ? body.smtp_user.trim() : null,
    from_email,
    from_name:  typeof body.from_name === 'string' && body.from_name.trim() ? body.from_name.trim() : null,
    smtp_pass_encrypted: newPass ? encryptSecret(newPass) : (existing?.smtp_pass_encrypted ?? null),
  }

  const { error } = await supabase
    .from('email_provider_settings')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
