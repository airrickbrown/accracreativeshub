// ── src/components/PasswordResetPage.tsx ──
// Fixes:
// 1. "Updating..." getting stuck — now properly awaits session then updates
// 2. Branded confirmation email via Resend instead of Supabase plain text
// 3. Clean redirect to homepage after 3 seconds with progress bar

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { S } from '../styles/tokens'
import { useTheme } from '../ThemeContext'

const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'

const sendConfirmationEmail = async (email: string, name: string) => {
  const key = RESEND_KEY()
  if (!key) return
  const year = new Date().getFullYear()
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM,
        to:      email,
        subject: 'Your password has been changed — Accra Creatives Hub',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">

<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
  <p style="color:#c9a84c;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;">The Sovereign Gallery</p>
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
</td></tr>

<tr><td style="padding:36px 40px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">
    Password updated, ${name}.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
    Your Accra Creatives Hub password was successfully changed on your account <strong style="color:#f5f5f5;">${email}</strong>.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid rgba(239,68,68,0.6);padding:14px 18px;margin:0 0 20px;">
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">
      ⚠️ If you did not make this change, contact us immediately at
      <a href="mailto:hello@accracreativeshub.com" style="color:#c9a84c;">hello@accracreativeshub.com</a>
    </p>
  </div>
  <a href="https://accracreativeshub.com"
     style="display:inline-block;background:#c9a84c;color:#131313;font-family:Arial;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:8px;">
    Go to Platform →
  </a>
</td></tr>

<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">
    © ${year} Accra Creatives Hub · Accra, Ghana ·
    <a href="https://accracreativeshub.com" style="color:#c9a84c;text-decoration:none;">accracreativeshub.com</a>
  </p>
</td></tr>

</table></td></tr></table>
</body></html>`,
      }),
    })
  } catch (e) {
    console.warn('Confirmation email failed (non-fatal):', e)
  }
}

type Stage = 'loading' | 'form' | 'success' | 'invalid'

export default function PasswordResetPage() {
  const { isDark } = useTheme()
  const [stage, setStage]         = useState<Stage>('loading')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName]   = useState('')

  useEffect(() => {
    const init = async () => {
      // Give Supabase time to process the recovery token from the URL hash
      await new Promise(r => setTimeout(r, 800))

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.user) {
        setStage('invalid')
        return
      }

      setUserEmail(session.user.email || '')
      setUserName(
        session.user.user_metadata?.full_name?.split(' ')[0] || 'there'
      )
      setStage('form')
    }
    init()
  }, [])

  const handleReset = async () => {
    if (!password)            { setError('Please enter a new password.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Send branded confirmation email AFTER successful update
    if (userEmail) {
      await sendConfirmationEmail(userEmail, userName)
    }

    // Sign out so they log in fresh with new password
    await supabase.auth.signOut()

    setStage('success')
    setLoading(false)

    // Redirect to homepage after 3 seconds
    setTimeout(() => {
      window.history.replaceState({}, '', '/')
      window.location.reload()
    }, 3000)
  }

  // Password strength
  const strength =
    password.length === 0 ? 0 :
    password.length < 8   ? 1 :
    password.length < 12  ? 2 :
    password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3

  const strengthColor   = ['transparent', '#ef4444', '#c9a84c', '#c9a84c', '#4ade80'][strength]
  const strengthLabel   = ['', 'Too short', 'Weak', 'Good', 'Strong'][strength]

  const gold = '#c9a84c'

  const container: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 500,
    background: S.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }

  const card: React.CSSProperties = {
    width: '100%', maxWidth: 440,
    background: S.surface,
    border: `1px solid ${S.border}`,
    borderRadius: 16,
    padding: 'clamp(28px, 6vw, 40px) clamp(20px, 6vw, 36px)',
    boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 24px 64px rgba(0,0,0,0.12)',
  }

  // ── Loading ──
  if (stage === 'loading') return (
    <div style={container}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: gold, fontFamily: 'Georgia,serif', fontSize: 18, letterSpacing: '0.05em', marginBottom: 24 }}>
          ACCRA CREATIVES HUB
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: gold, animation: `rp_p 1.2s ease-in-out ${i * 0.18}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes rp_p{0%,100%{opacity:.2;transform:scale(.75);}50%{opacity:1;transform:scale(1);}}`}</style>
      </div>
    </div>
  )

  // ── Invalid / expired link ──
  if (stage === 'invalid') return (
    <div style={container}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ color: gold, fontSize: 36, marginBottom: 16 }}>◈</div>
        <h2 style={{ color: S.text, fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 22, margin: '0 0 12px' }}>
          Link expired
        </h2>
        <p style={{ color: S.textMuted, fontSize: 14, lineHeight: 1.8, margin: '0 0 24px' }}>
          This reset link has expired or already been used.<br />Request a new one from the login page.
        </p>
        <button
          onClick={() => { window.history.replaceState({}, '', '/'); window.location.reload() }}
          style={{ all: 'unset', display: 'inline-block', background: gold, color: '#131313', borderRadius: 10, padding: '14px 32px', fontFamily: 'Arial', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Back to Login →
        </button>
      </div>
    </div>
  )

  // ── Success ──
  if (stage === 'success') return (
    <div style={container}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ color: '#4ade80', fontSize: 52, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: S.text, fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 24, margin: '0 0 12px' }}>
          Password updated.
        </h2>
        <p style={{ color: S.textMuted, fontSize: 14, lineHeight: 1.8, margin: '0 0 6px' }}>
          Your password has been changed successfully.
        </p>
        <p style={{ color: S.textFaint, fontSize: 13, margin: '0 0 24px' }}>
          A confirmation email was sent to{' '}
          <strong style={{ color: S.textMuted }}>{userEmail}</strong>.<br />
          Redirecting you to login in 3 seconds…
        </p>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(74,154,74,0.15)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#4ade80', animation: 'rp_bar 3s linear forwards' }} />
        </div>
        <style>{`@keyframes rp_bar{from{width:0}to{width:100%}}`}</style>
      </div>
    </div>
  )

  // ── Form ──
  return (
    <div style={container}>
      <div style={card}>
        <div style={{ width: 28, height: 2, background: gold, marginBottom: 20 }} />
        <h2 style={{ color: S.text, fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 26, margin: '0 0 8px', lineHeight: 1.2 }}>
          Set new password.
        </h2>
        <p style={{ color: S.textMuted, fontSize: 13, margin: '0 0 28px', lineHeight: 1.6 }}>
          Hi {userName}, choose a strong new password.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* New password */}
          <div>
            <p style={{ margin: '0 0 7px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.textFaint, fontFamily: 'Arial' }}>
              New Password
            </p>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${password ? gold : S.border}`,
                  borderRadius: 10, color: S.text, fontFamily: 'Arial',
                  fontSize: 16, padding: '15px 52px 15px 16px', outline: 'none', minHeight: 52,
                }}
              />
              <button
                onClick={() => setShowPw(v => !v)}
                style={{ all: 'unset', position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: S.textFaint, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial' }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(n => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= n ? strengthColor : S.borderFaint, transition: 'background 0.2s' }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: strengthColor, fontFamily: 'Arial' }}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <p style={{ margin: '0 0 7px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.textFaint, fontFamily: 'Arial' }}>
              Confirm Password
            </p>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${
                  confirm && confirm === password ? 'rgba(74,154,74,0.6)' :
                  confirm && confirm !== password ? 'rgba(239,68,68,0.6)' :
                  S.border
                }`,
                borderRadius: 10, color: S.text, fontFamily: 'Arial',
                fontSize: 16, padding: '15px 16px', outline: 'none', minHeight: 52,
              }}
            />
            {confirm && confirm !== password && (
              <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: 11, fontFamily: 'Arial' }}>
                Passwords don't match
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 9, padding: '12px 15px' }}>
              <p style={{ margin: 0, color: '#f87171', fontSize: 13, fontFamily: 'Arial', lineHeight: 1.6 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              all: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', boxSizing: 'border-box', minHeight: 54,
              background: loading ? 'rgba(201,168,76,0.45)' : gold,
              borderRadius: 10, color: '#131313', fontFamily: 'Arial',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Updating…' : 'Update Password →'}
          </button>

        </div>
      </div>
    </div>
  )
}