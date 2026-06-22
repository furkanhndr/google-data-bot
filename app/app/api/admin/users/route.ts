import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401, user: null, supabase: null }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403, user: null, supabase: null }
  return { error: null, status: 200, user, supabase }
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ error }, { status })

  const serviceClient = await createServiceClient()
  const { searchParams } = new URL(request.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('q') ?? ''
  const limit  = 20
  const from   = (page - 1) * limit

  // Join profiles + auth.users via admin API
  let query = serviceClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  const { data: profiles, count, error: dbErr } = await query
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  // Fetch emails via admin auth API
  const { data: authUsers } = await serviceClient.auth.admin.listUsers({
    page, perPage: limit,
  })

  const emailMap = new Map(
    (authUsers?.users ?? []).map(u => [u.id, u.email])
  )

  const users = (profiles ?? [])
    .map(p => ({ ...p, email: emailMap.get(p.id) ?? null }))
    .filter(p => !search || p.email?.includes(search) || p.display_name?.includes(search))

  return NextResponse.json({ users, total: count, page, limit })
}
