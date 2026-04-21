// ── src/lib/supabase.ts ──
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon: string = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    flowType:          'pkce',
    detectSessionInUrl: true,
    persistSession:     true,
    autoRefreshToken:   true,
  },
})
