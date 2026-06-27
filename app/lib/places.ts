// Google Places API (New) — Text Search.
// Runs server-side inside Next.js API routes (Vercel), so the project needs no
// separate worker host. Places API is just an HTTPS call: no browser, no proxy,
// no ToS/scraping risk.

import type { BusinessResult } from '@googlebusinessdata/shared-types'

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const PAGE_SIZE = 20          // Places API max per page
const HARD_CAP  = 60          // Places API max total results per query
const PAGE_DELAY_MS = 1500    // let nextPageToken become valid

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// The field mask determines the billing SKU — request only what we map.
const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.location',
  'places.nationalPhoneNumber', 'places.internationalPhoneNumber', 'places.websiteUri',
  'places.rating', 'places.userRatingCount', 'places.priceLevel',
  'places.primaryTypeDisplayName', 'places.types', 'places.businessStatus',
  'places.googleMapsUri', 'places.regularOpeningHours', 'places.plusCode',
  'nextPageToken',
].join(',')

const PRICE_LEVEL: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Ücretsiz',
  PRICE_LEVEL_INEXPENSIVE: '₺',
  PRICE_LEVEL_MODERATE: '₺₺',
  PRICE_LEVEL_EXPENSIVE: '₺₺₺',
  PRICE_LEVEL_VERY_EXPENSIVE: '₺₺₺₺',
}

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface PlacesPlace {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  primaryTypeDisplayName?: { text?: string }
  types?: string[]
  businessStatus?: string
  googleMapsUri?: string
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  plusCode?: { globalCode?: string; compoundCode?: string }
}

export interface PlacesSearchFilters {
  max_results?: number
  min_rating?: number
  category?: string
}

// Builds the search term from query + optional category + location, de-duping
// a category already present in the query.
export function buildSearchTerm(query: string, category: string | null | undefined, location: string): string {
  const parts = [query]
  if (category && !query.toLowerCase().includes(category.toLowerCase())) parts.push(category)
  parts.push(location)
  return parts.join(' ').trim()
}

function cityFromAddress(address: string | null): string | null {
  if (!address) return null
  const parts = address.split(',').map(s => s.trim())
  return parts.length >= 2 ? parts[parts.length - 2] ?? null : null
}

function postalFromAddress(address: string | null): string | null {
  if (!address) return null
  const m = address.match(/\b\d{5}\b/)
  return m ? m[0] : null
}

function mapHours(weekdayDescriptions: string[] | undefined): Record<string, string> | null {
  if (!weekdayDescriptions?.length) return null
  const hours: Record<string, string> = {}
  weekdayDescriptions.forEach((line, i) => {
    const key = DAY_KEYS[i]
    if (!key) return
    const value = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : line.trim()
    if (value) hours[key] = value
  })
  return Object.keys(hours).length > 0 ? hours : null
}

export function mapPlace(place: PlacesPlace): Partial<BusinessResult> {
  const address = place.formattedAddress ?? null
  return {
    place_id:              place.id ?? null,
    name:                  place.displayName?.text ?? 'Bilinmiyor',
    category:              place.primaryTypeDisplayName?.text ?? place.types?.[0] ?? null,
    phone:                 place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null,
    website:               place.websiteUri ?? null,
    address_full:          address,
    city:                  cityFromAddress(address),
    postal_code:           postalFromAddress(address),
    latitude:              place.location?.latitude ?? null,
    longitude:             place.location?.longitude ?? null,
    rating:                place.rating ?? null,
    review_count:          place.userRatingCount ?? null,
    price_level:           place.priceLevel ? (PRICE_LEVEL[place.priceLevel] ?? null) : null,
    hours:                 mapHours(place.regularOpeningHours?.weekdayDescriptions),
    is_permanently_closed: place.businessStatus === 'CLOSED_PERMANENTLY',
    is_temporarily_closed: place.businessStatus === 'CLOSED_TEMPORARILY',
    maps_url:              place.googleMapsUri ?? null,
    plus_code:             place.plusCode?.globalCode ?? place.plusCode?.compoundCode ?? null,
  }
}

// Runs a Places Text Search and returns mapped business rows (max 60).
export async function searchPlaces(
  query: string,
  location: string,
  filters: PlacesSearchFilters = {},
  options: { onRequest?: () => void } = {},
): Promise<Partial<BusinessResult>[]> {
  const apiKey = process.env.PLACES_API_KEY
  if (!apiKey) throw new Error('PLACES_API_KEY is not set')

  const textQuery = buildSearchTerm(query, filters.category ?? null, location)
  const cap = Math.min(filters.max_results ?? HARD_CAP, HARD_CAP)
  const minRating = filters.min_rating

  const rows: Partial<BusinessResult>[] = []
  let pageToken: string | undefined

  while (rows.length < cap) {
    const res = await fetch(TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'tr',
        regionCode: 'TR',
        pageSize: Math.min(PAGE_SIZE, cap - rows.length),
        ...(pageToken ? { pageToken } : {}),
      }),
    })
    options.onRequest?.()

    if (!res.ok) {
      throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 300)}`)
    }

    const data = await res.json() as { places?: PlacesPlace[]; nextPageToken?: string }
    for (const place of data.places ?? []) {
      const row = mapPlace(place)
      if (minRating && (row.rating == null || row.rating < minRating)) continue
      rows.push(row)
      if (rows.length >= cap) break
    }

    pageToken = data.nextPageToken
    if (!pageToken || rows.length >= cap) break
    await sleep(PAGE_DELAY_MS)
  }

  return rows
}
