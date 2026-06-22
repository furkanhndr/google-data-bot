import { sendToBackground } from '../lib/messaging'
import type { ExtensionAuthStatus, ExtensionJobStatus } from '@googlebusinessdata/shared-types'

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

// ── DOM helpers ───────────────────────────────────────────────────────────────
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T
}
function show(id: string) { const e = el(id); if (e) e.style.display = '' }
function hide(id: string) { const e = el(id); if (e) e.style.display = 'none' }
function text(id: string, val: string) { const e = el(id); if (e) e.textContent = val }
function html(id: string, val: string) { const e = el(id); if (e) e.innerHTML = val }

const STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'badge-orange', label: 'Bekliyor' },
  running:   { cls: 'badge-blue',   label: 'Çalışıyor' },
  completed: { cls: 'badge-green',  label: 'Tamamlandı' },
  failed:    { cls: 'badge-red',    label: 'Hata' },
  cancelled: { cls: 'badge-gray',   label: 'İptal' },
}

// ── Render ────────────────────────────────────────────────────────────────────
async function render() {
  // Auth
  const auth = await sendToBackground({ type: 'GET_AUTH_STATUS' }) as ExtensionAuthStatus | null

  if (!auth?.isAuthenticated) {
    text('auth-email', 'Giriş yapılmamış')
    html('auth-badge', '<span class="badge badge-red">Çıkış</span>')
    text('header-sub', 'Bağlı değil')
    text('footer-credits', '—')
    show('btn-login')
    show('section-no-job')
    hide('section-job')
    hide('btn-cancel')
    el('btn-new-job').textContent = 'Giriş Yap'
    el('btn-new-job').onclick = () => openTab(`${APP_URL}/auth/login`)
    return
  }

  text('auth-email', auth.email ?? auth.userId ?? '—')
  html('auth-badge', '<span class="badge badge-green">Bağlı</span>')
  text('header-sub', auth.role === 'admin' ? 'Admin' : 'Kullanıcı')
  text('footer-credits', `${auth.creditsUsed ?? 0} / ${auth.creditsTotal ?? 100} kredi`)
  hide('btn-login')

  // Job status
  const jobStatus = await sendToBackground({ type: 'GET_JOB_STATUS' }) as ExtensionJobStatus | null

  const activeStatuses = ['running', 'pending'] as const
  if (jobStatus && (activeStatuses as readonly string[]).includes(jobStatus.status)) {
    show('section-job')
    hide('section-no-job')
    show('btn-cancel')

    // Populate job info from storage (we don't have query/location in session — show jobId)
    text('job-query', `İş #${jobStatus.jobId.slice(0, 8)}`)
    text('job-location', '—')

    const badge = STATUS_BADGES[jobStatus.status] ?? STATUS_BADGES.pending
    el('job-status-badge').className = `badge ${badge.cls}`
    text('job-status-badge', badge.label)

    text('stat-found',    String(jobStatus.totalFound))
    text('stat-scraped',  String(jobStatus.scrapedCount))
    text('stat-remaining', String(Math.max(0, jobStatus.totalFound - jobStatus.scrapedCount)))

    const pct = jobStatus.totalFound > 0
      ? Math.round((jobStatus.scrapedCount / jobStatus.totalFound) * 100)
      : 0
    const fill = el('progress-fill')
    if (fill) fill.style.width = `${pct}%`
    text('progress-text', `${pct}% tamamlandı`)

    el('btn-cancel').onclick = async () => {
      await sendToBackground({ type: 'CANCEL_JOB', jobId: jobStatus.jobId })
      render()
    }
  } else {
    hide('section-job')
    show('section-no-job')
    hide('btn-cancel')
  }

  el('btn-new-job').textContent = '+ Yeni İş'
  el('btn-new-job').onclick = () => openTab(`${APP_URL}/dashboard/jobs/new`)
}

function openTab(url: string) {
  chrome.tabs.create({ url })
}

// ── Event bindings ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  render()

  el('btn-dashboard').addEventListener('click', () => openTab(`${APP_URL}/dashboard`))
  el('btn-login').addEventListener('click',     () => openTab(`${APP_URL}/auth/login`))

  // Auto-refresh every 3s while popup is open
  setInterval(render, 3000)
})

export {}
