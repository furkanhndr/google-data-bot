export type UserRole = 'admin' | 'customer'
export type UserPlan = 'free' | 'premium'

export interface UserProfile {
  id: string
  role: UserRole
  plan: UserPlan
  credits_total: number
  credits_used: number
  display_name: string | null
  avatar_url: string | null
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface UserWithEmail extends UserProfile {
  email: string
}
