// ── src/lib/supabase.ts ──
// IMPORTANT: This file must be named supabase.ts NOT supabase.d.ts
// A .d.ts file is a type declaration only — it cannot be imported as a module.
// If your file is currently named supabase.d.ts, rename it to supabase.ts

// ── src/lib/supabase.ts ──
// Single Supabase client for the entire app.
// vite-env.d.ts (/// <reference types="vite/client" />) provides types for import.meta.env.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon: string = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnon)