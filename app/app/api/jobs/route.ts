import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { searchPlaces } from '@/lib/places'
import {
  MAX_RESULTS_FREE,
  MAX_RESULTS_PREMIUM,
  PLACES_TEXT_SEARCH_COST_PER_REQUEST_USD,
} from '@/lib/constants'
import { getCreditsRemaining, getPlanDailyJobLimit } from '@/lib/plan'
import type { JobFilters } from '@googlebusinessdata/shared-types'

// Places API search + DB writes run within the request — allow up to 60s.
export const maxDuration = 60

async function recordPlacesUsage(requests: number) {
  if (requests <= 0) return
  const service = await createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const cost = requests * PLACES_TEXT_SEARCH_COST_PER_REQUEST_USD

  const { data: existing } = await service
    .from('places_api_quota')
    .select('requests_made, cost_usd')
    .eq('date', today)
    .maybeSingle()

  await service
    .from('places_api_quota')
    .upsert({
      date: today,
      requests_made: (existing?.requests_made ?? 0) + requests,
      cost_usd: Number(existing?.cost_usd ?? 0) + cost,
    }, { onConflict: 'date' })
}

// GET /api/jobs — list current user's jobs
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const { data, error, count } = await supabase
    .from('scraping_jobs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jobs: data, total: count, page, limit })
}

// POST /api/jobs — create new scraping job
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check suspension + credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_suspended, plan, credits_used, credits_total')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.is_suspended) return NextResponse.json({ error: 'Hesabınız askıya alınmış.' }, { status: 403 })
  if (profile.plan === 'free' && profile.credits_used >= profile.credits_total) {
    return NextResponse.json({ error: 'Kredi limitinize ulaştınız.' }, { status: 403 })
  }

  const body = await request.json()
  const { query, location, filters = {} } = body as {
    query: string
    location: string
    filters?: JobFilters
  }

  if (!query?.trim() || !location?.trim()) {
    return NextResponse.json({ error: 'Arama sorgusu ve konum zorunludur.' }, { status: 400 })
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: jobsToday } = await supabase
    .from('scraping_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())

  const dailyLimit = getPlanDailyJobLimit(profile.plan)
  if ((jobsToday ?? 0) >= dailyLimit) {
    return NextResponse.json({
      error: `Günlük arama limitinize ulaştınız. Limit: ${dailyLimit} iş/gün.`,
    }, { status: 429 })
  }

  // Clamp max_results by plan
  const maxAllowed = profile.plan === 'premium' ? MAX_RESULTS_PREMIUM : MAX_RESULTS_FREE
  const remainingCredits = getCreditsRemaining(profile.plan, profile.credits_used, profile.credits_total)
  const creditLimitedMax = Number.isFinite(remainingCredits)
    ? Math.max(0, Math.min(maxAllowed, remainingCredits))
    : maxAllowed

  if (creditLimitedMax <= 0) {
    return NextResponse.json({ error: 'Kredi limitinize ulaştınız.' }, { status: 403 })
  }

  const safeFilters: JobFilters = {
    ...filters,
    max_results: Math.min(filters.max_results ?? creditLimitedMax, creditLimitedMax),
  }

  const { data: job, error } = await supabase
    .from('scraping_jobs')
    .insert({
      user_id:    user.id,
      query:      query.trim(),
      location:   location.trim(),
      filters:    safeFilters,
      status:     'running',
      source:     'places_api',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !job) return NextResponse.json({ error: error?.message ?? 'Job oluşturulamadı.' }, { status: 500 })

  // Process the job inline via the Google Places API (no separate worker).
  let placesRequests = 0
  try {
    const rows = await searchPlaces(query.trim(), location.trim(), safeFilters, {
      onRequest: () => { placesRequests += 1 },
    })
    await recordPlacesUsage(placesRequests)

    if (rows.length > 0) {
      const payload = rows.map(r => ({ ...r, job_id: job.id, user_id: user.id }))
      const { error: insertError } = await supabase.from('business_results').insert(payload)
      if (insertError) throw new Error(insertError.message)
    }

    // scraped_count = rows actually written → the on-completion trigger bills
    // credits accurately.
    const { data: done } = await supabase
      .from('scraping_jobs')
      .update({ status: 'completed', scraped_count: rows.length, completed_at: new Date().toISOString() })
      .eq('id', job.id)
      .select()
      .single()

    return NextResponse.json({ job: done ?? job }, { status: 201 })
  } catch (e) {
    await recordPlacesUsage(placesRequests)
    const message = e instanceof Error ? e.message : String(e)
    const { data: failed } = await supabase
      .from('scraping_jobs')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', job.id)
      .select()
      .single()

    return NextResponse.json({ job: failed ?? job, error: message }, { status: 201 })
  }
}
