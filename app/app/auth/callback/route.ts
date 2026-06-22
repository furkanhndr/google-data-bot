import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Route through extension-sync so the Chrome extension can pick up the session token
  const syncUrl = new URL(`${origin}/auth/extension-sync`)
  syncUrl.searchParams.set('redirectTo', redirectTo)
  return NextResponse.redirect(syncUrl.toString())
}
