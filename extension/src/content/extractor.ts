import type { BusinessResult } from '@googlebusinessdata/shared-types'

// Helper: try multiple selectors, return first match
function q(el: Element, ...selectors: string[]): Element | null {
  for (const s of selectors) {
    const found = el.querySelector(s)
    if (found) return found
  }
  return null
}

function qAll(el: Element, ...selectors: string[]): Element[] {
  for (const s of selectors) {
    const found = Array.from(el.querySelectorAll(s))
    if (found.length > 0) return found
  }
  return []
}

function text(el: Element | null): string | null {
  if (!el) return null
  const t = el.textContent?.trim()
  return t || null
}

function attr(el: Element | null, name: string): string | null {
  if (!el) return null
  return el.getAttribute(name) ?? null
}

// ── Individual field extractors ───────────────────────────────────────────────

export function extractName(panel: Element): string {
  return text(q(panel,
    'h1[class*="fontHeadlineLarge"]',
    'h1.DUwDvf',
    'h1[jstcache]',
    '[data-attrid="title"] span',
    '.qBF1Pd',
  )) ?? 'Bilinmiyor'
}

export function extractCategory(panel: Element): string | null {
  return text(q(panel,
    'button[jsaction*="category"]',
    '.DkEaL',
    '[jsaction*="pane.rating.category"]',
    '.mgr77e button',
  ))
}

export function extractRating(panel: Element): number | null {
  // Read from the rating block / its aria-label. We parse the first decimal
  // number out of the text instead of trusting a single element, because some
  // matching elements exist but are empty (e.g. span.ceNzKf), which would
  // otherwise shadow the real value.
  const el = q(panel,
    '[role="img"][aria-label*="yıldız"]',
    '[role="img"][aria-label*="star"]',
    'div.F7nice',
    'span.ceNzKf',
    '.MW4etd',
  )
  if (!el) return null
  const source = el.getAttribute('aria-label') ?? text(el) ?? ''
  const match = source.match(/(\d+[.,]\d+)/)
  if (!match) return null
  const val = parseFloat(match[1].replace(',', '.'))
  return isNaN(val) || val < 0 || val > 5 ? null : val
}

export function extractReviewCount(panel: Element): number | null {
  const el = q(panel,
    'span[aria-label*="yorum"]',
    'span[aria-label*="review"]',
    '.RDApEe span',
    'span.UY7F9',
  )
  if (!el) return null
  const raw = text(el)?.replace(/[^0-9]/g, '') ?? ''
  const val = parseInt(raw)
  return isNaN(val) ? null : val
}

export function extractPhone(panel: Element): string | null {
  // Google exposes the phone on a dedicated action button. The aria-label
  // ("Telefon: 0533 966 53 69") is the cleanest source; data-item-id
  // ("phone:tel:05339665369") is the fallback. We deliberately do NOT scan
  // the whole panel for digit runs — that produced false positives from
  // plus codes, coordinates and review counts.
  const btn = q(panel,
    '[data-item-id^="phone"]',
    'button[data-item-id*="phone"]',
    '[aria-label^="Telefon:"]',
    '[aria-label^="Phone:"]',
  )
  if (!btn) return null

  const aria = attr(btn, 'aria-label')
  if (aria && /\d/.test(aria)) {
    const cleaned = aria.split(':').slice(1).join(':').trim()
    if (cleaned) return cleaned
  }

  const tel = attr(btn, 'data-item-id')?.match(/tel:(.+)$/)?.[1]
  if (tel) return tel

  return text(btn)
}

export function extractWebsite(panel: Element): string | null {
  const el = q(panel,
    'a[data-item-id*="authority"]',
    'a[aria-label*="Web sitesi"]',
    'a[aria-label*="Website"]',
    '[data-tooltip*="web"]',
  )
  return attr(el, 'href')
}

export function extractAddress(panel: Element): string | null {
  const el = q(panel,
    '[data-item-id="address"]',
    'button[data-item-id*="address"]',
    '[aria-label*="Adres"]',
    '.rogA2c',
  )
  if (el) return text(el)

  // Try aria-label on address button
  const btn = q(panel, 'button[data-tooltip*="Kopyala"]')
  return btn ? text(btn) : null
}

export function extractCity(address: string | null): string | null {
  if (!address) return null
  // Turkish city detection: last significant token before postal code or country
  const parts = address.split(',').map(s => s.trim())
  if (parts.length >= 2) return parts[parts.length - 2] ?? null
  return null
}

export function extractPostalCode(address: string | null): string | null {
  if (!address) return null
  const match = address.match(/\b\d{5}\b/)
  return match ? match[0] : null
}

