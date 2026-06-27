import { describe, it, expect } from 'vitest'
import { mapPlace, buildSearchTerm } from './places'

describe('buildSearchTerm', () => {
  it('joins query and location, de-duping a category already in the query', () => {
    expect(buildSearchTerm('Diş kliniği', null, 'Mersin')).toBe('Diş kliniği Mersin')
    expect(buildSearchTerm('en iyi', 'Restoran', 'Çeşme')).toBe('en iyi Restoran Çeşme')
    expect(buildSearchTerm('kafe', 'Kafe', 'Kadıköy')).toBe('kafe Kadıköy')
  })
})

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
    })
    expect(r.place_id).toBe('ChIJxyz')
    expect(r.name).toBe('Tax Meyhane')
    expect(r.category).toBe('Türk restoranı')
    expect(r.phone).toBe('0533 930 64 85')
    expect(r.postal_code).toBe('35930')
    expect(r.rating).toBe(4.9)
    expect(r.price_level).toBe('₺₺₺')
    expect(r.is_permanently_closed).toBe(false)
  })

  it('uses first type as category fallback and international phone fallback', () => {
    const r = mapPlace({ displayName: { text: 'X' }, types: ['restaurant'], internationalPhoneNumber: '+90 232 712 24 90' })
    expect(r.category).toBe('restaurant')
    expect(r.phone).toBe('+90 232 712 24 90')
  })

  it('maps weekday hours starting Monday and flags closed', () => {
    expect(mapPlace({ regularOpeningHours: { weekdayDescriptions: ['Pazartesi: 09:00–17:00'] } }).hours)
      .toEqual({ monday: '09:00–17:00' })
    expect(mapPlace({ businessStatus: 'CLOSED_PERMANENTLY' }).is_permanently_closed).toBe(true)
  })

  it('handles missing fields', () => {
    const r = mapPlace({})
    expect(r.name).toBe('Bilinmiyor')
    expect(r.phone).toBeNull()
    expect(r.hours).toBeNull()
  })
})
