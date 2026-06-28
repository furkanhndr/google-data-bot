import type { UserPlan } from '@googlebusinessdata/shared-types'
import {
  PLACES_MAX_RESULTS,
  PLACES_PAGE_SIZE,
  PLACES_TEXT_SEARCH_COST_PER_REQUEST_USD,
} from './constants'

export const PLAN_LIMITS = {
  free: {
    credits: 100,
    maxResultsPerJob: PLACES_MAX_RESULTS,
    dailyJobs: 5,
    dailyEmails: 20,
  },
  premium: {
    credits: Infinity,
    maxResultsPerJob: PLACES_MAX_RESULTS,
    dailyJobs: 50,
    dailyEmails: 200,
  },
} as const

export function getPlanCreditsTotal(plan: UserPlan, storedCreditsTotal: number): number {
  return plan === 'premium' ? Infinity : storedCreditsTotal
}

export function getPlanMaxResults(plan: UserPlan): number {
  return PLAN_LIMITS[plan]?.maxResultsPerJob ?? PLAN_LIMITS.free.maxResultsPerJob
}

export function getPlanDailyJobLimit(plan: UserPlan): number {
  return PLAN_LIMITS[plan]?.dailyJobs ?? PLAN_LIMITS.free.dailyJobs
}

export function getPlanDailyEmailLimit(plan: UserPlan): number {
  return PLAN_LIMITS[plan]?.dailyEmails ?? PLAN_LIMITS.free.dailyEmails
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

export function estimatePlacesRequests(maxResults: number): number {
  const safeResults = Math.max(1, Math.min(PLACES_MAX_RESULTS, Math.ceil(maxResults)))
  return Math.ceil(safeResults / PLACES_PAGE_SIZE)
}

export function estimatePlacesCostUsd(maxResults: number): number {
  return estimatePlacesRequests(maxResults) * PLACES_TEXT_SEARCH_COST_PER_REQUEST_USD
}