export function extractHours(panel: Element): Record<string, string> | null {
  const table = q(panel,
    'table.eK4R0e',
    '[jsaction*="openhours"]',
    '.t39EBf',
  )
  if (!table) return null

  const rows = qAll(table, 'tr', 'li')
  if (rows.length === 0) return null

  const days: Record<string, string> = {}
  const dayMap: Record<string, string> = {
    'Pazartesi': 'monday', 'Salı': 'tuesday', 'Çarşamba': 'wednesday',
    'Perşembe': 'thursday', 'Cuma': 'friday', 'Cumartesi': 'saturday', 'Pazar': 'sunday',
    'Monday': 'monday', 'Tuesday': 'tuesday', 'Wednesday': 'wednesday',
    'Thursday': 'thursday', 'Friday': 'friday', 'Saturday': 'saturday', 'Sunday': 'sunday',
  }

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td, li'))
    if (cells.length >= 2) {
      const dayRaw = text(cells[0]) ?? ''
      const hours  = text(cells[1]) ?? ''
      const dayKey = Object.entries(dayMap).find(([k]) => dayRaw.includes(k))?.[1]
      if (dayKey) days[dayKey] = hours
    }
  }

  return Object.keys(days).length > 0 ? days : null
}

export function extractPriceLevel(panel: Element): string | null {
  const el = q(panel, '[aria-label*="Fiyat"]', '[aria-label*="Price"]')
  if (!el) return null
  const label = attr(el, 'aria-label') ?? text(el) ?? ''
  const match = label.match(/[$₺€£]{1,4}/)
  return match ? match[0] : null
}

export function extractDescription(panel: Element): string | null {
  return text(q(panel,
    '.PYvSYb',
    '[data-attrid*="description"]',
    '.HlvSq',
    'div[jsname="MZnM8e"]',
  ))
}

export function extractMapsUrl(_panel: Element): string | null {
  return window.location.href
}

export function extractPlaceId(panel: Element): string | null {
  // Place ID is embedded in the URL: /maps/place/.../@lat,lng,...,data=...!4m...!3m...!1s<PLACE_ID>
  const match = window.location.href.match(/!1s([\w-]+%3A[\w-]+)/)
  if (match) return decodeURIComponent(match[1])

  // Also check aria-labels and data attributes
  const el = q(panel, '[data-placeid]', '[data-fid]')
  return el ? (attr(el, 'data-placeid') ?? attr(el, 'data-fid')) : null
}

export function extractCoordinates(_panel: Element): { lat: number | null; lng: number | null } {
  const match = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  return { lat: null, lng: null }
}

export function extractSocialLinks(panel: Element): Record<string, string | null> {
  const links = qAll(panel, 'a[href*="facebook"]', 'a[href*="instagram"]',
    'a[href*="twitter"]', 'a[href*="linkedin"]',
    'a[href*="youtube"]', 'a[href*="tiktok"]')

  const social: Record<string, string | null> = {
    social_facebook: null, social_instagram: null, social_twitter: null,
    social_linkedin: null, social_youtube: null,   social_tiktok: null,
  }

  for (const link of links) {
    const href = attr(link, 'href') ?? ''
    if (href.includes('facebook'))  social.social_facebook  = href
    else if (href.includes('instagram')) social.social_instagram = href
    else if (href.includes('twitter'))   social.social_twitter   = href
    else if (href.includes('linkedin'))  social.social_linkedin  = href
    else if (href.includes('youtube'))   social.social_youtube   = href
    else if (href.includes('tiktok'))    social.social_tiktok    = href
  }

  return social
}

export function extractThumbnail(panel: Element): string | null {
  const img = q(panel, 'img.t7Y8Ed', 'img.aoRNLd', 'button[jsaction*="photo"] img')
  return attr(img, 'src')
}

export function extractIsClosed(panel: Element): { permanently: boolean; temporarily: boolean } {
  const allText = panel.textContent?.toLowerCase() ?? ''
  return {
    permanently: allText.includes('kalıcı olarak kapatıldı') || allText.includes('permanently closed'),
    temporarily: allText.includes('geçici olarak kapatıldı') || allText.includes('temporarily closed'),
  }
}

export function extractMenuUrl(panel: Element): string | null {
  const el = q(panel, 'a[aria-label*="Menü"]', 'a[data-item-id*="menu"]', 'a[href*="menu"]')
  return attr(el, 'href')
}

export function extractBookingUrl(panel: Element): string | null {
  const el = q(panel, 'a[aria-label*="Rezerv"]', 'a[data-item-id*="book"]', 'a[href*="reserve"]', 'a[href*="booking"]')
  return attr(el, 'href')
}

// ── Master extractor — combines all field extractors ─────────────────────────
export function extractBusinessData(panel: Element): Partial<BusinessResult> {
  const address   = extractAddress(panel)
  const { lat, lng } = extractCoordinates(panel)
  const social    = extractSocialLinks(panel)
  const closed    = extractIsClosed(panel)

  return {
    place_id:               extractPlaceId(panel),
    name:                   extractName(panel),
    category:               extractCategory(panel),
    phone:                  extractPhone(panel),
    website:                extractWebsite(panel),
    address_full:           address,
    city:                   extractCity(address),
    postal_code:            extractPostalCode(address),
    rating:                 extractRating(panel),
    review_count:           extractReviewCount(panel),
    price_level:            extractPriceLevel(panel),
    hours:                  extractHours(panel),
    is_permanently_closed:  closed.permanently,
    is_temporarily_closed:  closed.temporarily,
    description:            extractDescription(panel),
    maps_url:               extractMapsUrl(panel),
    thumbnail_url:          extractThumbnail(panel),
    menu_url:               extractMenuUrl(panel),
    booking_url:            extractBookingUrl(panel),
    latitude:               lat,
    longitude:              lng,
    ...social,
  }
}
