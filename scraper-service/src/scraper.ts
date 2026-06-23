import { chromium, type Browser, type BrowserContext } from 'playwright'
import type { BusinessResult } from '@googlebusinessdata/shared-types'
import { config } from './config.ts'
import { EXTRACTOR_SOURCE } from './generated/extractor-source.ts'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

export interface ScrapeOptions {
  query: string
  location: string
  maxResults: number
  category?: string | null
  minRating?: number | null
  // Called as rows are extracted so the caller can stream them to the DB.
  onBatch: (rows: Partial<BusinessResult>[]) => Promise<void>
  isCancelled?: () => Promise<boolean>
}

// Builds the Google Maps search term from query + optional category + location,
// avoiding duplicate words (e.g. query already contains the category).
function buildSearchTerm(query: string, category: string | null | undefined, location: string): string {
  const parts = [query]
  if (category && !query.toLowerCase().includes(category.toLowerCase())) parts.push(category)
  parts.push(location)
  return parts.join(' ').trim()
}

let browserSingleton: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserSingleton) return browserSingleton
  browserSingleton = await chromium.launch({
    headless: config.headless,
    proxy: config.proxyServer ? { server: config.proxyServer } : undefined,
  })
  return browserSingleton
}

export async function closeBrowser(): Promise<void> {
  await browserSingleton?.close()
  browserSingleton = null
}

async function newContext(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    locale: 'tr-TR',
    viewport: { width: 1366, height: 900 },
    userAgent: USER_AGENT,
  })
  // Minimal anti-detection. For real scale, harden further / use stealth.
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  })
  return ctx
}

// Runs one search and extracts business detail by navigating directly to each
// place URL (far more reliable than clicking cards in the results feed).
export async function scrape(opts: ScrapeOptions): Promise<number> {
  const { query, location, maxResults, category, minRating, onBatch, isCancelled } = opts
  const browser = await getBrowser()
  const ctx = await newContext(browser)
  const page = await ctx.newPage()

  let scraped = 0
  const batch: Partial<BusinessResult>[] = []

  try {
    const searchTerm = buildSearchTerm(query, category, location)
    await page.goto(
      `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}?hl=tr`,
      { waitUntil: 'domcontentloaded', timeout: 45000 },
    )

    // Consent screen (mostly EU). Best-effort.
    try {
      const consent = page.locator(
        'button:has-text("Tümünü kabul et"), button:has-text("Accept all"), form[action*="consent"] button',
      )
      if (await consent.first().isVisible({ timeout: 4000 })) {
        await consent.first().click()
        await page.waitForLoadState('domcontentloaded')
      }
    } catch { /* no consent screen */ }

    await page.waitForSelector('[role="feed"]', { timeout: 20000 })

    // Scroll the feed to lazy-load results until we have enough URLs or the
    // list stops growing.
    const seen = new Set<string>()
    let staleRounds = 0
    while (seen.size < maxResults && staleRounds < 4) {
      const hrefs = await page
        .locator('[role="feed"] a[href*="/maps/place/"]')
        .evaluateAll(els => (els as HTMLAnchorElement[]).map(a => a.href))
      const before = seen.size
      hrefs.forEach(h => seen.add(h))
      if (seen.size === before) staleRounds++
      else staleRounds = 0

      await page.locator('[role="feed"]').evaluate(el => el.scrollBy(0, el.scrollHeight)).catch(() => {})
      await sleep(900 + Math.random() * 600) // jittered to look less robotic
    }

    const urls = [...seen].slice(0, maxResults)

    for (const url of urls) {
      if (await isCancelled?.()) break

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {})
        await sleep(1200 + Math.random() * 800)
        await page.addScriptTag({ content: EXTRACTOR_SOURCE })

        const data = (await page.evaluate(() => {
          const g = globalThis as unknown as { __extract: (el: Element) => unknown }
          const panel = document.querySelector('[role="main"]') ?? document.body
          return g.__extract(panel)
        })) as Partial<BusinessResult>

        const passesRating = !minRating || (data?.rating != null && data.rating >= minRating)
        if (data?.name && data.name !== 'Bilinmiyor' && passesRating) {
          batch.push(data)
          scraped++
          if (batch.length >= config.insertBatchSize) {
            await onBatch(batch.splice(0, batch.length))
          }
        }
      } catch (err) {
        console.error(`[scrape] failed ${url}:`, err instanceof Error ? err.message : err)
      }
    }

    if (batch.length > 0) await onBatch(batch.splice(0, batch.length))
    return scraped
  } finally {
    await ctx.close()
  }
}
