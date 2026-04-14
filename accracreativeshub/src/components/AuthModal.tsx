// ── src/components/AuthModal.tsx ──

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { supabase } from '../lib/supabase'
import { signUpUser } from '../lib/auth'
import { checkRateLimit, formatRetryTime, resetRateLimit } from '../lib/rateLimiter'
import PasswordStrength from './PasswordStrength'

interface AuthModalProps {
  onClose:      () => void
  defaultTab?:  'login' | 'signup'
  defaultRole?: 'client' | 'designer'
  lockRole?:    'client' | 'designer'
}

const STYLES = `
  .ach-modal * { box-sizing: border-box; }
  .ach-modal button { all: unset; box-sizing: border-box; cursor: pointer; display: block; }
  @media (max-width: 639px) {
    .ach-sheet {
      position: fixed !important; bottom: 0 !important; left: 0 !important;
      right: 0 !important; top: auto !important; transform: none !important;
      border-radius: 20px 20px 0 0 !important; max-height: 96dvh !important; width: 100% !important;
    }
  }
  @media (min-width: 640px) {
    .ach-sheet {
      position: fixed !important; top: 50% !important; left: 50% !important;
      right: auto !important; bottom: auto !important;
      transform: translate(-50%, -50%) !important;
      border-radius: 16px !important; width: 460px !important; max-height: 92vh !important;
    }
  }
`

const FieldLabel = ({ text }: { text: string }) => (
  <p style={{ margin: '0 0 7px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.textFaint }}>{text}</p>
)

const Field = ({
  label, type = 'text', placeholder, value, onChange, onEnter, suffix,
}: {
  label: string; type?: string; placeholder?: string; value: string
  onChange: (v: string) => void; onEnter?: () => void; suffix?: React.ReactNode
}) => {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <div>
      <FieldLabel text={label} />
      <div style={{ position: 'relative' }}>
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'block', width: '100%',
            background: focused ? 'rgba(201,168,76,0.03)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${focused ? S.gold : hovered ? S.border : 'rgba(255,255,255,0.09)'}`,
            borderRadius: 10, color: S.text, fontFamily: S.body,
            fontSize: 16,
            padding: suffix ? '15px 52px 15px 16px' : '15px 16px',
            outline: 'none', transition: 'all 0.18s ease',
            boxShadow: focused ? `0 0 0 3px rgba(201,168,76,0.1)` : 'none',
            minHeight: 52,
          }}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

const Banner = ({ type, children }: { type: 'error' | 'success' | 'info'; children: React.ReactNode }) => {
  const p = {
    error:   { bg: 'rgba(239,68,68,0.08)',  bd: 'rgba(239,68,68,0.22)',   c: '#f87171'   },
    success: { bg: 'rgba(74,154,74,0.08)',  bd: 'rgba(74,154,74,0.22)',   c: '#4ade80'   },
    info:    { bg: 'rgba(201,168,76,0.06)', bd: 'rgba(201,168,76,0.14)', c: S.textMuted },
  }[type]
  return (
    <div style={{ background: p.bg, border: `1px solid ${p.bd}`, borderRadius: 9, padding: '12px 15px' }}>
      <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: p.c, lineHeight: 1.7 }}>{children}</p>
    </div>
  )
}

