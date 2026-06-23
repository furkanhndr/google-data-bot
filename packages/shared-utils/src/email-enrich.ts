// Website-based email enrichment.
// Google Maps never exposes business emails, but most businesses link their
// own website. We fetch a few likely contact pages and extract an email.
// Shared by the Next.js app (on-demand endpoint) and the scraper service
// (automatic post-scrape enrichment).

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

// Paths to try, in order. Home page first, then common contact pages
// (English, Turkish, German cover most of the target audience).
const CONTACT_PATHS = ['', '/contact', '/contact-us', '/iletisim', '/about', '/hakkimizda', '/kontakt']

// File-extension-looking matches that the email regex catches by accident
// (e.g. "logo@2x.png", "sprite@2.svg").
const BAD_SUFFIX = /\.(png|jpe?g|gif|webp|svg|css|js|woff2?|ico)$/i

// Tracking / placeholder addresses that are never real business contacts.
const BLOCKED_DOMAINS = ['example.com', 'sentry.io', 'wix.com', 'wixpress.com', 'godaddy.com', 'cloudflare.com']

// Role-based prefixes are preferred — they are the public contact address.
const PREFERRED_PREFIXES = ['info', 'iletisim', 'contact', 'kontakt', 'hello', 'merhaba', 'sales', 'satis']

const FETCH_TIMEOUT_MS = 8000
const MAX_PAGES_PER_SITE = 3   // home + at most 2 contact pages that exist
const USER_AGENT = 'Mozilla/5.0 (compatible; LeadEnrichBot/1.0)'

export type EnrichOutcome =
  | { status: 'found'; email: string }
  | { status: 'not_found' }

function isValidEmail(email: string): boolean {
  const lower = email.toLowerCase()
  if (BAD_SUFFIX.test(lower)) return false
  const domain = lower.split('@')[1] ?? ''
  return !BLOCKED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))
}

function pickBest(emails: string[]): string {
  const unique = [...new Set(emails.map(e => e.toLowerCase()))]
  const preferred = unique.find(e =>
    PREFERRED_PREFIXES.some(p => e.startsWith(p + '@'))
  )
  return preferred ?? unique[0]
}

function extractFromHtml(html: string): string | null {
  // mailto: links are the most reliable signal. Exclude '<' in the capture and
  // re-match against EMAIL_RE so trailing junk (e.g. "addr@x.com<br>") is stripped.
  const mailtos = [...html.matchAll(/mailto:([^"'?<>\s]+)/gi)]
    .map(m => decodeURIComponent(m[1]).match(EMAIL_RE)?.[0] ?? '')
    .filter(Boolean)
    .filter(isValidEmail)
  if (mailtos.length) return pickBest(mailtos)

  const plain = (html.match(EMAIL_RE) ?? []).filter(isValidEmail)
  return plain.length ? pickBest(plain) : null
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('text/html')) return null
    return await res.text()
  } catch {
    return null   // timeout / DNS / network — caller moves on
  }
}

// Crawls a business website and returns the best email found, or not_found.
export async function findEmailForWebsite(website: string): Promise<EnrichOutcome> {
  let origin: string
  try {
    origin = new URL(website).origin
  } catch {
    return { status: 'not_found' }
  }

  let pagesFetched = 0
  for (const path of CONTACT_PATHS) {
    if (pagesFetched >= MAX_PAGES_PER_SITE) break
    const html = await fetchPage(origin + path)
    if (html == null) continue
    pagesFetched++

    const email = extractFromHtml(html)
    if (email) return { status: 'found', email }
  }

  return { status: 'not_found' }
}

// Runs `task` over `items` with a bounded number of concurrent workers.
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await task(items[index])
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker)
  await Promise.all(workers)
  return results
}
