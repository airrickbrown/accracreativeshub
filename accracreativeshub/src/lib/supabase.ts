// ── src/lib/supabase.ts ──
// IMPORTANT: This file must be named supabase.ts NOT supabase.d.ts
// A .d.ts file is a type declaration only — it cannot be imported as a module.
// If your file is currently named supabase.d.ts, rename it to supabase.ts

import { createClient } from '@supabase/supabase-js'

// @ts-ignore
const supabaseUrl: string  = import.meta.env.VITE_SUPABASE_URL
// @ts-ignore
const supabaseAnon: string = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnon)