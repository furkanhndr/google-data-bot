import type { UserPlan } from '@googlebusinessdata/shared-types'

export const PLAN_LIMITS = {
  free: {
    credits: 100,
    maxResultsPerJob: 100,
  },
  premium: {
    credits: Infinity,
    maxResultsPerJob: 5000,
  },
} as const

export function getPlanCreditsTotal(plan: UserPlan, storedCreditsTotal: number): number {
  return plan === 'premium' ? Infinity : storedCreditsTotal
}

export function getPlanMaxResults(plan: UserPlan): number {
  return PLAN_LIMITS[plan]?.maxResultsPerJob ?? PLAN_LIMITS.free.maxResultsPerJob
}

export function formatPlanCreditsTotal(plan: UserPlan, storedCreditsTotal: number): string {
  return plan === 'premium' ? '∞' : String(storedCreditsTotal)
}

export function getCreditsRemaining(plan: UserPlan, creditsUsed: number, storedCreditsTotal: number): number {
  return plan === 'premium' ? Infinity : Math.max(0, storedCreditsTotal - creditsUsed)
}

export function getCreditsPercent(plan: UserPlan, creditsUsed: number, storedCreditsTotal: number): number {
  if (plan === 'premium') return 100
  if (storedCreditsTotal <= 0) return 0
  return Math.min(100, Math.round((creditsUsed / storedCreditsTotal) * 100))
}
