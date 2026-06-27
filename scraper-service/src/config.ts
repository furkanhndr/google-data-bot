// Runtime configuration, read once from the environment.

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const config = {
  supabaseUrl:        required('SUPABASE_URL'),
  supabaseServiceKey: required('SUPABASE_SERVICE_ROLE_KEY'),

  // Data source: 'places' = official Google Places API (default),
  // 'scrape' = legacy Playwright scraping (kept but disabled by default).
  provider:     (process.env.SCRAPE_PROVIDER ?? 'places') as 'places' | 'scrape',
  placesApiKey: process.env.PLACES_API_KEY,

  // Empty string → run without a proxy (direct connection).
  proxyServer:    process.env.PROXY_SERVER?.trim() || undefined,

  jobConcurrency: Number(process.env.JOB_CONCURRENCY ?? 2),
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 5000),
  headless:       (process.env.HEADLESS ?? 'true') !== 'false',

  // How many result rows to insert per DB call.
  insertBatchSize: 20,

  // Run website email enrichment automatically after a job completes.
  autoEnrich:       (process.env.AUTO_ENRICH ?? 'true') !== 'false',
  enrichConcurrency: Number(process.env.ENRICH_CONCURRENCY ?? 5),
} as const
