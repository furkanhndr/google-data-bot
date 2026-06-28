import { describe, it, expect, beforeAll } from 'vitest'
import { encryptSecret, decryptSecret } from './crypto'

beforeAll(() => { process.env.OUTREACH_ENCRYPTION_KEY = 'test-encryption-key-123' })

describe('crypto (AES-256-GCM)', () => {
  it('round-trips a secret', () => {
    const enc = encryptSecret('my-smtp-password')
    expect(enc).not.toContain('my-smtp-password')
    expect(decryptSecret(enc)).toBe('my-smtp-password')
  })

  it('uses a random IV — same input encrypts differently each time', () => {
    expect(encryptSecret('x')).not.toBe(encryptSecret('x'))
  })

  it('rejects tampered ciphertext (auth tag)', () => {
    const enc = encryptSecret('secret')
    const parts = enc.split(':')
    parts[2] = Buffer.from('tampered').toString('base64')
    expect(() => decryptSecret(parts.join(':'))).toThrow()
  })
})
