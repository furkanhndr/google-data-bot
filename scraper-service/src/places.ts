import type { BusinessResult } from '@googlebusinessdata/shared-types'
import type { ScrapeOptions } from './scraper.ts'
import { buildSearchTerm } from './search-term.ts'
import { mapPlace, type PlacesPlace } from './place-mapper.ts'
import { config } from './config.ts'

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const PAGE_SIZE = 20          // Places API max per page
const HARD_CAP  = 60          // Places API max total results per query
const PAGE_DELAY_MS = 1500    // let nextPageToken become valid

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Only request the fields we actually map — the field mask determines the
// billing SKU, so requesting less = cheaper.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryTypeDisplayName',
  'places.types',
  'places.businessStatus',
  'places.googleMapsUri',
  'places.regularOpeningHours',
  'places.plusCode',
  'nextPageToken',
].join(',')

// Collects business results via the official Google Places API (Text Search New).
// Same signature as scrape() so the worker can use either provider.
export async function searchPlaces(opts: ScrapeOptions): Promise<number> {
  const { query, location, maxResults, category, minRating, onBatch, isCancelled } = opts
  if (!config.placesApiKey) throw new Error('PLACES_API_KEY is not set')

  const textQuery = buildSearchTerm(query, category, location)
  const cap = Math.min(maxResults, HARD_CAP)

  let collected = 0
  let pageToken: string | undefined

  while (collected < cap) {
    if (await isCancelled?.()) break

    const res = await fetch(TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': config.placesApiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'tr',
        regionCode: 'TR',
        pageSize: Math.min(PAGE_SIZE, cap - collected),
        ...(pageToken ? { pageToken } : {}),
      }),
    })

    if (!res.ok) {
      throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 300)}`)
    }

    const data = await res.json() as { places?: PlacesPlace[]; nextPageToken?: string }
    const batch: Partial<BusinessResult>[] = []

    for (const place of data.places ?? []) {
      const row = mapPlace(place)
      if (minRating && (row.rating == null || row.rating < minRating)) continue
      batch.push(row)
      collected++
      if (collected >= cap) break
    }

    if (batch.length > 0) await onBatch(batch)

    pageToken = data.nextPageToken
    if (!pageToken || collected >= cap) break
    await sleep(PAGE_DELAY_MS)
  }

  return collected
}
