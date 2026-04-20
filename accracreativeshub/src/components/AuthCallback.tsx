// ── src/components/AuthCallback.tsx ──
// Landing page for Google OAuth redirect (/auth/callback).
// Supabase JS v2 automatically exchanges the PKCE code when getSession() is called.
// For new users (no profile row), we show GoogleRoleModal before redirecting home.

import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import GoogleRoleModal from './GoogleRoleModal'
import { S } from '../styles/tokens'

interface Props {
  onDone: () => void
}

export default function AuthCallback({ onDone }: Props) {
  const [status, setStatus]     = useState<'loading' | 'role-select' | 'error'>('loading')
  const [user, setUser]         = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Check for OAuth error params before attempting session exchange
    const params = new URLSearchParams(window.location.search)
    const oauthErr = params.get('error_description') || params.get('error')
    if (oauthErr) {
      setErrorMsg(decodeURIComponent(oauthErr))
      setStatus('error')
      return
    }

    const handleSession = async (u: any) => {
      setUser(u)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single()

        if (profile?.role) {
          // Existing user — session active, go home
          onDone()
        } else {
          // New Google user — needs role selection
          setStatus('role-select')
        }
      } catch {
        // If profile check fails, treat as new user (safer than blocking login)
        setStatus('role-select')
      }
    }

    // Listen for SIGNED_IN — Supabase fires this after exchanging the OAuth code
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        subscription.unsubscribe()
        handleSession(session.user)
      }
    })

    // Also check for an already-active session (tab refresh after auth)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        subscription.unsubscribe()
        handleSession(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [onDone])

  if (status === 'role-select' && user) {
    return (
      <GoogleRoleModal
        user={user}
        onComplete={(role) => {
          try { localStorage.setItem('ach_google_new', role) } catch { /* ignore */ }
          onDone()
        }}
      />
    )
  }

  if (status === 'error') {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, background: S.bg, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ width: 28, height: 2, background: S.gold, marginBottom: 16 }} />
          <h2 style={{ fontFamily: S.headline, fontWeight: 300, fontSize: 22, color: S.text, marginBottom: 10, textAlign: 'center' }}>Sign-in failed</h2>
          <p style={{ fontFamily: S.body, fontSize: 14, color: S.textMuted, marginBottom: 28, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>{errorMsg}</p>
          <button
            onClick={onDone}
            style={{
              fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              fontWeight: 700, color: '#131313', background: S.gold, border: 'none',
              borderRadius: 8, padding: '12px 28px', cursor: 'pointer',
            }}
          >
            Back to Homepage
          </button>
        </div>
      </>
    )
  }

  // Loading — Supabase is exchanging the OAuth code
  return (
    <div style={{ position: 'fixed', inset: 0, background: S.bg, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `3px solid rgba(201,168,76,0.15)`,
        borderTopColor: S.gold,
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: S.body, fontSize: 13, color: S.textMuted }}>Signing you in…</p>
    </div>
  )
}
