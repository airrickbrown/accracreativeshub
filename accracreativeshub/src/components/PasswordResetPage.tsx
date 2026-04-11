// ── src/components/PasswordResetPage.tsx ──
// Full password reset flow:
// 1. Supabase processes the recovery token from URL hash automatically
// 2. Shows new password form with strength indicator
// 3. Updates password
// 4. Sends branded confirmation email via Resend
// 5. Redirects to homepage after success

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
// @ts-ignore
import { supabase } from '../lib/supabase'

// @ts-ignore
const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'

const sendConfirmationEmail = async (email: string, name: string) => {
  const key = RESEND_KEY()
  if (!key) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to:   email,
        subject: 'Your password has been changed — Accra Creatives Hub',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:36px 40px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">Password updated, ${name}.</h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
    Your Accra Creatives Hub password was successfully changed.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid rgba(239,68,68,0.6);padding:14px 18px;margin:16px 0;">
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">
      If you did not make this change, contact us immediately at
      <a href="mailto:hello@accracreativeshub.com" style="color:#c9a84c;">hello@accracreativeshub.com</a>
    </p>
  </div>
</td></tr>
<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">
    © ${new Date().getFullYear()} Accra Creatives Hub · 
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
  const [stage, setStage]       = useState<Stage>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName]   = useState('')

  useEffect(() => {
    // Supabase processes the hash token automatically on getSession()
    const init = async () => {
      await new Promise(r => setTimeout(r, 600)) // small delay for Supabase to process hash
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserEmail(session.user.email || '')
        setUserName(session.user.user_metadata?.full_name?.split(' ')[0] || 'there')
        setStage('form')
      } else {
        setStage('invalid')
      }
    }
    init()
  }, [])

  const handleReset = async () => {
    if (!password)            { setError('Please enter a new password.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true); setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) { setError(updateError.message); setLoading(false); return }

    // Send confirmation email
    if (userEmail) await sendConfirmationEmail(userEmail, userName)

    // Sign out so they log in fresh
    await supabase.auth.signOut()

    setStage('success')
    setLoading(false)

    // Redirect to homepage after 3s
    setTimeout(() => {
      window.history.replaceState({}, '', '/')
      window.location.reload()
    }, 3000)
  }

  // Password strength (1–4)
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3
  const strengthColor = ['transparent', '#ef4444', S.gold, S.gold, '#4ade80'][strength]
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'][strength]

  const gold = S.gold
  const container: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 500, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  const card: React.CSSProperties = { width: '100%', maxWidth: 440, background: '#131313', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 16, padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }

  if (stage === 'loading') return (
    <div style={container}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: gold, fontFamily: 'Georgia,serif', fontSize: 18, letterSpacing: '0.05em', marginBottom: 24 }}>ACCRA CREATIVES HUB</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: gold, animation: `rp_p 1.2s ease-in-out ${i*.18}s infinite` }} />)}
        </div>
        <style>{`@keyframes rp_p{0%,100%{opacity:.2;transform:scale(.75);}50%{opacity:1;transform:scale(1);}}`}</style>
      </div>
    </div>
  )

  if (stage === 'invalid') return (
    <div style={container}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ color: gold, fontSize: 36, marginBottom: 16 }}>◈</div>
        <h2 style={{ color: '#f5f5f5', fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 22, margin: '0 0 12px' }}>Link expired</h2>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.8, margin: '0 0 24px' }}>This reset link has expired or already been used. Request a new one from the login page.</p>
        <button
          onClick={() => { window.history.replaceState({}, '', '/'); window.location.reload() }}
          style={{ all: 'unset', display: 'inline-block', background: gold, color: '#131313', borderRadius: 10, padding: '14px 32px', fontFamily: 'Arial', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}
        >Back to Login →</button>
      </div>
    </div>
  )

  if (stage === 'success') return (
    <div style={container}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ color: '#4ade80', fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: '#f5f5f5', fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 22, margin: '0 0 12px' }}>Password updated.</h2>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.8, margin: '0 0 8px' }}>Your password has been changed successfully.</p>
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 24px' }}>
          Confirmation sent to <strong style={{ color: '#aaa' }}>{userEmail}</strong>.<br />Redirecting in 3 seconds…
        </p>
        <div style={{ height: 3, background: 'rgba(74,154,74,0.2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#4ade80', animation: 'rp_bar 3s linear forwards' }} />
        </div>
        <style>{`@keyframes rp_bar{from{width:0}to{width:100%}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={container}>
      <div style={card}>
        <div style={{ width: 28, height: 2, background: gold, marginBottom: 20 }} />
        <h2 style={{ color: '#f5f5f5', fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 26, margin: '0 0 8px' }}>Set new password.</h2>
        <p style={{ color: '#888', fontSize: 13, margin: '0 0 28px', lineHeight: 1.6 }}>Hi {userName}, choose a strong new password.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* New password */}
          <div>
            <p style={{ margin: '0 0 7px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', fontFamily: 'Arial' }}>New Password</p>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${password ? gold : 'rgba(255,255,255,0.09)'}`, borderRadius: 10, color: '#f5f5f5', fontFamily: 'Arial', fontSize: 16, padding: '15px 52px 15px 16px', outline: 'none', minHeight: 52 }}
              />
              <button
                onClick={() => setShowPw(v => !v)}
                style={{ all: 'unset', position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial' }}
              >{showPw ? 'Hide' : 'Show'}</button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(n => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= n ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: strengthColor, fontFamily: 'Arial' }}>{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <p style={{ margin: '0 0 7px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', fontFamily: 'Arial' }}>Confirm Password</p>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: `1px solid ${confirm && confirm === password ? 'rgba(74,154,74,0.6)' : confirm && confirm !== password ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 10, color: '#f5f5f5', fontFamily: 'Arial', fontSize: 16, padding: '15px 16px', outline: 'none', minHeight: 52 }}
            />
            {confirm && confirm !== password && (
              <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: 11, fontFamily: 'Arial' }}>Passwords don't match</p>
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
            style={{ all: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', boxSizing: 'border-box', minHeight: 54, background: loading ? 'rgba(201,168,76,0.45)' : gold, borderRadius: 10, color: '#131313', fontFamily: 'Arial', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)', transition: 'background 0.2s' }}
          >{loading ? 'Updating…' : 'Update Password →'}</button>

        </div>
      </div>
    </div>
  )
}