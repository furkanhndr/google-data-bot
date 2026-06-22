import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ userId: string }> }

// PATCH /api/admin/users/[userId]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { userId } = await params

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { role, plan, credits_total, is_suspended } = body as {
    role?: string
    plan?: string
    credits_total?: number
    is_suspended?: boolean
  }

  // Use service client to bypass RLS
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.rpc('admin_update_user', {
    target_user_id: userId,
    new_role:       role        ?? null,
    new_plan:       plan        ?? null,
    new_credits:    credits_total ?? null,
    new_suspended:  is_suspended ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch updated profile
  const { data: updated } = await serviceClient
    .from('profiles').select('*').eq('id', userId).single()

  return NextResponse.json({ profile: updated })
}
