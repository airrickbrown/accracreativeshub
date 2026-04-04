// ── src/components/AuthCallback.tsx ──
//
// This is rendered at the ROOT of App.tsx, before any other content.
// It detects an OAuth redirect (hash or code in URL), processes the session,
// then redirects the user to the correct page based on their role.
//
// WHY GOOGLE WAS FAILING:
// After Google redirects back, Supabase puts the session info in the URL hash:
//   https://accracreativeshub.com/#access_token=...&token_type=bearer&...
// React router was stripping the hash before Supabase could read it.
// This component runs SYNCHRONOUSLY before the router, so it catches the hash first.

import React, { useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import { S } from '../styles/tokens'
import { ROLE_REDIRECT } from '../lib/constants'

export default function AuthCallback() {
  const { refreshUser, userRole } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const hash   = window.location.hash
    const search = window.location.search

    const hasHash  = hash.includes('access_token') || hash.includes('error_description')
    const hasCode  = search.includes('code=')

    // Not an OAuth callback — do nothing
    if (!hasHash && !hasCode) return

    const process = async () => {
      setProcessing(true)

      try {
        if (hasCode) {
          // PKCE flow — exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) {
            console.error('Code exchange error:', error.message)
            window.history.replaceState({}, '', '/')
            setProcessing(false)
            return
          }
          console.log('PKCE session:', data?.session?.user?.email)
        }
        // For hash flow, getSession() handles it automatically

        // Refresh AuthContext with the new session
        await refreshUser()

        // Clean URL
        window.history.replaceState({}, '', '/')

      } catch (err) {
        console.error('Auth callback error:', err)
        window.history.replaceState({}, '', '/')
      }

      setProcessing(false)
    }

    process()
  }, [])

  // After processing completes, redirect based on role
  useEffect(() => {
    if (processing) return
    const hash   = window.location.hash
    const search = window.location.search
    const wasCallback = hash.includes('access_token') || search.includes('code=')
    if (!wasCallback || !userRole) return

    const dest = ROLE_REDIRECT[userRole as keyof typeof ROLE_REDIRECT]
    if (dest && dest !== '/') {
      // Use replaceState so back button doesn't loop
      window.history.replaceState({}, '', dest)
      // Trigger a re-render so App picks up the new path
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [processing, userRole])

  if (!processing) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      <div style={{ color: S.gold, fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.05em' }}>
        ACCRA CREATIVES HUB
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: S.gold,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            opacity: 0.4,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8);} 50%{opacity:1;transform:scale(1);} }
      `}</style>
    </div>
  )
}