// ── src/components/AuthModal.tsx ──
// Premium dark + gold UI. All Supabase auth logic unchanged.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { signUpUser } from '../lib/auth'

interface AuthModalProps {
  onClose:     () => void
  defaultTab?: 'login' | 'signup'
  lockRole?:   'client' | 'designer'
}

// ─────────────────────────────────────────────
// Scoped reset — no default browser button styles anywhere in this modal
// ─────────────────────────────────────────────
const RESET: React.CSSProperties = {
  all:         'unset' as any,
  boxSizing:   'border-box',
  cursor:      'pointer',
  display:     'block',
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    margin: '0 0 7px',
    fontFamily:     S.headline,
    fontSize:       10,
    letterSpacing:  '0.18em',
    textTransform:  'uppercase',
    color:          S.textFaint,
  }}>
    {children}
  </p>
)

interface FieldProps {
  label:      string
  type?:      string
  placeholder?: string
  value:      string
  onChange:   (v: string) => void
  onEnter?:   () => void
  after?:     React.ReactNode
}

const Field = ({ label, type = 'text', placeholder, value, onChange, onEnter, after }: FieldProps) => {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          style={{
            display:         'block',
            width:           '100%',
            boxSizing:       'border-box',
            background:      'rgba(255,255,255,0.05)',
            border:          `1px solid ${focused ? S.gold : 'rgba(255,255,255,0.09)'}`,
            borderRadius:    10,
            color:           S.text,
            fontFamily:      S.body,
            fontSize:        16,               // prevents iOS zoom
            padding:         after ? '15px 52px 15px 16px' : '15px 16px',
            outline:         'none',
            transition:      'border-color 0.2s',
            minHeight:       52,
          }}
        />
        {after && (
          <div style={{
            position:   'absolute',
            right:      14,
            top:        '50%',
            transform:  'translateY(-50%)',
          }}>
            {after}
          </div>
        )}
      </div>
    </div>
  )
}

