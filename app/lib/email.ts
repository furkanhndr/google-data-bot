import nodemailer from 'nodemailer'
import { decryptSecret } from '@/lib/crypto'

export interface SmtpConfig {
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_user: string | null
  smtp_pass_encrypted: string | null
  from_email: string
  from_name: string | null
}

export interface SendEmailInput {
  to: string
  subject: string
  text: string
  replyTo?: string | null
}

// Builds a nodemailer transport from a user's stored SMTP config, decrypting
// the password server-side.
function buildTransport(cfg: SmtpConfig) {
  const auth = cfg.smtp_user
    ? { user: cfg.smtp_user, pass: cfg.smtp_pass_encrypted ? decryptSecret(cfg.smtp_pass_encrypted) : '' }
    : undefined

  return nodemailer.createTransport({
    host: cfg.smtp_host,
    port: cfg.smtp_port,
    secure: cfg.smtp_secure, // true for 465, false for 587/STARTTLS
    auth,
  })
}

// Sends one email via the user's SMTP. Returns the provider message id.
export async function sendEmailViaSmtp(cfg: SmtpConfig, input: SendEmailInput): Promise<string> {
  const transport = buildTransport(cfg)
  const from = cfg.from_name ? `"${cfg.from_name}" <${cfg.from_email}>` : cfg.from_email

  const info = await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo ?? undefined,
  })

  return info.messageId
}
