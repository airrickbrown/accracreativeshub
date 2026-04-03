// ── src/components/AuthModal.tsx ──

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Hl, Body, Lbl } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { signUpUser } from '../lib/auth'

interface AuthModalProps {
  onClose:     () => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab]           = useState(defaultTab)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [form, setForm]         = useState({ email: '', password: '', fullName: '', role: 'client' })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    setForm({ email: '', password: '', fullName: '', role: 'client' })
    setError(''); setSuccess(''); setShowPw(false); setAwaitingVerification(false)
  }, [tab])

  // ── Login ──
  const handleLogin = async () => {
    if (!form.email)    { setError('Please enter your email.'); return }
    if (!form.password) { setError('Please enter your password.'); return }

    setLoading(true); setError(''); setSuccess('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (loginError) {
      // Surface helpful error messages
      if (loginError.message.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else if (loginError.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in. Check your inbox and spam folder.')
      } else {
        setError(loginError.message)
      }
      setLoading(false)
      return
    }

    // Check email verification
    if (data.user && !data.user.email_confirmed_at) {
      // Sign them back out — don't allow unverified login
      await supabase.auth.signOut()
      setError('Your email is not yet verified. Please check your inbox (and spam folder) for the verification link.')
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
  }

  // ── Email signup ──
  const handleSignup = async () => {
    if (!form.fullName)  { setError('Please enter your full name.'); return }
    if (!form.email)     { setError('Please enter your email.'); return }
    if (!form.password)  { setError('Please create a password.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true); setError(''); setSuccess('')

    try {
      await signUpUser({
        email:    form.email,
        password: form.password,
        fullName: form.fullName,
        role:     form.role as 'client' | 'designer',
      })
      setAwaitingVerification(true)
      setSuccess(
        form.role === 'designer'
          ? 'Application submitted! Check your email (including spam) for a verification link. You cannot log in until you verify.'
          : 'Account created! Check your email (including spam) for a verification link before logging in.'
      )
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.')
    }
    setLoading(false)
  }

  // ── Google OAuth ──
  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
    // On success Supabase redirects — no need to close modal
  }

  // ── Password reset ──
  const handleForgotPassword = async () => {
    if (!form.email) { setError('Enter your email address above first.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Password reset link sent — check your inbox and spam folder.')
  }

  // ── Resend verification ──
  const handleResendVerification = async () => {
    if (!form.email) { setError('Enter your email to resend verification.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Verification email resent — check your inbox and spam.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', padding: '28px 22px', background: 'linear-gradient(180deg,rgba(18,18,22,0.98) 0%,rgba(10,10,13,0.98) 100%)', border: '1px solid rgba(201,168,76,0.14)', boxShadow: S.shadowStrong, borderRadius: S.radiusLg }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.borderFaint}`, marginBottom: 24, borderRadius: S.radiusSm, overflow: 'hidden' }}>
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? S.goldDim : 'transparent', border: 'none', color: tab === t ? S.gold : S.textMuted, padding: '13px 10px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s ease' }}>
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <Hl style={{ fontSize: 'clamp(24px,6vw,32px)', fontWeight: 300, marginBottom: 20 }}>
          {tab === 'login' ? 'Welcome back.' : <em style={{ fontStyle: 'italic', color: S.gold }}>Join the Hub.</em>}
        </Hl>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{ width: '100%', background: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: S.radiusSm, padding: '12px 16px', cursor: googleLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: S.body, fontSize: 14, fontWeight: 600, color: '#1a1a1a', opacity: googleLoading ? 0.6 : 1, minHeight: 46 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: S.borderFaint }} />
            <Body style={{ fontSize: 11, margin: 0, color: S.textFaint }}>or with email</Body>
            <div style={{ flex: 1, height: 1, background: S.borderFaint }} />
          </div>

          {/* Signup fields */}
          {tab === 'signup' && !awaitingVerification && (
            <>
              <Inp label="Full Name" placeholder="e.g. Kofi Mensah" value={form.fullName} onChange={(v: string) => f('fullName', v)} />
              <div>
                <Lbl style={{ marginBottom: 10 }}>I am a</Lbl>
                <div className="auth-role-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ k: 'client', l: 'Client', sub: 'I need design work' }, { k: 'designer', l: 'Designer', sub: 'I offer design services' }].map(r => {
                    const active = form.role === r.k
                    return (
                      <div key={r.k} onClick={() => f('role', r.k)} style={{ background: active ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.015)', border: `1px solid ${active ? S.gold : 'rgba(255,255,255,0.12)'}`, padding: '14px', cursor: 'pointer', textAlign: 'center', borderRadius: S.radiusSm, transition: 'all 0.2s' }}>
                        <Hl style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{r.l}</Hl>
                        <Body style={{ fontSize: 11, margin: 0, color: active ? S.text : S.textMuted }}>{r.sub}</Body>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Email field */}
          {!awaitingVerification && (
            <Inp label="Email" placeholder="your@email.com" value={form.email} onChange={(v: string) => f('email', v)} />
          )}

          {/* Password with show/hide — font-size 16px prevents iOS zoom */}
          {!awaitingVerification && (
            <div>
              <Lbl style={{ marginBottom: 8 }}>
                Password {tab === 'signup' && <span style={{ color: S.textFaint, fontSize: 9 }}>(min 8 characters)</span>}
              </Lbl>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => f('password', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleSignup() }}
                  style={{
                    width: '100%', background: S.bgLow, border: `1px solid ${S.border}`,
                    color: S.text, padding: '13px 48px 13px 16px', fontFamily: S.body,
                    // ── FIX: 16px font-size prevents iOS auto-zoom on input focus ──
                    fontSize: 16,
                    outline: 'none', boxSizing: 'border-box', borderRadius: S.radiusSm, minHeight: 46,
                  }}
                  onFocus={(e: any) => (e.target.style.borderColor = S.gold)}
                  onBlur={(e: any)  => (e.target.style.borderColor = S.border)}
                />
                <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: S.textFaint, cursor: 'pointer', fontFamily: S.headline, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {/* Spam notice */}
          {tab === 'signup' && !awaitingVerification && (
            <div style={{ background: 'rgba(201,168,76,0.06)', border: `1px solid rgba(201,168,76,0.15)`, padding: '10px 14px', borderRadius: S.radiusSm }}>
              <Body style={{ fontSize: 11, margin: 0, lineHeight: 1.7, color: S.textMuted }}>
                📬 After signing up, check your <strong style={{ color: S.text }}>inbox AND spam/junk</strong> folder for a verification email. You must verify before logging in.
              </Body>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', padding: '12px 14px', borderRadius: S.radiusSm }}>
              <Body style={{ color: S.danger, fontSize: 12, margin: 0, lineHeight: 1.7 }}>{error}</Body>
              {/* Show resend button if error is about verification */}
              {error.includes('verify') || error.includes('confirmed') ? (
                <button onClick={handleResendVerification} style={{ background: 'none', border: 'none', color: S.gold, fontSize: 12, fontFamily: S.body, cursor: 'pointer', padding: '6px 0 0', textDecoration: 'underline' }}>
                  Resend verification email
                </button>
              ) : null}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: 'rgba(74,154,74,0.08)', border: '1px solid rgba(74,154,74,0.22)', padding: '14px 16px', borderRadius: S.radiusSm }}>
              <Body style={{ color: S.success, fontSize: 13, margin: 0, lineHeight: 1.8 }}>{success}</Body>
              {awaitingVerification && (
                <button onClick={handleResendVerification} style={{ background: 'none', border: 'none', color: S.gold, fontSize: 12, fontFamily: S.body, cursor: 'pointer', padding: '8px 0 0', textDecoration: 'underline', display: 'block' }}>
                  Didn't get it? Resend verification email
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          {!awaitingVerification && (
            <Btn variant="gold" full onClick={tab === 'login' ? handleLogin : handleSignup} disabled={loading}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Log In →' : 'Create Account →'}
            </Btn>
          )}

          {awaitingVerification && (
            <Btn variant="outline" full onClick={() => setTab('login')}>
              Go to Log In →
            </Btn>
          )}

          {/* Forgot password */}
          {tab === 'login' && (
            <button onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: S.textFaint, fontSize: 12, fontFamily: S.body, cursor: 'pointer', textAlign: 'center', width: '100%', padding: '4px 0', transition: 'color 0.2s' }}
              onMouseEnter={(e: any) => (e.target.style.color = S.gold)}
              onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
            >
              Forgot your password?
            </button>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.textFaint, fontSize: 12, fontFamily: S.body, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}