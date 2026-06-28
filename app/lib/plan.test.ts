import { describe, expect, it } from 'vitest'
import {
  estimatePlacesCostUsd,
  estimatePlacesRequests,
  formatPlanCreditsTotal,
  getCreditsPercent,
  getCreditsRemaining,
  getEffectivePlan,
  getPlanDailyJobLimit,
  getPlanCreditsTotal,
  getPlanMaxResults,
} from './plan'

describe('plan helpers', () => {
  it('returns Infinity for premium credits total', () => {
    expect(getPlanCreditsTotal('premium', 100)).toBe(Infinity)
    expect(formatPlanCreditsTotal('premium', 100)).toBe('∞')
  })

  it('returns stored credits for free plan', () => {
    expect(getPlanCreditsTotal('free', 100)).toBe(100)
    expect(formatPlanCreditsTotal('free', 100)).toBe('100')
  })

  it('calculates remaining credits correctly', () => {
    expect(getCreditsRemaining('free', 20, 100)).toBe(80)
    expect(getCreditsRemaining('premium', 1000, 100)).toBe(Infinity)
  })

  it('calculates credit usage percent correctly', () => {
    expect(getCreditsPercent('free', 25, 100)).toBe(25)
    expect(getCreditsPercent('premium', 25, 100)).toBe(100)
    expect(getCreditsPercent('free', 0, 0)).toBe(0)
  })

  it('uses Places API limits for per-job results', () => {
    expect(getPlanMaxResults('free')).toBe(60)
    expect(getPlanMaxResults('premium')).toBe(60)
  })

  it('returns daily job limits by plan', () => {
    expect(getPlanDailyJobLimit('free')).toBe(5)
    expect(getPlanDailyJobLimit('premium')).toBe(50)
  })

  it('estimates Places API requests and cost', () => {
    expect(estimatePlacesRequests(1)).toBe(1)
    expect(estimatePlacesRequests(20)).toBe(1)
    expect(estimatePlacesRequests(21)).toBe(2)
    expect(estimatePlacesRequests(60)).toBe(3)
    expect(estimatePlacesCostUsd(60)).toBeCloseTo(0.096)
  })

  describe('getEffectivePlan', () => {
    it('is always free when the stored plan is free', () => {
      expect(getEffectivePlan('free', null)).toBe('free')
      expect(getEffectivePlan('free', new Date(Date.now() + 86400000).toISOString())).toBe('free')
    })

    it('treats a null expiry as a permanent (e.g. admin-granted) premium', () => {
      expect(getEffectivePlan('premium', null)).toBe('premium')
    })

    it('is premium while premium_until is in the future', () => {
      const future = new Date(Date.now() + 86400000).toISOString()
      expect(getEffectivePlan('premium', future)).toBe('premium')
    })

    it('falls back to free once premium_until has passed', () => {
      const past = new Date(Date.now() - 86400000).toISOString()
      expect(getEffectivePlan('premium', past)).toBe('free')
    })
  })
})
