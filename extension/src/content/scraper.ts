import { sendToBackground } from '../lib/messaging'
import { getActiveJobId } from '../lib/storage'
import { ResultsObserver } from './observer'
import { extractBusinessData } from './extractor'
import type { BusinessResult } from '@googlebusinessdata/shared-types'

const BATCH_SIZE     = 10
const DETAIL_WAIT_MS = 1800   // wait for detail panel to fully render
const SCROLL_WAIT_MS = 600    // wait after scroll before looking for new cards

let isRunning  = false
let cancelFlag = false
let jobId: string | null = null

const pendingBatch: Partial<BusinessResult>[] = []
const processedUrls = new Set<string>()

// ── Entry point — called when page loads ────────────────────────────────────
async function init() {
  // Check if there is a pending job waiting for this tab
  const activeJobId = await getActiveJobId()
  if (!activeJobId) return

  jobId = activeJobId
  await startScraping(jobId)
}

// ── Listen for cancel signal from popup ─────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'CANCEL_JOB') {
    cancelFlag = true
  }
})

// ── Main scraping loop ───────────────────────────────────────────────────────
async function startScraping(jId: string) {
  if (isRunning) return
  isRunning  = true
  cancelFlag = false

  await sendToBackground({ type: 'JOB_STARTED', jobId: jId })

  try {
    const observer = new ResultsObserver(async (card) => {
      if (cancelFlag) return
      await processCard(card, jId)
    })

    observer.start()

    // Scroll to load all results
    await scrollToLoadAll(observer)

    // Flush remaining batch
    if (pendingBatch.length > 0) {
      await flushBatch(jId)
    }

    if (!cancelFlag) {
      await sendToBackground({
        type: 'JOB_COMPLETED',
        jobId: jId,
        totalCount: processedUrls.size,
      })
    }

    observer.stop()
  } catch (err) {
    await sendToBackground({
      type: 'JOB_FAILED',
      jobId: jId,
      error: err instanceof Error ? err.message : String(err),
    })
  } finally {
    isRunning = false
  }
}

// ── Process a single result card ─────────────────────────────────────────────
async function processCard(card: Element, jId: string) {
  // Click the card to open detail panel
  const link = card.querySelector('a') ?? (card as HTMLElement)
  const href = link instanceof HTMLAnchorElement ? link.href : null

  if (href && processedUrls.has(href)) return
  if (href) processedUrls.add(href)

  ;(link as HTMLElement).click?.()
  await sleep(DETAIL_WAIT_MS)

  // Find the detail panel
  const panel = document.querySelector('[role="main"]') ?? document.body
  const data = extractBusinessData(panel)

  if (!data.name || data.name === 'Bilinmiyor') return

  pendingBatch.push(data)

  if (pendingBatch.length >= BATCH_SIZE) {
    await flushBatch(jId)
  }
}

// ── Flush batch to service worker ────────────────────────────────────────────
async function flushBatch(jId: string) {
  const batch = pendingBatch.splice(0, pendingBatch.length)
  if (batch.length === 0) return

  await sendToBackground({
    type:    'RESULT_BATCH',
    jobId:   jId,
    results: batch,
  })
}

// ── Scroll the results list to trigger lazy loading ──────────────────────────
async function scrollToLoadAll(_observer: ResultsObserver) {
  const container = document.querySelector(
    '[role="feed"], .m6QErb[aria-label], .DxyBCb'
  )
  if (!container) return

  let prevCount = 0
  let staleRounds = 0

  while (!cancelFlag) {
    container.scrollTop = container.scrollHeight
    await sleep(SCROLL_WAIT_MS)

    const current = processedUrls.size
    if (current === prevCount) {
      staleRounds++
      if (staleRounds >= 3) break  // no new results after 3 attempts
    } else {
      staleRounds = 0
    }
    prevCount = current
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Bootstrap
init().catch(console.error)

export {}
