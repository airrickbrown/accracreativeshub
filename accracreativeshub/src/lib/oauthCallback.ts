// ── src/lib/oauthCallback.ts ──
// Called from main.tsx BEFORE React renders.
// Processes the OAuth token/code, creates the profile row,
// then sets the destination path so App.tsx can route correctly.

import { createClient } from '@supabase/supabase-js'

// We create a fresh Supabase client here (not from supabase.ts)
// to avoid any module-load-order issues.
// @ts-ignore
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
// @ts-ignore
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const sb = createClient(SUPABASE_URL, SUPABASE_ANON)

export const OAUTH_ROLE_KEY = 'ach_pending_role'
export const OAUTH_DEST_KEY = 'ach_post_auth_dest'

export async function handleOAuthCallback(): Promise<void> {
  try {
    const hash   = window.location.hash
    const search = window.location.search

    // PKCE flow: exchange code for session
    if (search.includes('code=')) {
      const { data, error } = await sb.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        console.error('[OAuth] Code exchange failed:', error.message)
        window.history.replaceState({}, '', '/')
        return
      }
      if (data?.session) {
        await processNewSession(data.session)
      }
      return
    }

    // Implicit flow: getSession reads the hash automatically
    if (hash.includes('access_token')) {
      const { data, error } = await sb.auth.getSession()
      if (error) {
        console.error('[OAuth] Session read failed:', error.message)
        window.history.replaceState({}, '', '/')
        return
      }
      if (data?.session) {
        await processNewSession(data.session)
      }
      return
    }

    // Error in hash (e.g. user denied permission)
    if (hash.includes('error')) {
      console.warn('[OAuth] Error in hash:', hash)
      window.history.replaceState({}, '', '/')
    }
  } catch (err) {
    console.error('[OAuth] Unexpected error:', err)
    window.history.replaceState({}, '', '/')
  }
}

async function processNewSession(session: any): Promise<void> {
  const user     = session.user
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email    = user.email || ''

  // Read the role that was stored before the OAuth redirect
  const pendingRole = localStorage.getItem(OAUTH_ROLE_KEY) || 'client'
  localStorage.removeItem(OAUTH_ROLE_KEY)

  try {
    // Check if profile already exists
    const { data: existing } = await sb
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    let finalRole = pendingRole

    if (existing) {
      // Returning user — keep their existing role
      finalRole = existing.role
    } else {
      // Brand new user — create their profile
      await sb
        .from('profiles')
        .upsert([{ id: user.id, full_name: fullName, role: pendingRole, email }], { onConflict: 'id' })

      if (pendingRole === 'designer') {
        await sb
          .from('designers')
          .upsert(
            [{ id: user.id, badge: 'under_review', verified: false, public_visible: false }],
            { onConflict: 'id' }
          )
      }
    }

    // Determine post-auth destination
    const dest = finalRole === 'designer' ? '/apply-designer' :
                 finalRole === 'admin'    ? '/'              :
                                           '/welcome'

    // Store destination so App.tsx can read it after mounting
    localStorage.setItem(OAUTH_DEST_KEY, dest)

    // Clean the URL — remove hash/code
    window.history.replaceState({}, '', dest)

  } catch (err) {
    console.error('[OAuth] Profile creation failed:', err)
    window.history.replaceState({}, '', '/')
  }
}