interface BannerProps { type: 'error' | 'success' | 'info'; children: React.ReactNode }
const Banner = ({ type, children }: BannerProps) => {
  const palette = {
    error:   { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)',   color: '#f87171' },
    success: { bg: 'rgba(74,154,74,0.08)',  border: 'rgba(74,154,74,0.22)',   color: '#4ade80' },
    info:    { bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.14)', color: S.textMuted },
  }[type]
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 9, padding: '12px 15px' }}>
      <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: palette.color, lineHeight: 1.7 }}>
        {children}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function AuthModal({ onClose, defaultTab = 'login', lockRole }: AuthModalProps) {
  const [tab, setTab]           = useState(defaultTab)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [pending, setPending]   = useState('')
  const [form, setForm]         = useState({ email: '', password: '', fullName: '', role: lockRole ?? 'client' })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    setForm({ email: '', password: '', fullName: '', role: lockRole ?? 'client' })
    setError(''); setSuccess(''); setShowPw(false); setPending('')
  }, [tab])

  // ── Handlers (logic unchanged) ───────────────────────

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError(''); setSuccess('')
    const { data, error: e } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (e) {
      setError(
        e.message.includes('Invalid login') ? 'Incorrect email or password.' :
        e.message.includes('not confirmed')  ? 'Please verify your email before logging in.' :
        e.message
      )
      if (e.message.includes('not confirmed')) setPending(form.email)
      setLoading(false); return
    }
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      setError('Please verify your email first. Check inbox and spam.')
      setPending(form.email)
      setLoading(false); return
    }
    setLoading(false); onClose()
  }

  const handleSignup = async () => {
    if (!form.fullName)           { setError('Please enter your full name.'); return }
    if (!form.email)              { setError('Please enter your email.'); return }
    if (!form.password)           { setError('Please create a password.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await signUpUser({ email: form.email, password: form.password, fullName: form.fullName, role: form.role as 'client' | 'designer' })
      setPending(form.email)
      setSuccess(
        form.role === 'designer'
          ? `Done! Check ${form.email} for a verification link (including spam). Verify before logging in.`
          : `Account created! Check ${form.email} for a verification link (including spam).`
      )
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.')
    }
    setLoading(false)
  }

  const handleResend = async () => {
    const email = pending || form.email
    if (!email) { setError('Enter your email first.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(`Verification email resent to ${email}.`)
  }

  const handleGoogle = async () => {
    setGLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (error) { setError(error.message); setGLoading(false) }
  }

  const handleForgot = async () => {
    if (!form.email) { setError('Enter your email above first.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/` })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Password reset link sent — check inbox and spam.')
  }

  const showResend  = !!(pending || (error && (error.includes('verify') || error.includes('confirm'))))
  const isLogin     = tab === 'login'
  const isSignup    = tab === 'signup'

  return (
    <>
      <style>{`
        /* Scoped to modal — reset ALL button defaults */
        .ach-modal button {
          all: unset;
          box-sizing: border-box;
          cursor: pointer;
        }
        /* Bottom sheet on mobile, centered card on desktop */
        @media (max-width: 639px) {
          .ach-modal-sheet {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            transform: none !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 96dvh !important;
          }
        }
        @media (min-width: 640px) {
          .ach-modal-sheet {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            bottom: auto !important;
            transform: translate(-50%, -50%) !important;
            border-radius: 16px !important;
            width: 460px !important;
            max-height: 92vh !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         290,
          background:     'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(14px)',
        }}
      />

      {/* Sheet */}
      <div
        className="ach-modal ach-modal-sheet"
        style={{
          zIndex:     300,
          background: '#111114',
          border:     '1px solid rgba(201,168,76,0.14)',
          boxShadow:  '0 32px 80px rgba(0,0,0,0.7)',
          overflowY:  'auto',
          padding:    '0 0 40px',
        }}
      >
        {/* ── Drag handle ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* ── Close (desktop) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 0' }}>
          <button
            onClick={onClose}
            style={{ color: S.textFaint, fontSize: 22, lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ padding: '4px 28px 0' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 28 }}>
            {/* Gold accent line */}
            <div style={{ width: 28, height: 2, background: S.gold, marginBottom: 16 }} />

            <h2 style={{
              margin:      '0 0 6px',
              fontFamily:  S.headline,
              fontWeight:  300,
              fontSize:    'clamp(24px,5vw,30px)',
              color:       S.text,
              lineHeight:  1.15,
            }}>
              {isLogin
                ? 'Welcome back.'
                : <><em style={{ color: S.gold, fontStyle: 'italic' }}>Join</em> the Hub.</>}
            </h2>

            <p style={{
              margin:     0,
              fontFamily: S.body,
              fontSize:   13,
              color:      S.textMuted,
              lineHeight: 1.5,
            }}>
              {isLogin
                ? 'Sign in to access your account'
                : form.role === 'designer'
                ? 'Apply to join as a verified designer'
                : 'Create your free client account'}
            </p>
          </div>

          {/* ── Tab switcher ── */}
          <div style={{
            display:      'flex',
            gap:          3,
            background:   'rgba(255,255,255,0.05)',
            border:       '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding:      3,
            marginBottom: 26,
          }}>
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex:          1,
                  padding:       '10px 0',
                  borderRadius:  8,
                  fontFamily:    S.headline,
                  fontSize:      10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight:    700,
                  textAlign:     'center',
                  transition:    'all 0.18s ease',
                  background:    tab === t ? S.gold           : 'transparent',
                  color:         tab === t ? '#131313'        : S.textMuted,
                  boxShadow:     tab === t ? '0 2px 8px rgba(201,168,76,0.25)' : 'none',
                }}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── Role selector (signup + not locked) ── */}
            {isSignup && !lockRole && (
              <div>
                <FieldLabel>I am a</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { k: 'client',   icon: '◉', label: 'Client',   sub: 'I need design work'      },
                    { k: 'designer', icon: '◈', label: 'Designer',  sub: 'I offer design services' },
                  ] as const).map(r => {
                    const active = form.role === r.k
                    return (
                      <button
                        key={r.k}
                        onClick={() => f('role', r.k)}
                        style={{
                          background:   active ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                          border:       `1px solid ${active ? S.gold : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 10,
                          padding:      '14px 12px',
                          textAlign:    'left',
                          transition:   'all 0.18s ease',
                        }}
                      >
                        <div style={{ fontFamily: S.headline, fontSize: 18, color: active ? S.gold : S.textFaint, marginBottom: 5, lineHeight: 1 }}>
                          {r.icon}
                        </div>
                        <div style={{ fontFamily: S.headline, fontSize: 13, fontWeight: 700, color: active ? S.text : S.textMuted, marginBottom: 3 }}>
                          {r.label}
                        </div>
                        <div style={{ fontFamily: S.body, fontSize: 11, color: active ? S.textMuted : S.textFaint, lineHeight: 1.4 }}>
                          {r.sub}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Locked role badge */}
            {isSignup && lockRole && (
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          12,
                background:   'rgba(201,168,76,0.06)',
                border:       '1px solid rgba(201,168,76,0.14)',
                borderRadius: 10,
                padding:      '12px 16px',
              }}>
                <span style={{ color: S.gold, fontSize: 20, lineHeight: 1 }}>
                  {lockRole === 'designer' ? '◈' : '◉'}
                </span>
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

            {/* ── Google button ── */}
            <button
              onClick={handleGoogle}
              disabled={gLoading}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            10,
                width:          '100%',
                minHeight:      52,
                background:     '#fff',
                border:         'none',
                borderRadius:   10,
                fontFamily:     S.body,
                fontSize:       15,
                fontWeight:     600,
                color:          '#1a1a1a',
                opacity:        gLoading ? 0.65 : 1,
                transition:     'opacity 0.2s',
                boxShadow:      '0 2px 12px rgba(0,0,0,0.25)',
              }}
            >
              {/* Google icon SVG — always visible */}
              <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {gLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* ── Divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontFamily: S.body, fontSize: 12, color: S.textFaint }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* ── Form ── */}

            {isSignup && (
              <Field
                label="Full Name"
                placeholder="e.g. Kofi Mensah"
                value={form.fullName}
                onChange={v => f('fullName', v)}
              />
            )}

            <Field
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={v => f('email', v)}
              onEnter={isLogin ? handleLogin : undefined}
            />

            <Field
              label={isSignup ? 'Password — min 8 characters' : 'Password'}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={v => f('password', v)}
              onEnter={isLogin ? handleLogin : handleSignup}
              after={
                <button
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    fontFamily:    S.headline,
                    fontSize:      9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color:         S.textFaint,
                    padding:       '4px 2px',
                  }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              }
            />

            {/* Signup info notice */}
            {isSignup && !success && (
              <Banner type="info">
                📬 After signing up, check <strong style={{ color: S.text }}>inbox + spam</strong> for a verification link. You must verify before logging in.
              </Banner>
            )}

            {/* Error */}
            {error && <Banner type="error">{error}</Banner>}

            {/* Success */}
            {success && <Banner type="success">{success}</Banner>}

            {/* ── CTA ── */}
            <button
              onClick={isLogin ? handleLogin : handleSignup}
              disabled={loading}
              style={{
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                width:         '100%',
                minHeight:     54,
                background:    loading ? 'rgba(201,168,76,0.45)' : S.gold,
                border:        'none',
                borderRadius:  10,
                fontFamily:    S.headline,
                fontSize:      11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight:    700,
                color:         '#131313',
                transition:    'background 0.2s',
                marginTop:     2,
                boxShadow:     loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
              }}
            >
              {loading ? 'Please wait…' : isLogin ? 'Log In →' : 'Create Account →'}
            </button>

            {/* ── Secondary links ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 4 }}>

              {/* Resend verification */}
              {showResend && (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    justifyContent:'center',
                    width:         '100%',
                    minHeight:     44,
                    background:    'transparent',
                    border:        '1px solid rgba(201,168,76,0.22)',
                    borderRadius:  9,
                    fontFamily:    S.body,
                    fontSize:      13,
                    color:         S.gold,
                    transition:    'border-color 0.2s',
                  }}
                >
                  Resend verification email
                </button>
              )}

              {/* Forgot password */}
              {isLogin && (
                <button
                  onClick={handleForgot}
                  style={{
                    fontFamily: S.body,
                    fontSize:   13,
                    color:      S.textFaint,
                    padding:    '4px 0',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = S.gold)}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = S.textFaint)}
                >
                  Forgot your password?
                </button>
              )}

              {/* Switch tab */}
              <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: S.textFaint, textAlign: 'center' }}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setTab(isLogin ? 'signup' : 'login')}
                  style={{
                    fontFamily:     S.body,
                    fontSize:       13,
                    color:          S.gold,
                    textDecoration: 'underline',
                    padding:        0,
                  }}
                >
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