export default function AuthModal({
  onClose, defaultTab = 'login', defaultRole, lockRole,
}: AuthModalProps) {
  const [tab, setTab]         = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [pending, setPending] = useState('')
  const [form, setForm]       = useState({
    email: '', password: '', fullName: '',
    role: lockRole ?? defaultRole ?? 'client',
  })
  const [consentTerms, setConsentTerms]         = useState(false)
  const [consentDesigner, setConsentDesigner]   = useState(false)

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    setForm({ email: '', password: '', fullName: '', role: lockRole ?? defaultRole ?? 'client' })
    setError(''); setSuccess(''); setShowPw(false); setPending('')
    setConsentTerms(false); setConsentDesigner(false)
  }, [tab])

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (!isValidEmail(form.email))     { setError('Please enter a valid email.'); return }
    const rl = checkRateLimit('login', form.email.toLowerCase())
    if (!rl.allowed) { setError(`Too many attempts. Wait ${formatRetryTime(rl.retryAfterMs!)}.`); return }
    setLoading(true); setError(''); setSuccess('')
    const { data, error: e } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(), password: form.password,
    })
    if (e) {
      setError(e.message.includes('not confirmed')
        ? 'Please verify your email before logging in.'
        : 'Incorrect email or password.')
      if (e.message.includes('not confirmed')) setPending(form.email)
      setLoading(false); return
    }
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      setError('Please verify your email first. Check inbox and spam.')
      setPending(form.email); setLoading(false); return
    }
    resetRateLimit('login', form.email.toLowerCase())
    setLoading(false); onClose()
  }

  const handleSignup = async () => {
    if (!form.fullName.trim())     { setError('Please enter your full name.'); return }
    if (!isValidEmail(form.email)) { setError('Please enter a valid email.'); return }
    if (form.password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (!consentTerms)             { setError('Please agree to the Terms of Service and Privacy Policy to continue.'); return }
    if ((form.role === 'designer' || lockRole === 'designer') && !consentDesigner) {
      setError('Please agree to the Designer Agreement to continue.'); return
    }
    const rl = checkRateLimit('signup')
    if (!rl.allowed) { setError(`Too many signups. Wait ${formatRetryTime(rl.retryAfterMs!)}.`); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await signUpUser({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        role:     form.role as 'client' | 'designer',
      })
      setPending(form.email)
      setSuccess(`Account created! Check ${form.email.trim()} (including spam) for a verification link.`)
    } catch (err: any) {
      setError(err?.message?.includes('already')
        ? 'An account with this email already exists. Please log in.'
        : 'Signup failed. Please try again.')
    }
    setLoading(false)
  }

  const handleResend = async () => {
    const email = (pending || form.email).trim().toLowerCase()
    if (!email) { setError('Enter your email first.'); return }
    const rl = checkRateLimit('resendVerify', email)
    if (!rl.allowed) { setError(`Wait ${formatRetryTime(rl.retryAfterMs!)} before resending.`); return }
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
    if (error) setError('Failed to resend. Try again.')
    else setSuccess(`Verification email resent to ${email}.`)
  }

  const handleForgot = async () => {
    if (!form.email || !isValidEmail(form.email)) { setError('Enter a valid email first.'); return }
    const rl = checkRateLimit('passwordReset', form.email.toLowerCase())
    if (!rl.allowed) { setError(`Wait ${formatRetryTime(rl.retryAfterMs!)} before requesting another reset.`); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(form.email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/`,
    })
    setLoading(false)
    setSuccess('If an account exists, a reset link has been sent. Check inbox and spam.')
  }

  const showResend = !!(pending || (error && (error.includes('verify') || error.includes('confirm'))))
  const isLogin    = tab === 'login'
  const isSignup   = tab === 'signup'

  return (
    <>
      <style>{STYLES}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 290, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }} />

      <div className="ach-modal ach-sheet" style={{ zIndex: 300, background: '#111114', border: '1px solid rgba(201,168,76,0.14)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflowY: 'auto', padding: '0 0 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 0' }}>
          <button onClick={onClose}
            style={{ color: S.textFaint, fontSize: 22, lineHeight: 1, padding: 4, transition: 'color 0.15s' }}
            onMouseEnter={(e: any) => (e.target.style.color = S.text)}
            onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
          >×</button>
        </div>

        <div style={{ padding: '4px 28px 0' }}>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ width: 28, height: 2, background: S.gold, marginBottom: 14 }} />
            <h2 style={{ margin: '0 0 6px', fontFamily: S.headline, fontWeight: 300, fontSize: 'clamp(22px,5vw,28px)', color: S.text, lineHeight: 1.15 }}>
              {isLogin ? 'Welcome back.'
                : lockRole === 'designer'
                  ? <><em style={{ color: S.gold, fontStyle: 'italic' }}>Apply</em> to join.</>
                  : <><em style={{ color: S.gold, fontStyle: 'italic' }}>Join</em> the Hub.</>}
            </h2>
            <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.5 }}>
              {isLogin ? 'Sign in to access your account'
                : lockRole === 'designer' ? 'Create your designer account to apply'
                : 'Create your free account'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 3, marginBottom: 22 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, textAlign: 'center',
                fontFamily: S.headline, fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', fontWeight: 700,
                background: tab === t ? S.gold : 'transparent',
                color:      tab === t ? '#131313' : S.textMuted,
                boxShadow:  tab === t ? '0 2px 8px rgba(201,168,76,0.22)' : 'none',
                transition: 'all 0.18s ease',
              }}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Role selector */}
            {isSignup && !lockRole && (
              <div>
                <FieldLabel text="I am a" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { k: 'client',   icon: '◉', label: 'Client',   sub: 'I need creative work'      },
                    { k: 'designer', icon: '◈', label: 'Designer',  sub: 'I offer creative services' },
                  ] as const).map(r => {
                    const on = form.role === r.k
                    return (
                      <button key={r.k} onClick={() => f('role', r.k)} style={{
                        background:   on ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                        border:       `1px solid ${on ? S.gold : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 10, padding: '14px 12px',
                        textAlign: 'left', transition: 'all 0.18s ease',
                        transform: on ? 'scale(1.01)' : 'scale(1)',
                      }}>
                        <div style={{ fontFamily: S.headline, fontSize: 18, color: on ? S.gold : S.textFaint, marginBottom: 5 }}>{r.icon}</div>
                        <div style={{ fontFamily: S.headline, fontSize: 13, fontWeight: 700, color: on ? S.text : S.textMuted, marginBottom: 3 }}>{r.label}</div>
                        <div style={{ fontFamily: S.body, fontSize: 11, color: on ? S.textMuted : S.textFaint, lineHeight: 1.4 }}>{r.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Locked role badge */}
            {isSignup && lockRole && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: 10, padding: '12px 16px' }}>
                <span style={{ color: S.gold, fontSize: 20 }}>{lockRole === 'designer' ? '◈' : '◉'}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.gold }}>
                    {lockRole === 'designer' ? 'Designer Account' : 'Client Account'}
                  </p>
                  <p style={{ margin: 0, fontFamily: S.body, fontSize: 12, color: S.textMuted }}>
                    {lockRole === 'designer' ? 'Apply to list your work on the marketplace' : 'Find and hire verified designers'}
                  </p>
                </div>
              </div>
            )}

            {/* Fields */}
            {isSignup && (
              <Field label="Full Name" placeholder="e.g. Kofi Mensah" value={form.fullName} onChange={v => f('fullName', v)} />
            )}

            <Field label="Email" type="email" placeholder="your@email.com" value={form.email}
              onChange={v => f('email', v)} onEnter={isLogin ? handleLogin : undefined} />

            {/* Password + strength indicator */}
            <div>
              <Field
                label={isSignup ? 'Password — min 8 characters' : 'Password'}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={v => f('password', v)}
                onEnter={isLogin ? handleLogin : handleSignup}
                suffix={
                  <button onClick={() => setShowPw(v => !v)} style={{
                    fontFamily: S.headline, fontSize: 9, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: S.textFaint,
                    padding: '4px 2px', transition: 'color 0.15s',
                  }}
                    onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                    onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                  >{showPw ? 'Hide' : 'Show'}</button>
                }
              />
              {/* PASSWORD STRENGTH — signup only, matches PasswordResetPage behaviour */}
              {isSignup && <PasswordStrength password={form.password} />}
            </div>

            {isSignup && !success && (
              <Banner type="info">
                📬 After signing up, check <strong style={{ color: S.text }}>inbox + spam</strong> for a verification link. You must verify before logging in.
              </Banner>
            )}
            {error   && <Banner type="error">{error}</Banner>}
            {success && <Banner type="success">{success}</Banner>}

            {/* Consent checkboxes — signup only */}
            {isSignup && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={e => setConsentTerms(e.target.checked)}
                    style={{ marginTop: 3, accentColor: '#c9a84c', flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: S.body, fontSize: 12, color: S.textMuted, lineHeight: 1.6 }}>
                    I agree to the{' '}
                    <a href="https://accracreativeshub.com/terms" target="_blank" rel="noopener noreferrer"
                      style={{ color: S.gold, textDecoration: 'underline' }}>Terms of Service</a>
                    {' '}and acknowledge the{' '}
                    <a href="https://accracreativeshub.com/privacy" target="_blank" rel="noopener noreferrer"
                      style={{ color: S.gold, textDecoration: 'underline' }}>Privacy Policy</a>
                    . <span style={{ color: S.danger }}>*</span>
                  </span>
                </label>
                {(form.role === 'designer' || lockRole === 'designer') && (
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consentDesigner}
                      onChange={e => setConsentDesigner(e.target.checked)}
                      style={{ marginTop: 3, accentColor: '#c9a84c', flexShrink: 0 }}
                    />
                    <span style={{ fontFamily: S.body, fontSize: 12, color: S.textMuted, lineHeight: 1.6 }}>
                      I have read and agree to the{' '}
                      <a href="https://accracreativeshub.com/designer-agreement" target="_blank" rel="noopener noreferrer"
                        style={{ color: S.gold, textDecoration: 'underline' }}>Designer Agreement</a>
                      , including commission terms and independent contractor status.{' '}
                      <span style={{ color: S.danger }}>*</span>
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={isLogin ? handleLogin : handleSignup}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', minHeight: 54,
                background: loading ? 'rgba(201,168,76,0.45)' : S.gold,
                border: 'none', borderRadius: 10,
                fontFamily: S.headline, fontSize: 11,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                fontWeight: 700, color: '#131313',
                transition: 'all 0.18s ease', marginTop: 2,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e: any) => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,168,76,0.35)' }}
              onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)' }}
            >
              {loading ? 'Please wait…' : isLogin ? 'Log In →' : 'Create Account →'}
            </button>

            {/* Secondary links */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 4 }}>
              {showResend && (
                <button onClick={handleResend} disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', minHeight: 44, background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.22)', borderRadius: 9,
                  fontFamily: S.body, fontSize: 13, color: S.gold,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.background = 'rgba(201,168,76,0.06)')}
                  onMouseLeave={(e: any) => (e.currentTarget.style.background = 'transparent')}
                >Resend verification email</button>
              )}
              {isLogin && (
                <button onClick={handleForgot} style={{
                  fontFamily: S.body, fontSize: 13, color: S.textFaint,
                  padding: '4px 0', transition: 'color 0.15s',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = S.gold)}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = S.textFaint)}
                >Forgot your password?</button>
              )}
              <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: S.textFaint, textAlign: 'center' }}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setTab(isLogin ? 'signup' : 'login')} style={{
                  fontFamily: S.body, fontSize: 13, color: S.gold,
                  textDecoration: 'underline', padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}