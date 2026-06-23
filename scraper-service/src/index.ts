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

console.log('[scraper-service] starting', {
  concurrency: config.jobConcurrency,
  proxy: config.proxyServer ? 'on' : 'off',
  headless: config.headless,
})

runWorkerLoop().catch(err => {
  console.error('[scraper-service] fatal:', err)
  process.exit(1)
})
