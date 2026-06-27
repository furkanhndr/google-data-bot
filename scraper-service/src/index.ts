import { runWorkerLoop } from './worker.ts'
import { closeBrowser } from './scraper.ts'
import { config } from './config.ts'

async function shutdown(signal: string) {
  console.log(`\n[scraper-service] ${signal} — shutting down…`)
  await closeBrowser()
  process.exit(0)
}

process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

if (config.provider === 'places' && !config.placesApiKey) {
  console.error('[scraper-service] fatal: SCRAPE_PROVIDER=places ama PLACES_API_KEY tanımlı değil.')
  process.exit(1)
}

console.log('[scraper-service] starting', {
  provider: config.provider,
  concurrency: config.jobConcurrency,
  proxy: config.proxyServer ? 'on' : 'off',
})

runWorkerLoop().catch(err => {
  console.error('[scraper-service] fatal:', err)
  process.exit(1)
})
