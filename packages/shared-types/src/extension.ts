import type { BusinessResult } from './business'
import type { UserPlan } from './user'

export type ExtensionMessage =
  | { type: 'JOB_STARTED'; jobId: string }
  | { type: 'RESULT_BATCH'; jobId: string; results: Partial<BusinessResult>[] }
  | { type: 'JOB_COMPLETED'; jobId: string; totalCount: number }
  | { type: 'JOB_FAILED'; jobId: string; error: string }
  | { type: 'GET_JOB_STATUS' }
  | { type: 'CANCEL_JOB'; jobId: string }
  | { type: 'GET_AUTH_STATUS' }
  | { type: 'AUTH_TOKEN_UPDATED'; accessToken: string; refreshToken: string }

export interface ExtensionJobStatus {
  jobId: string
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  scrapedCount: number
  totalFound: number
  startedAt: number | null
}

export interface ExtensionAuthStatus {
  isAuthenticated: boolean
  userId: string | null
  email: string | null
  role: string | null
  plan: UserPlan | null
  creditsTotal: number
  creditsUsed: number
}

export interface ExtensionStorage {
  access_token?: string
  refresh_token?: string
  user_id?: string
  active_job_id?: string
  job_status?: ExtensionJobStatus
}
