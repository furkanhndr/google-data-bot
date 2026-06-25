import { describe, it, expect } from 'vitest'
import { buildSearchTerm } from './search-term.ts'

describe('buildSearchTerm', () => {
  it('joins query and location when no category', () => {
    expect(buildSearchTerm('Diş kliniği', null, 'mersin')).toBe('Diş kliniği mersin')
  })

  it('appends category when it is not already in the query', () => {
    expect(buildSearchTerm('en iyi', 'Restoran', 'Çeşme')).toBe('en iyi Restoran Çeşme')
  })

  it('de-duplicates a category already present in the query (case-insensitive)', () => {
    expect(buildSearchTerm('kafe', 'Kafe', 'Kadıköy')).toBe('kafe Kadıköy')
    expect(buildSearchTerm('Restoran', 'Restoran', 'Çeşme')).toBe('Restoran Çeşme')
  })

  it('ignores empty/undefined category', () => {
    expect(buildSearchTerm('avukat', undefined, 'Ankara')).toBe('avukat Ankara')
    expect(buildSearchTerm('avukat', '', 'Ankara')).toBe('avukat Ankara')
  })
})
