// Watches the Google Maps results list for new cards appearing via virtual scroll.

type CardCallback = (card: Element) => void

const RESULT_ITEM_SELECTORS = [
  'div[jsaction*="mouseover:pane"]',
  '.Nv2PK',
  'div[data-result-index]',
  '[data-cid]',
]

function isResultCard(el: Element): boolean {
  return RESULT_ITEM_SELECTORS.some(s => el.matches(s))
}

export class ResultsObserver {
  private observer: MutationObserver | null = null
  private seen = new Set<Element>()

  constructor(private onNewCard: CardCallback) {}

  start() {
    // Find the scrollable results container
    const container = this.findContainer()
    if (!container) {
      console.warn('[Observer] Results container not found, retrying...')
      setTimeout(() => this.start(), 1500)
      return
    }

    // Emit already-present cards
    this.scanExisting(container)

    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue
          const el = node as Element

          if (isResultCard(el)) {
            this.emit(el)
          } else {
            // Check descendants
            RESULT_ITEM_SELECTORS.forEach(s => {
              el.querySelectorAll(s).forEach(child => this.emit(child))
            })
          }
        }
      }
    })

    this.observer.observe(container, { childList: true, subtree: true })
  }

  stop() {
    this.observer?.disconnect()
    this.observer = null
    this.seen.clear()
  }

  private emit(el: Element) {
    if (this.seen.has(el)) return
    this.seen.add(el)
    this.onNewCard(el)
  }

  private scanExisting(container: Element) {
    RESULT_ITEM_SELECTORS.forEach(s => {
      container.querySelectorAll(s).forEach(el => this.emit(el))
    })
  }

  private findContainer(): Element | null {
    const candidates = [
      '[role="feed"]',
      'div[aria-label*="Sonuçlar"]',
      'div[aria-label*="Results"]',
      '.m6QErb[aria-label]',
      '.DxyBCb',
    ]
    for (const s of candidates) {
      const el = document.querySelector(s)
      if (el) return el
    }
    return null
  }
}
