import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

// Symmetric encryption for secrets at rest (SMTP passwords).
// AES-256-GCM. The key is derived from OUTREACH_ENCRYPTION_KEY (any string) via
// SHA-256, so any sufficiently random env value works.

function getKey(): Buffer {
  const secret = process.env.OUTREACH_ENCRYPTION_KEY
  if (!secret) throw new Error('OUTREACH_ENCRYPTION_KEY is not set')
  return createHash('sha256').update(secret).digest() // 32 bytes
}

// Returns "iv:tag:ciphertext" (all base64).
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join(':')
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, ctB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !ctB64) throw new Error('Bozuk şifreli veri')
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8')
}
