import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getAuthTokens } from './storage'

// These are injected at build time via webpack DefinePlugin or read from storage.
// For the extension we embed the public values directly — they are safe to ship.
const SUPABASE_URL  = process.env.SUPABASE_URL  ?? ''
const SUPABASE_ANON = process.env.SUPABASE_ANON ?? ''

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        persistSession: false,  // we manage tokens ourselves via chrome.storage
        autoRefreshToken: false,
      },
    })
  }
  return _client
}

export async function getAuthenticatedClient(): Promise<SupabaseClient | null> {
  const { accessToken, refreshToken } = await getAuthTokens()
  if (!accessToken) return null

  const client = getSupabaseClient()
  await client.auth.setSession({
    access_token:  accessToken,
    refresh_token: refreshToken ?? '',
  })
  return client
}
