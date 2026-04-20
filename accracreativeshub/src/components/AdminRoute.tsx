// ── src/components/AdminRoute.tsx ──
// Three-layer admin gate:
//   1. Must be authenticated (user session exists)
//   2. Must have role === 'admin' in profiles table
//   3. Must pass server-side secret validation via /api/verify-admin
// All three layers must pass before AdminPanel renders.

import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../lib/supabase'
import { S } from '../styles/tokens'
import AdminPanel from './AdminPanel'

interface Props { onClose: () => void }

// Persists secret verification for the browser session only.
// sessionStorage is cleared when the tab is closed.
const SESSION_KEY = 'ach_adm_ok'

export default function AdminRoute({ onClose }: Props) {
  const { user, isAdmin, loading } = useAuth()

  const [secretInput,   setSecretInput]   = useState('')
  const [verifying,     setVerifying]     = useState(false)
  const [verifyError,   setVerifyError]   = useState('')
  const [secretVerified, setSecretVerified] = useState(() =>
    sessionStorage.getItem(SESSION_KEY) === '1'
  )

  // ── Layer 0: auth loading ────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#c9a84c',
              animation: `ap 1.2s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes ap{0%,100%{opacity:.2;transform:scale(.75);}50%{opacity:1;transform:scale(1);}}`}</style>
      </div>
    )
  }

  // ── Layer 1 + 2: must be logged in with admin role ───────────
  if (!user || !isAdmin) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif', padding: 24,
      }}>
        <div style={{ color: '#c9a84c', fontSize: 36, marginBottom: 20 }}>◈</div>
        <h1 style={{ color: '#f5f5f5', fontWeight: 400, fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
          Access Denied
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28, textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
          {!user
            ? 'Please log in with your admin account first.'
            : 'You do not have permission to access this page.'}
        </p>
        <button
          onClick={onClose}
          style={{
            background: '#c9a84c', color: '#131313', border: 'none',
            padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Arial', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  // ── Layer 3: secret verification ────────────────────────────
  if (!secretVerified) {
    const handleVerify = async () => {
      if (!secretInput.trim()) {
        setVerifyError('Please enter the admin secret.')
        return
      }
      setVerifying(true)
      setVerifyError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Session expired. Please log in again.')

        const res = await fetch('/api/verify-admin', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ secret: secretInput.trim() }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Verification failed.')
        }

        sessionStorage.setItem(SESSION_KEY, '1')
        setSecretVerified(true)
      } catch (err: any) {
        setVerifyError(err.message || 'Verification failed. Check your credentials.')
      }
      setVerifying(false)
    }

    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: '#131313',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: 14,
          padding: '36px 32px',
          maxWidth: 380, width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          fontFamily: 'Georgia, serif',
        }}>
          <div style={{ color: S.gold, fontSize: 28, marginBottom: 16, textAlign: 'center' }}>◈</div>
          <h2 style={{
            color: S.text, fontWeight: 400, fontSize: 20, margin: '0 0 8px',
            textAlign: 'center', fontFamily: 'Georgia, serif',
          }}>
            Admin Verification
          </h2>
          <p style={{
            color: S.textMuted, fontSize: 13, margin: '0 0 28px',
            textAlign: 'center', lineHeight: 1.6, fontFamily: 'Arial, sans-serif',
          }}>
            Enter your admin secret to continue.
          </p>

          <div style={{ marginBottom: 16 }}>
            <p style={{
              margin: '0 0 8px', fontFamily: 'Arial, sans-serif',
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: S.textFaint,
            }}>Admin Secret</p>
            <input
              type="password"
              value={secretInput}
              onChange={e => { setSecretInput(e.target.value); setVerifyError('') }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="••••••••••••"
              autoFocus
              disabled={verifying}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${verifyError ? 'rgba(220,85,85,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, color: S.text,
                fontFamily: 'Arial, sans-serif', fontSize: 16,
                padding: '14px 16px', outline: 'none',
              }}
            />
          </div>

          {verifyError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: '#f87171', fontSize: 12, fontFamily: 'Arial, sans-serif', lineHeight: 1.6,
            }}>{verifyError}</div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            style={{
              display: 'block', width: '100%',
              background: verifying ? 'rgba(201,168,76,0.45)' : S.gold,
              border: 'none', borderRadius: 10,
              fontFamily: 'Arial, sans-serif', fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#131313',
              padding: '15px', cursor: verifying ? 'not-allowed' : 'pointer',
              boxShadow: verifying ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
              marginBottom: 14,
            }}
          >
            {verifying ? 'Verifying…' : 'Enter Admin Panel →'}
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'block', width: '100%', background: 'none',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
              fontFamily: 'Arial, sans-serif', fontSize: 11,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: S.textMuted, padding: '13px', cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // ── All 3 layers passed ───────────────────────────────────────
  return <AdminPanel onClose={onClose} />
}
