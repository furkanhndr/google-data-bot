import type { BusinessResult } from '@googlebusinessdata/shared-types'

// Pure mapping from a Google Places API (New) place object to our schema.
// Kept free of config/network imports so it is trivially unit-testable.

const PRICE_LEVEL: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Ücretsiz',
  PRICE_LEVEL_INEXPENSIVE: '₺',
  PRICE_LEVEL_MODERATE: '₺₺',
  PRICE_LEVEL_EXPENSIVE: '₺₺₺',
  PRICE_LEVEL_VERY_EXPENSIVE: '₺₺₺₺',
}

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export interface PlacesPlace {
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
