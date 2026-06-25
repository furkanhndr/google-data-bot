import { describe, it, expect } from 'vitest'
import { extractCity, extractPostalCode } from './extractor'

describe('extractPostalCode', () => {
  it('finds a 5-digit Turkish postal code in an address', () => {
    expect(extractPostalCode('Osmanağa, Piri Çavuş Sk. No:22, 34714 Kadıköy/İstanbul')).toBe('34714')
  })
  it('returns null when there is no postal code', () => {
    expect(extractPostalCode('Moda Cd. No:1, Kadıköy')).toBeNull()
    expect(extractPostalCode(null)).toBeNull()
  })
})

describe('extractCity', () => {
  it('returns the second-to-last comma-separated part', () => {
    expect(extractCity('A, B, C')).toBe('B')
  })
  it('returns null for single-part or empty addresses', () => {
    expect(extractCity('TekParça')).toBeNull()
    expect(extractCity(null)).toBeNull()
  })
})
