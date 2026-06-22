import { getAuthenticatedClient, getSupabaseClient } from '../lib/supabase-client'
import { getAuthTokens, setAuthTokens, clearAuth, setActiveJobId, setJobStatus, getJobStatus } from '../lib/storage'
import { onMessage } from '../lib/messaging'
import type { ExtensionMessage, ExtensionJobStatus } from '@googlebusinessdata/shared-types'

const KEEPALIVE_ALARM = 'keepalive'
const BATCH_SIZE = 10

// ── Keepalive alarm — fires every 25s to prevent MV3 SW termination ─────────
chrome.alarms.create(KEEPALIVE_ALARM, { periodInMinutes: 0.4 })
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === KEEPALIVE_ALARM) {
    // no-op ping — just keeps the SW alive
  }
})

// ── Startup: restore session from storage ────────────────────────────────────
chrome.runtime.onStartup.addListener(restoreSession)
chrome.runtime.onInstalled.addListener(restoreSession)

async function restoreSession() {
  const { accessToken, refreshToken } = await getAuthTokens()
  if (accessToken && refreshToken) {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.setSession({
      access_token:  accessToken,
      refresh_token: refreshToken,
    })
    if (error || !data.session) {
      await clearAuth()
    }
  }
}

// ── Message handler ───────────────────────────────────────────────────────────
onMessage(async (msg: ExtensionMessage) => {
  switch (msg.type) {

    case 'AUTH_TOKEN_UPDATED': {
      const { accessToken, refreshToken } = msg
      const client = getSupabaseClient()
      const { data } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (data.user) {
        await setAuthTokens(accessToken, refreshToken, data.user.id)
      }
      return { ok: true }
    }

    case 'JOB_STARTED': {
      const status: ExtensionJobStatus = {
        jobId:       msg.jobId,
        status:      'running',
        scrapedCount: 0,
        totalFound:  0,
        startedAt:   Date.now(),
      }
      await setActiveJobId(msg.jobId)
      await setJobStatus(status)

      // Update job status in Supabase
      const client = await getAuthenticatedClient()
      if (client) {
        await client.from('scraping_jobs').update({
          status:     'running',
          started_at: new Date().toISOString(),
        }).eq('id', msg.jobId)
      }
      return { ok: true }
    }

    case 'RESULT_BATCH': {
      const { jobId, results } = msg
      const client = await getAuthenticatedClient()
      if (!client) return { ok: false, error: 'Not authenticated' }

      // Get user_id from auth
      const { data: { user } } = await client.auth.getUser()
      if (!user) return { ok: false, error: 'No user' }

      // Bulk insert in chunks of BATCH_SIZE with up to 3 retries per chunk
      const rows = results.map(r => ({ ...r, job_id: jobId, user_id: user.id }))
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE)
        let lastError: string | undefined
        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt))
          const { error } = await client.from('business_results').insert(chunk)
          if (!error) { lastError = undefined; break }
          lastError = error.message
        }
        if (lastError) console.error('[SW] Insert failed after retries:', lastError)
      }

      // Update scraped_count on the job
      const currentStatus = await getJobStatus()
      const newCount = (currentStatus?.scrapedCount ?? 0) + results.length
      if (currentStatus) {
        await setJobStatus({ ...currentStatus, scrapedCount: newCount })
      }

      await client.from('scraping_jobs')
        .update({ scraped_count: newCount })
        .eq('id', jobId)

      return { ok: true, inserted: rows.length }
    }

    case 'JOB_COMPLETED': {
      const { jobId, totalCount } = msg
      const client = await getAuthenticatedClient()

      if (client) {
        await client.from('scraping_jobs').update({
          status:        'completed',
          scraped_count: totalCount,
          completed_at:  new Date().toISOString(),
        }).eq('id', jobId)
      }

      const currentStatus = await getJobStatus()
      if (currentStatus) {
        await setJobStatus({ ...currentStatus, status: 'completed', scrapedCount: totalCount })
      }
      await setActiveJobId(undefined)
      return { ok: true }
    }

    case 'JOB_FAILED': {
      const { jobId, error } = msg
      const client = await getAuthenticatedClient()

      if (client) {
        await client.from('scraping_jobs').update({
          status:        'failed',
          error_message: error,
          completed_at:  new Date().toISOString(),
        }).eq('id', jobId)
      }

      const currentStatus = await getJobStatus()
      if (currentStatus) {
        await setJobStatus({ ...currentStatus, status: 'failed' })
      }
      await setActiveJobId(undefined)
      return { ok: true }
    }

    case 'CANCEL_JOB': {
      const { jobId } = msg
      const client = await getAuthenticatedClient()
      if (client) {
        await client.from('scraping_jobs').update({ status: 'cancelled' }).eq('id', jobId)
      }
      const currentStatus = await getJobStatus()
      if (currentStatus) {
        await setJobStatus({ ...currentStatus, status: 'cancelled' })
      }
      await setActiveJobId(undefined)
      return { ok: true }
    }

    case 'GET_JOB_STATUS': {
      const status = await getJobStatus()
      return status ?? null
    }

    case 'GET_AUTH_STATUS': {
      const client = await getAuthenticatedClient()
      if (!client) return { isAuthenticated: false }

      const { data: { user } } = await client.auth.getUser()
      if (!user) return { isAuthenticated: false }

      const { data: profile } = await client
        .from('profiles')
        .select('role, plan, credits_used, credits_total')
        .eq('id', user.id)
        .single()

      return {
        isAuthenticated: true,
        userId:       user.id,
        email:        user.email,
        role:         profile?.role,
        creditsTotal: profile?.credits_total ?? 100,
        creditsUsed:  profile?.credits_used ?? 0,
      }
    }
  }
})

export {}
