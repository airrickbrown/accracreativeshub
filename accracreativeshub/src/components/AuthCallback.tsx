// ── src/components/AuthCallback.tsx ──
// Rendered as the first child in App.tsx.
// Detects OAuth redirect tokens, processes session, writes role from
// localStorage (stored before Google redirect), then routes by role.

import React, { useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../lib/auth'
import { S } from '../styles/tokens'

// Shared key — AuthModal writes this before Google redirect
export const OAUTH_ROLE_KEY = 'ach_pending_role'

export default function AuthCallback() {
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const hash   = window.location.hash
    const search = window.location.search

    const isHashCallback = hash.includes('access_token') || hash.includes('error_description')
    const isCodeCallback = search.includes('code=')

    if (!isHashCallback && !isCodeCallback) return

    const process = async () => {
      setProcessing(true)

      try {
        // PKCE flow — exchange code for session
        if (isCodeCallback) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) {
            console.error('Code exchange error:', error.message)
            window.history.replaceState({}, '', '/')
            setProcessing(false)
            return
          }
        }

        // Works for both hash and code flows
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const user     = session.user
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

          // Read role that was saved before the Google redirect
          const pendingRole = localStorage.getItem(OAUTH_ROLE_KEY) || 'client'
          localStorage.removeItem(OAUTH_ROLE_KEY)

          // Check if profile already exists
          const { data: existing } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()

          let finalRole = pendingRole

          if (existing) {
            // Returning user — respect their existing role, don't overwrite
            finalRole = existing.role
          } else {
            // Brand new Google user — create profile with the selected role
            await upsertProfile(user.id, fullName, pendingRole, user.email || '')

            if (pendingRole === 'designer') {
              await supabase
                .from('designers')
                .upsert(
                  [{ id: user.id, badge: 'under_review', verified: false, public_visible: false }],
                  { onConflict: 'id' }
                )
            }
          }

          // Clean the URL
          window.history.replaceState({}, '', '/')

          // Small delay so AuthContext has time to pick up the session
          await new Promise(r => setTimeout(r, 350))

          // Redirect by role
          if (finalRole === 'designer') {
            window.history.replaceState({}, '', '/apply-designer')
            window.dispatchEvent(new PopStateEvent('popstate'))
          } else if (finalRole !== 'admin') {
            window.history.replaceState({}, '', '/welcome')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        } else {
          window.history.replaceState({}, '', '/')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        window.history.replaceState({}, '', '/')
      }

      setProcessing(false)
    }

    process()
  }, [])

  if (!processing) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      <div style={{
        color: S.gold, fontSize: 18,
        fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.06em',
      }}>
        ACCRA CREATIVES HUB
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: S.gold,
            animation: `ach_cb_pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes ach_cb_pulse {
          0%,100% { opacity:0.2; transform:scale(0.75); }
          50%      { opacity:1;   transform:scale(1);   }
        }
      `}</style>
    </div>
  )
}