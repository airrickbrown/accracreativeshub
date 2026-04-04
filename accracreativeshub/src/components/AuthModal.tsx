// ── src/components/AuthModal.tsx ──

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { signUpUser, signInWithGoogle } from '../lib/auth'

interface AuthModalProps {
  onClose: () => void
  defaultTab?: 'login' | 'signup'
  lockRole?: 'client' | 'designer'
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: '0 0 8px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.textFaint }}>
    {children}
  </p>
)

const Field = ({
  label, type = 'text', placeholder, value, onChange, onKeyDown, suffix,
}: any) => {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? S.gold : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8,
            color: S.text,
            fontFamily: S.body,
            fontSize: 16,
            padding: suffix ? '14px 48px 14px 16px' : '14px 16px',
            outline: 'none',
            minHeight: 50,
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

const Banner = ({ type, children }: any) => {
  const styles = {
    error:   { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)', text: '#f87171' },
    success: { bg: 'rgba(74,154,74,0.08)',  border: 'rgba(74,154,74,0.2)', text: '#4ade80' },
    info:    { bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.14)', text: S.textMuted },
  }[type]

  return (
    <div style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 8, padding: '12px 16px' }}>
      <p style={{ margin: 0, fontSize: 13, color: styles.text }}>{children}</p>
    </div>
  )
}

export default function AuthModal({ onClose, defaultTab = 'login', lockRole }: AuthModalProps) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: lockRole ?? 'client',
  })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    setForm({ email: '', password: '', fullName: '', role: lockRole ?? 'client' })
    setError('')
    setSuccess('')
  }, [tab, lockRole])

  // LOGIN
  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Fill all fields.')

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      setError('Verify your email first.')
      setPendingEmail(form.email)
      setLoading(false)
      return
    }

    onClose()
    setLoading(false)
  }

  // SIGNUP
  const handleSignup = async () => {
    if (!form.fullName || !form.email || !form.password) return setError('Fill all fields.')
    if (form.password.length < 8) return setError('Min 8 characters.')

    setLoading(true)
    setError('')

    try {
      await signUpUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
      })

      setPendingEmail(form.email)
      setSuccess('Check your email to verify your account.')
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  // GOOGLE (FIXED)
  const handleGoogle = async () => {
    setGLoading(true)
    setError('')

    try {
      await signInWithGoogle(form.role)
    } catch (err: any) {
      setError(err.message)
      setGLoading(false)
    }
  }

  // RESEND (FIXED)
  const handleResend = async () => {
    const email = pendingEmail || form.email
    if (!email) return

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) setError(error.message)
    else setSuccess('Verification email resent.')
  }

  return (
    <>
      {/* BACKDROP */}
      <div onClick={onClose} style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
      }} />

      {/* MODAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#0b0b0d',
          borderRadius: 14,
          padding: 24,
        }}>

          <h2 style={{ color: S.text }}>
            {tab === 'login' ? 'Welcome back' : 'Join the Hub'}
          </h2>

          <button onClick={handleGoogle}>
            {gLoading ? 'Loading...' : 'Continue with Google'}
          </button>

          <div style={{ margin: '12px 0' }}>or</div>

          {tab === 'signup' && (
            <Field label="Full Name" value={form.fullName} onChange={(v:any)=>f('fullName',v)} />
          )}

          <Field label="Email" value={form.email} onChange={(v:any)=>f('email',v)} />

          <Field
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={(v:any)=>f('password',v)}
            suffix={
              <button onClick={()=>setShowPw(!showPw)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            }
          />

          <button onClick={tab === 'login' ? handleLogin : handleSignup}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Log In' : 'Sign Up'}
          </button>

          {error && <Banner type="error">{error}</Banner>}
          {success && <Banner type="success">{success}</Banner>}

          <button onClick={()=>setTab(tab === 'login' ? 'signup' : 'login')}>
            Switch
          </button>

          <button onClick={onClose}>Cancel</button>

        </div>
      </div>
    </>
  )
}