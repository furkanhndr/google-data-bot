import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/extension/validate-session
// Called by the Chrome extension on startup to verify the token.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? ''
  const supabase = await createClient()

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    if (token) {
      await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ valid: false }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, plan, credits_used, credits_total, is_suspended')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_suspended) {
    return NextResponse.json({ valid: false }, { status: 403 })
  }

  return NextResponse.json({
    valid:        true,
    userId:       user.id,
    email:        user.email,
    role:         profile.role,
    plan:         profile.plan,
    creditsUsed:  profile.credits_used,
    creditsTotal: profile.plan === 'premium' ? Infinity : profile.credits_total,
  })
}
