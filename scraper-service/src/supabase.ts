import { createClient } from '@supabase/supabase-js'
import { config } from './config.ts'

// Service-role client: bypasses RLS so the worker can write results on behalf
// of any job owner. Never expose this key to clients.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
