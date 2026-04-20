// api/verify-admin.js — Vercel serverless function
// Three-layer admin verification:
//   1. Valid Supabase JWT (authenticated session)
//   2. profiles.role === 'admin' (database role)
//   3. ADMIN_SECRET env var match (secret phrase)
// All three must pass — failure at any layer returns 401.

const { createClient } = require('@supabase/supabase-js')

const ALLOWED = [
  'https://accracreativeshub.com',
  'https://www.accracreativeshub.com',
]

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || ''
  res.setHeader('Access-Control-Allow-Origin',  ALLOWED.includes(origin) ? origin : ALLOWED[1])
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  // ── Layer 1: require a bearer token ──────────────────────────
  const authHeader = req.headers.authorization || ''
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const supabaseUrl    = process.env.VITE_SUPABASE_URL    || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminSecret    = process.env.ADMIN_SECRET

  if (!supabaseUrl || !serviceRoleKey || !adminSecret) {
    console.error('Missing required env vars: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_SECRET')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Layer 2: verify JWT and check admin role in DB ────────────
  const { data: { user }, error: authErr } = await admin.auth.getUser(token)
  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' })
  }

  // ── Layer 3: validate the admin secret phrase ─────────────────
  const { secret } = req.body || {}
  if (!secret || secret !== adminSecret) {
    // Deliberate delay to slow brute-force
    await new Promise(r => setTimeout(r, 600))
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  return res.status(200).json({ success: true })
}
