import { describe, expect, it } from 'vitest'
import {
  formatPlanCreditsTotal,
  getCreditsPercent,
  getCreditsRemaining,
  getPlanCreditsTotal,
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
})
