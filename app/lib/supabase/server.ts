import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {
            // Called from a Server Component — can be ignored
          }
        },
      },
    }
  )
}

// Deliberately NOT @supabase/ssr's cookie-bound createServerClient: when a
// request carries a logged-in user's session cookies, that client silently
// swaps the Authorization header for the user's JWT (keeping only `apikey`
// as the service key) — so RLS still evaluates as that user, not as
// service_role. Inserts then fail with "violates row-level security policy"
// even though a real service-role key was passed in. Plain supabase-js with
// no session persistence avoids that entirely.
export async function createServiceClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
