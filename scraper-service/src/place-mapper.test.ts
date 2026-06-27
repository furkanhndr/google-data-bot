import { describe, it, expect } from 'vitest'
import { mapPlace } from './place-mapper.ts'

describe('mapPlace', () => {
  it('maps core Places API fields to the BusinessResult schema', () => {
    const r = mapPlace({
      id: 'ChIJxyz',
      displayName: { text: 'Tax Meyhane' },
      formattedAddress: '16 Eylül, 3047. Sk. No:17A, 35930 Çeşme/İzmir',
      location: { latitude: 38.32, longitude: 26.30 },
      nationalPhoneNumber: '0533 930 64 85',
      websiteUri: 'https://taxrestaurant.com.tr/',
      rating: 4.9,
      userRatingCount: 230,
      priceLevel: 'PRICE_LEVEL_EXPENSIVE',
      primaryTypeDisplayName: { text: 'Türk restoranı' },
      businessStatus: 'OPERATIONAL',
      googleMapsUri: 'https://maps.google.com/?cid=1',
    })
    expect(r.place_id).toBe('ChIJxyz')
    expect(r.name).toBe('Tax Meyhane')
    expect(r.category).toBe('Türk restoranı')
    expect(r.phone).toBe('0533 930 64 85')
    expect(r.website).toBe('https://taxrestaurant.com.tr/')
    expect(r.city).toBe('3047. Sk. No:17A')          // second-to-last comma part
    expect(r.postal_code).toBe('35930')
    expect(r.rating).toBe(4.9)
    expect(r.review_count).toBe(230)
    expect(r.price_level).toBe('₺₺₺')
    expect(r.latitude).toBe(38.32)
    expect(r.is_permanently_closed).toBe(false)
  })

  it('falls back to first type when no primaryTypeDisplayName, and phone fallback', () => {
    const r = mapPlace({
      displayName: { text: 'X' },
      types: ['restaurant', 'food'],
      internationalPhoneNumber: '+90 232 712 24 90',
    })
    expect(r.category).toBe('restaurant')
    expect(r.phone).toBe('+90 232 712 24 90')
  })

  it('flags permanently/temporarily closed businesses', () => {
    expect(mapPlace({ businessStatus: 'CLOSED_PERMANENTLY' }).is_permanently_closed).toBe(true)
    expect(mapPlace({ businessStatus: 'CLOSED_TEMPORARILY' }).is_temporarily_closed).toBe(true)
  })

  it('maps weekday opening hours by day, starting Monday', () => {
    const r = mapPlace({
      regularOpeningHours: { weekdayDescriptions: [
        'Pazartesi: 09:00–17:00',
        'Salı: 09:00–17:00',
      ] },
    })
    expect(r.hours).toEqual({ monday: '09:00–17:00', tuesday: '09:00–17:00' })
  })

  it('handles missing fields gracefully', () => {
    const r = mapPlace({})
    expect(r.name).toBe('Bilinmiyor')
    expect(r.phone).toBeNull()
    expect(r.rating).toBeNull()
    expect(r.hours).toBeNull()
  })
})
