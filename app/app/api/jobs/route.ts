import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MAX_RESULTS_FREE, MAX_RESULTS_PREMIUM } from '@/lib/constants'
import type { JobFilters } from '@googlebusinessdata/shared-types'

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

  // Clamp max_results by plan
  const maxAllowed = profile.plan === 'premium' ? MAX_RESULTS_PREMIUM : MAX_RESULTS_FREE
  const safeFilters: JobFilters = {
    ...filters,
    max_results: Math.min(filters.max_results ?? maxAllowed, maxAllowed),
  }

  const { data: job, error } = await supabase
    .from('scraping_jobs')
    .insert({
      user_id:  user.id,
      query:    query.trim(),
      location: location.trim(),
      filters:  safeFilters,
      status:   'pending',
      source:   'extension',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ job }, { status: 201 })
}
