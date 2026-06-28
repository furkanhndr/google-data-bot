import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailViaSmtp, type SmtpConfig } from '@/lib/email'

export const maxDuration = 30

// POST — send a test email to the signed-in user's own address via their SMTP.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.email) return NextResponse.json({ error: 'Hesabınızda e-posta yok.' }, { status: 400 })

  const { data: cfg } = await supabase
    .from('email_provider_settings')
    .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_encrypted, from_email, from_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cfg) return NextResponse.json({ error: 'Önce SMTP ayarlarını kaydedin.' }, { status: 400 })

  try {
    const id = await sendEmailViaSmtp(cfg as SmtpConfig, {
      to: user.email,
      subject: 'BusinessData — SMTP test e-postası',
      text: 'Bu bir test e-postasıdır. SMTP ayarlarınız çalışıyor. ✅',
    })
    return NextResponse.json({ ok: true, messageId: id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Gönderim başarısız.' }, { status: 502 })
  }
}
