import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Hl, Body, Lbl } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { signUpUser, signInUser, signInWithGoogle } from '../lib/auth'

interface AuthModalProps {
  onClose: () => void
  defaultTab?: 'login' | 'signup'
  defaultRole?: 'client' | 'designer'
  lockRole?: boolean
}

export default function AuthModal({
  onClose,
  defaultTab = 'login',
  defaultRole = 'client',
  lockRole = false,
}: AuthModalProps) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [signedUpEmail, setSignedUpEmail] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: defaultRole,
  })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    setTab(defaultTab)
    setForm({ email: '', password: '', fullName: '', role: defaultRole })
    setError('')
    setSuccess('')
    setShowPw(false)
    setAwaitingVerification(false)
    setSignedUpEmail('')
  }, [defaultTab, defaultRole])

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!form.email) return setError('Enter your email.')
    if (!form.password) return setError('Enter your password.')

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await signInUser({
        email: form.email,
        password: form.password,
      })

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        setError('Verify your email before logging in.')
        setSignedUpEmail(form.email)
        setAwaitingVerification(true)
        setLoading(false)
        return
      }

      onClose()
    } catch (err: any) {
      setError(err?.message || 'Login failed.')
    }

    setLoading(false)
  }

  // ---------------- SIGNUP ----------------
  const handleSignup = async () => {
    if (!form.fullName) return setError('Enter your full name.')
    if (!form.email) return setError('Enter your email.')
    if (!form.password) return setError('Create a password.')
    if (form.password.length < 8) return setError('Min 8 characters.')

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signUpUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role as 'client' | 'designer',
      })

      setSignedUpEmail(form.email)
      setAwaitingVerification(true)

      setSuccess(
        form.role === 'designer'
          ? `Designer account created. Check email to continue application.`
          : `Account created. Verify your email before login.`
      )
    } catch (err: any) {
      setError(err?.message || 'Signup failed.')
    }

    setLoading(false)
  }

  // ---------------- RESEND ----------------
  const handleResend = async () => {
    const email = signedUpEmail || form.email
    if (!email) return setError('Enter email first.')

    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) setError(error.message)
    else setSuccess(`Verification email resent.`)
  }

  // ---------------- GOOGLE ----------------
  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    setSuccess('')

    try {
      await signInWithGoogle(form.role as 'client' | 'designer')
    } catch (err: any) {
      setError(err?.message || 'Google failed.')
      setGoogleLoading(false)
    }
  }

  // ---------------- UI ----------------
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        padding: 24,
        background: '#0b0b0d',
        borderRadius: S.radiusLg,
      }}>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 20 }}>
          {['login', 'signup'].map(t => (
            <button key={t}
              onClick={() => setTab(t as any)}
              style={{
                flex: 1,
                padding: 12,
                background: tab === t ? S.goldDim : 'transparent',
                color: tab === t ? S.gold : S.textMuted,
                border: 'none',
                cursor: 'pointer'
              }}>
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role */}
        <Lbl>
          {lockRole
            ? form.role === 'designer' ? 'Join as Designer' : 'Join as Client'
            : tab === 'login' ? 'Log in as' : 'Sign up as'}
        </Lbl>

        {!lockRole ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['client', 'designer'].map(r => (
              <div key={r}
                onClick={() => f('role', r)}
                style={{
                  border: form.role === r ? `1px solid ${S.gold}` : '1px solid #333',
                  padding: 12,
                  cursor: 'pointer'
                }}>
                {r}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 12, border: `1px solid ${S.gold}` }}>
            {form.role}
          </div>
        )}

        {/* Google */}
        <button onClick={handleGoogle}>
          Continue with Google
        </button>

        {/* Inputs */}
        {tab === 'signup' && (
          <Inp label="Full Name" value={form.fullName} onChange={(v: string) => f('fullName', v)} />
        )}

        <Inp label="Email" value={form.email} onChange={(v: string) => f('email', v)} />

        <input
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={e => f('password', e.target.value)}
        />

        {/* Actions */}
        <Btn onClick={tab === 'login' ? handleLogin : handleSignup}>
          {tab === 'login' ? 'Log In' : 'Create Account'}
        </Btn>

        {error && <Body style={{ color: 'red' }}>{error}</Body>}
        {success && <Body style={{ color: 'green' }}>{success}</Body>}

      </div>
    </div>
  )
}