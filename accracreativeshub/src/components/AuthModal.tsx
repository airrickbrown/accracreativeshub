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

    if (error) {
      setError(error.message)
    } else {
      onClose()
    }

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
      setSuccess('Account created successfully. Please check your email to continue.')
      setForm({
        ...EMPTY_FORM,
        role: 'client',
      })
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px 22px',
          background: 'linear-gradient(180deg, rgba(18,18,22,0.98) 0%, rgba(10,10,13,0.98) 100%)',
          border: '1px solid rgba(201,168,76,0.14)',
          boxShadow: S.shadowStrong,
          borderRadius: S.radiusLg,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 1,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${S.borderFaint}`,
            marginBottom: 26,
            borderRadius: S.radiusSm,
            overflow: 'hidden',
          }}
        >
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: tab === t ? S.goldDim : 'transparent',
                border: 'none',
                color: tab === t ? S.gold : S.textMuted,
                padding: '13px 10px',
                fontFamily: S.headline,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <Hl style={{ fontSize: 'clamp(28px, 6vw, 34px)', fontWeight: 300, marginBottom: 22 }}>
          {tab === 'login'
            ? 'Welcome back.'
            : <em style={{ fontStyle: 'italic', color: S.gold }}>Join the Hub.</em>}
        </Hl>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tab === 'signup' && (
            <>
              <Inp
                label="Full Name"
                placeholder="e.g. Kofi Mensah"
                value={form.fullName}
                onChange={(v: string) => f('fullName', v)}
              />

              <div>
                <Lbl style={{ marginBottom: 10 }}>I am a</Lbl>
                <div
                  className="auth-role-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  {[
                    { k: 'client', l: 'Client', sub: 'I need design work' },
                    { k: 'designer', l: 'Designer', sub: 'I offer design services' },
                  ].map((r) => {
                    const active = form.role === r.k

                    return (
                      <div
                        key={r.k}
                        onClick={() => f('role', r.k)}
                        style={{
                          background: active ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.015)',
                          border: `1px solid ${active ? S.gold : 'rgba(255,255,255,0.12)'}`,
                          padding: '16px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          boxShadow: active ? '0 0 0 1px rgba(201,168,76,0.08) inset' : 'none',
                          borderRadius: S.radiusSm,
                        }}
                      >
                        <Hl style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                          {r.l}
                        </Hl>
                        <Body
                          style={{
                            fontSize: 11,
                            margin: 0,
                            color: active ? S.text : S.textMuted,
                          }}
                        >
                          {r.sub}
                        </Body>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <Inp
            label="Email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(v: string) => f('email', v)}
          />

          <Inp
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={(v: string) => f('password', v)}
            type="password"
          />

          {error && (
            <div
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.24)',
                padding: '12px 14px',
                borderRadius: S.radiusSm,
              }}
            >
              <Body style={{ color: S.danger, fontSize: 12, margin: 0, lineHeight: 1.7 }}>
                {error}
              </Body>
            </div>
          )}

          {success && (
            <div
              style={{
                background: 'rgba(74,154,74,0.08)',
                border: '1px solid rgba(74,154,74,0.22)',
                padding: '14px 16px',
                borderRadius: S.radiusSm,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.02) inset',
              }}
            >
              <Body style={{ color: S.success, fontSize: 12, margin: 0, lineHeight: 1.8 }}>
                {success}
              </Body>
            </div>
          )}

          <Btn
            variant="gold"
            full
            onClick={tab === 'login' ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Log In →' : 'Create Account →'}
          </Btn>
        </div>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: S.textFaint,
              fontSize: 12,
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