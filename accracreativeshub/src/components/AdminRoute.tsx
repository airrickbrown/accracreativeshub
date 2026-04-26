// ── src/components/AdminRoute.tsx ──
// Two-layer admin gate:
//   1. Must be signed in with the admin email
//   2. Must enter the correct PIN (validated client-side — instant, no hang)
// sessionStorage persists the verified state for the browser session.

import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import { S } from '../styles/tokens'
import { useTheme } from '../ThemeContext'
import AdminPanel from './AdminPanel'

interface Props { onClose: () => void }

const ADMIN_EMAIL = 'airrickbrown@gmail.com'
const ADMIN_PIN   = 'Mr. Brown admin'
const SESSION_KEY = 'ach_adm_ok'

export default function AdminRoute({ onClose }: Props) {
  const { user, loading } = useAuth()
  const { isDark } = useTheme()

  const [pinInput,    setPinInput]    = useState('')
  const [pinError,    setPinError]    = useState('')
  const [showPin,     setShowPin]     = useState(false)
  const [pinVerified, setPinVerified] = useState(() =>
    sessionStorage.getItem(SESSION_KEY) === '1'
  )

  // ── Layer 0: wait for auth to initialise ────────────────────
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: S.bg,
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

  // ── Layer 1: must be signed in ───────────────────────────────
  if (!user) {
    return <Denied message="Please log in with your admin account first." onClose={onClose} />
  }

  // ── Layer 2: must be the admin email ────────────────────────
  if (user.email !== ADMIN_EMAIL) {
    return <Denied message="You do not have permission to access this page." onClose={onClose} />
  }

  // ── Layer 3: PIN verification (synchronous — no hang) ────────
  if (!pinVerified) {
    const handleVerify = () => {
      if (!pinInput.trim()) {
        setPinError('Please enter your admin PIN.')
        return
      }
      if (pinInput.trim() === ADMIN_PIN) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setPinVerified(true)
      } else {
        setPinError('Incorrect PIN. Please try again.')
        setPinInput('')
      }
    }

    return (
      <div style={{
        position: 'fixed', inset: 0, background: S.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: S.surface,
          border: `1px solid ${S.border}`,
          borderRadius: 14,
          padding: '36px 32px',
          maxWidth: 380, width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          fontFamily: "'Newsreader', Georgia, serif",
        }}>
          <div style={{ color: S.gold, fontSize: 28, marginBottom: 16, textAlign: 'center' }}>◈</div>
          <h2 style={{
            color: S.text, fontWeight: 400, fontSize: 20, margin: '0 0 8px',
            textAlign: 'center', fontFamily: "'Newsreader', Georgia, serif",
          }}>
            Admin Access
          </h2>
          <p style={{
            color: S.textMuted, fontSize: 13, margin: '0 0 28px',
            textAlign: 'center', lineHeight: 1.6, fontFamily: "'Manrope', Arial, sans-serif",
          }}>
            Enter your admin PIN to continue.
          </p>

          <div style={{ marginBottom: 6 }}>
            <p style={{
              margin: '0 0 8px', fontFamily: "'Manrope', Arial, sans-serif",
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: S.textFaint,
            }}>Admin PIN</p>
            <input
              type={showPin ? 'text' : 'password'}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError('') }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="Enter your PIN"
              autoFocus
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${pinError ? 'rgba(220,85,85,0.5)' : S.border}`,
                borderRadius: 10, color: S.text,
                fontFamily: "'Manrope', Arial, sans-serif", fontSize: 16,
                padding: '14px 16px', outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => setShowPin(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: S.textFaint, fontSize: 11,
              fontFamily: "'Manrope', Arial, sans-serif",
              marginBottom: 16, padding: '2px 0',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            {showPin ? 'Hide' : 'Show'} PIN
          </button>

          {pinError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: '#f87171', fontSize: 12,
              fontFamily: "'Manrope', Arial, sans-serif", lineHeight: 1.6,
            }}>{pinError}</div>
          )}

          <button
            onClick={handleVerify}
            style={{
              display: 'block', width: '100%',
              background: S.gold,
              border: 'none', borderRadius: 10,
              fontFamily: "'Manrope', Arial, sans-serif", fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#131313',
              padding: '15px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
              marginBottom: 14,
            }}
          >
            Enter Admin Panel →
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'block', width: '100%', background: 'none',
              border: `1px solid ${S.borderFaint}`, borderRadius: 10,
              fontFamily: "'Manrope', Arial, sans-serif", fontSize: 11,
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

  // ── All layers passed ────────────────────────────────────────
  return <AdminPanel onClose={onClose} />
}

// ── Shared denial screen ──────────────────────────────────────
function Denied({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: S.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Newsreader', Georgia, serif", padding: 24,
    }}>
      <div style={{ color: '#c9a84c', fontSize: 36, marginBottom: 20 }}>◈</div>
      <h1 style={{ color: '#f5f5f5', fontWeight: 400, fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
        Access Denied
      </h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28, textAlign: 'center', maxWidth: 340, lineHeight: 1.7, fontFamily: "'Manrope', Arial, sans-serif" }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: '#c9a84c', color: '#131313', border: 'none',
          padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Manrope', Arial, sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}
      >
        ← Back to Home
      </button>
    </div>
  )
}
