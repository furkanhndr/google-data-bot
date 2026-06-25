import { describe, it, expect, vi, afterEach } from 'vitest'
import { findEmailForWebsite, mapWithConcurrency } from './email-enrich.ts'

// Mock the home page response with the given HTML.
function mockHtml(html: string) {
  global.fetch = vi.fn(async () => ({
    ok: true,
    headers: { get: () => 'text/html; charset=utf-8' },
    text: async () => html,
  })) as unknown as typeof fetch
}

afterEach(() => { vi.restoreAllMocks() })

describe('findEmailForWebsite', () => {
  it('strips trailing HTML junk from a mailto link', async () => {
    mockHtml('<a href="mailto:info@dentareform.com<br>">Yaz</a>')
    expect(await findEmailForWebsite('https://x.com')).toEqual({ status: 'found', email: 'info@dentareform.com' })
  })

  it('ignores blocked/placeholder domains and returns the real email', async () => {
    mockHtml('<p>track@sentry.io</p><p>satis@firma.com.tr</p>')
    expect(await findEmailForWebsite('https://x.com')).toEqual({ status: 'found', email: 'satis@firma.com.tr' })
  })

  it('skips file-extension false positives like logo@2x.png', async () => {
    mockHtml('<img src="logo@2x.png"><span>hello@firma.com</span>')
    expect(await findEmailForWebsite('https://x.com')).toEqual({ status: 'found', email: 'hello@firma.com' })
  })

  it('prefers a role-based address (info@) over others', async () => {
    mockHtml('<p>ahmet@firma.com</p><a href="mailto:info@firma.com">x</a>')
    const r = await findEmailForWebsite('https://x.com')
    expect(r).toEqual({ status: 'found', email: 'info@firma.com' })
  })

  it('returns not_found for an invalid URL', async () => {
    expect(await findEmailForWebsite('not a url')).toEqual({ status: 'not_found' })
  })

  it('returns not_found when no email is present', async () => {
    mockHtml('<p>İletişim formu ile ulaşın.</p>')
    expect(await findEmailForWebsite('https://x.com')).toEqual({ status: 'not_found' })
  })
})

describe('mapWithConcurrency', () => {
  it('preserves input order in the results', async () => {
    const out = await mapWithConcurrency([1, 2, 3, 4], 2, async n => n * 10)
    expect(out).toEqual([10, 20, 30, 40])
  })

  it('never exceeds the concurrency limit', async () => {
    let active = 0
    let peak = 0
    await mapWithConcurrency(Array.from({ length: 10 }), 3, async () => {
      active++; peak = Math.max(peak, active)
      await new Promise(r => setTimeout(r, 5))
      active--
    })
    expect(peak).toBeLessThanOrEqual(3)
  })
})
