import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { config } from './config.ts'

// Node < 22 has no global WebSocket, which supabase-js's realtime client needs
// at construction time. We don't use realtime here, but the client still
// initializes it — so provide a polyfill.
if (!(globalThis as { WebSocket?: unknown }).WebSocket) {
  ;(globalThis as { WebSocket?: unknown }).WebSocket = ws
}

// Service-role client: bypasses RLS so the worker can write results on behalf
// of any job owner. Never expose this key to clients.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
