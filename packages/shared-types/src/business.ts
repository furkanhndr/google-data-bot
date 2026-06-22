export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type JobSource = 'extension' | 'places_api'
export type ExportFormat = 'csv' | 'xlsx'

export interface JobFilters {
  max_results?: number
  min_rating?: number
  category?: string
  open_now?: boolean
}

export interface ScrapingJob {
  id: string
  user_id: string
  query: string
  location: string
  filters: JobFilters
  status: JobStatus
  total_found: number
  scraped_count: number
  error_message: string | null
  source: JobSource
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface BusinessHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface BusinessAttributes {
  wheelchair_accessible?: boolean
  has_wifi?: boolean
  accepts_credit_cards?: boolean
  accepts_cash_only?: boolean
  has_parking?: boolean
  has_outdoor_seating?: boolean
  [key: string]: boolean | string | undefined
}

export interface BusinessResult {
  id: string
  job_id: string
  user_id: string

  // Core identity
  place_id: string | null
  name: string
  category: string | null
  sub_categories: string[] | null

  // Contact
  phone: string | null
  phone_secondary: string | null
  email: string | null
  email_secondary: string | null
  website: string | null

  // Location
  address_full: string | null
  street: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  plus_code: string | null

  // Quality signals
  rating: number | null
  review_count: number | null
  price_level: string | null

  // Hours
  hours: BusinessHours | null
  is_permanently_closed: boolean
  is_temporarily_closed: boolean

  // Social media
  social_facebook: string | null
  social_instagram: string | null
  social_twitter: string | null
  social_linkedin: string | null
  social_youtube: string | null
  social_tiktok: string | null

  // Rich content
  description: string | null
  menu_url: string | null
  booking_url: string | null
  order_url: string | null
  photos_count: number | null
  thumbnail_url: string | null

  // Google-specific
  maps_url: string | null
  claimed: boolean | null
  attributes: BusinessAttributes | null

  // Metadata
  scraped_at: string
  raw_data: Record<string, unknown> | null
}

export interface ExportHistory {
  id: string
  user_id: string
  job_id: string | null
  format: ExportFormat
  row_count: number
  file_size_bytes: number | null
  storage_path: string | null
  download_url: string | null
  created_at: string
  expires_at: string | null
}

export interface PlacesApiQuota {
  id: string
  date: string
  requests_made: number
  cost_usd: number
  created_at: string
}
