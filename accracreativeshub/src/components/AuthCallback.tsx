// ── src/components/AuthCallback.tsx ──
// Landing page for Google OAuth redirect (/auth/callback).
// Supabase PKCE: the client auto-exchanges the code on init; we just
// wait for the SIGNED_IN event. A ref guards against double-handling
// (React StrictMode mounts twice in development).

import React, { useEffect, useRef, useState } from 'react'
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
  const handled = useRef(false)

  useEffect(() => {
    // Surface any OAuth-level error Supabase forwarded in the query string
    const params = new URLSearchParams(window.location.search)
    const oauthErr = params.get('error_description') || params.get('error')
    if (oauthErr) {
      setErrorMsg(decodeURIComponent(oauthErr.replace(/\+/g, ' ')))
      setStatus('error')
      return
    }

    const handleSession = async (u: any) => {
      if (handled.current) return
      handled.current = true
      setUser(u)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single()

        if (profile?.role) {
          onDone()
        } else {
          setStatus('role-select')
        }
      } catch {
        setStatus('role-select')
      }
    }

    // Primary path: listen for SIGNED_IN fired after the PKCE exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        subscription.unsubscribe()
        handleSession(session.user)
      }
    })

    const code = params.get('code')
    if (code) {
      // Explicit PKCE exchange — guards against cases where detectSessionInUrl
      // doesn't fire (e.g. the code verifier was stored on a different origin
      // due to a www↔non-www redirect before the callback).
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ data, error: exchErr }) => {
          if (exchErr) {
            setErrorMsg(exchErr.message)
            setStatus('error')
          } else if (data?.session?.user) {
            subscription.unsubscribe()
            handleSession(data.session.user)
          }
        })
    } else {
      // Fallback: already-active session (e.g. tab refresh after auth)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          subscription.unsubscribe()
          handleSession(session.user)
        }
      })
    }

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
      <div style={{ position: 'fixed', inset: 0, background: S.bg, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 28, height: 2, background: S.gold, marginBottom: 16 }} />
        <h2 style={{ fontFamily: S.headline, fontWeight: 300, fontSize: 22, color: S.text, marginBottom: 10, textAlign: 'center' }}>Sign-in failed</h2>
        <p style={{ fontFamily: S.body, fontSize: 14, color: S.textMuted, marginBottom: 28, textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>{errorMsg}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { window.location.href = '/?login=google' }}
            style={{ fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: S.onPrimary, background: S.gold, border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer' }}
          >
            Try Again
          </button>
          <button
            onClick={onDone}
            style={{ fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: S.textMuted, background: 'none', border: `1px solid ${S.borderFaint}`, borderRadius: 8, padding: '12px 28px', cursor: 'pointer' }}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    )
  }

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
