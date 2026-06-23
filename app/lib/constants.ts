// ── Theme ────────────────────────────────────────────────────
export const COLORS = {
  primary:        '#2563EB',
  primaryHover:   '#1D4ED8',
  primaryLight:   '#EFF6FF',
  secondary:      '#64748B',
  success:        '#16A34A',
  successLight:   '#F0FDF4',
  warning:        '#D97706',
  warningLight:   '#FFFBEB',
  danger:         '#DC2626',
  dangerLight:    '#FEF2F2',
  bg:             '#F8FAFC',
  bgCard:         '#FFFFFF',
  border:         '#E2E8F0',
  borderFocus:    '#2563EB',
  text:           '#0F172A',
  textMuted:      '#64748B',
  textLight:      '#94A3B8',
  sidebar:        '#1E293B',
  sidebarText:    '#CBD5E1',
  sidebarActive:  '#2563EB',
  adminSidebar:   '#0F172A',
} as const

export const SPACING = {
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '32px',
  xxl: '48px',
} as const

export const FONT_SIZE = {
  xs:   '12px',
  sm:   '14px',
  base: '16px',
  lg:   '18px',
  xl:   '20px',
  '2xl':'24px',
  '3xl':'30px',
} as const

export const RADIUS = {
  sm:  '4px',
  md:  '8px',
  lg:  '12px',
  xl:  '16px',
  full:'9999px',
} as const

export const SHADOW = {
  sm:  '0 1px 2px rgba(0,0,0,0.05)',
  md:  '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg:  '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
} as const

// ── Plan limits ──────────────────────────────────────────────
export const PLAN_LIMITS = {
  free:    { credits: 100,      maxResultsPerJob: 100 },
  premium: { credits: Infinity, maxResultsPerJob: 5000 },
} as const

// ── Scraping ─────────────────────────────────────────────────
export const SCRAPE_BATCH_SIZE = 10
export const MAX_RESULTS_FREE  = 100
export const MAX_RESULTS_PREMIUM = 5000

// ── Export ───────────────────────────────────────────────────
export const EXPORT_SIGNED_URL_EXPIRY = 60 * 60 // 1 hour in seconds

// ── Email enrichment ─────────────────────────────────────────
// Bounded per-request so a single serverless invocation never times out.
// The dashboard calls the endpoint repeatedly until `remaining` reaches 0.
export const ENRICH_BATCH_SIZE  = 40   // websites crawled per API request
export const ENRICH_CONCURRENCY = 5    // simultaneous site fetches

// ── Business result fields (for export column ordering) ──────
export const EXPORT_COLUMNS = [
  'name', 'category', 'phone', 'email', 'email_status', 'website',
  'address_full', 'city', 'state', 'country', 'postal_code',
  'rating', 'review_count', 'price_level',
  'social_facebook', 'social_instagram', 'social_twitter',
  'social_linkedin', 'social_youtube', 'social_tiktok',
  'description', 'menu_url', 'booking_url', 'order_url',
  'maps_url', 'place_id', 'latitude', 'longitude',
  'is_permanently_closed', 'is_temporarily_closed',
  'scraped_at',
] as const
