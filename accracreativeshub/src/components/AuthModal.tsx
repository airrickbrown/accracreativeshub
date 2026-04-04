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

  // 🔥 Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    setForm({ email: '', password: '', fullName: '', role: lockRole ?? 'client' })
    setError('')
    setSuccess('')
  }, [tab, lockRole])

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

  const handleSignup = async () => {
    if (!form.fullName || !form.email || !form.password) return setError('Fill all fields.')
    if (form.password.length < 8) return setError('Min 8 characters.')

    setLoading(true)
    setError('')

    try {
      await signUpUser(form)
      setPendingEmail(form.email)
      setSuccess('Check your email to verify your account.')
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

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

  const handleResend = async () => {
    const email = pendingEmail || form.email
    if (!email) return

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) setError(error.message)
    else setSuccess('Verification email resent.')
  }

  return (
    <>
      {/* 🔥 BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      />

      {/* 🔥 MODAL WRAPPER */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* 🔥 MODAL CARD */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#0b0b0d',
            borderRadius: 16,
            padding: 28,
            border: '1px solid rgba(201,168,76,0.12)',
          }}
        >
          <h2 style={{ color: S.text, marginBottom: 16 }}>
            {tab === 'login' ? 'Welcome back' : 'Join the Hub'}
          </h2>

          {/* GOOGLE */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 10,
              background: '#fff',
              color: '#000',
              border: 'none',
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            {gLoading ? 'Loading...' : 'Continue with Google'}
          </button>

          <div style={{ textAlign: 'center', margin: '10px 0', color: S.textFaint }}>or</div>

          {/* INPUTS */}
          {tab === 'signup' && (
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={e => f('fullName', e.target.value)}
              style={inputStyle}
            />
          )}

          <input
            placeholder="Email"
            value={form.email}
            onChange={e => f('email', e.target.value)}
            style={inputStyle}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => f('password', e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute',
                right: 12,
                top: 12,
                background: 'none',
                border: 'none',
                color: S.textFaint,
                cursor: 'pointer',
              }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={tab === 'login' ? handleLogin : handleSignup}
            style={{
              width: '100%',
              padding: 16,
              marginTop: 16,
              borderRadius: 10,
              background: S.gold,
              border: 'none',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Log In' : 'Create Account'}
          </button>

          {/* ERROR */}
          {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
          {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}

          {/* SWITCH */}
          <button
            onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
            style={{ marginTop: 12 }}
          >
            Switch
          </button>
        </div>
      </div>
    </>
  )
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  marginBottom: 12,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
}