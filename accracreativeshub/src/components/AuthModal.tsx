import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Hl, Body, Lbl } from './UI'
import { supabase } from '../lib/supabase'
import { signUpUser } from '../lib/auth'

interface AuthModalProps {
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

const EMPTY_FORM = {
  email: '',
  password: '',
  fullName: '',
  role: 'client',
}

export default function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState(EMPTY_FORM)

  const f = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const resetForm = (nextTab?: 'login' | 'signup') => {
    setForm({
      ...EMPTY_FORM,
      role: nextTab === 'designer' ? 'designer' : 'client',
    })
    setError('')
    setSuccess('')
  }

  useEffect(() => {
    setForm({
      ...EMPTY_FORM,
      role: 'client',
    })
    setError('')
    setSuccess('')
  }, [tab])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) setError(error.message)
    else onClose()

    setLoading(false)
  }

  const handleSignup = async () => {
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
      setSuccess('Account created! Check your email to verify your account.')
      setForm({
        ...EMPTY_FORM,
        role: 'client',
      })
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ display: 'flex', gap: 1, background: S.borderFaint, marginBottom: 32 }}>
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: tab === t ? S.goldDim : S.surface,
                border: 'none',
                color: tab === t ? S.gold : S.textMuted,
                padding: '12px',
                fontFamily: S.headline,
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <Hl style={{ fontSize: 28, fontWeight: 300, marginBottom: 24 }}>
          {tab === 'login' ? 'Welcome back.' : <em style={{ fontStyle: 'italic', color: S.gold }}>Join the Hub.</em>}
        </Hl>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'signup' && (
            <>
              <Inp
                label="Full Name"
                placeholder="e.g. Kofi Mensah"
                value={form.fullName}
                onChange={(v) => f('fullName', v)}
              />

              <div>
                <Lbl style={{ marginBottom: 8 }}>I am a</Lbl>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { k: 'client', l: 'Client', sub: 'I need design work' },
                    { k: 'designer', l: 'Designer', sub: 'I offer design services' },
                  ].map((r) => (
                    <div
                      key={r.k}
                      onClick={() => f('role', r.k)}
                      style={{
                        background: form.role === r.k ? S.goldDim : S.bgLow,
                        border: `1px solid ${form.role === r.k ? S.gold : S.border}`,
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <Hl style={{ fontSize: 14, fontWeight: 600 }}>{r.l}</Hl>
                      <Body style={{ fontSize: 11, marginTop: 4 }}>{r.sub}</Body>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Inp
            label="Email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(v) => f('email', v)}
          />

          <Inp
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={(v) => f('password', v)}
            type="password"
          />

          {error && <Body style={{ color: S.danger, fontSize: 12 }}>{error}</Body>}
          {success && <Body style={{ color: S.success, fontSize: 12 }}>{success}</Body>}

          <Btn
            variant="gold"
            full
            onClick={tab === 'login' ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Log In →' : 'Create Account →'}
          </Btn>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: S.textFaint,
              fontSize: 11,
              fontFamily: S.body,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}