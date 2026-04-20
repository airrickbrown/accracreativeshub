// ── src/components/GoogleRoleModal.tsx ──
// Shown after Google OAuth for brand-new users who have no profile row yet.
// Captures role + consent, upserts profile, creates designer row if needed.

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../lib/auth'

interface Props {
  user:       any
  onComplete: (role: 'client' | 'designer') => void
}

const STYLES = `
  .grm * { box-sizing: border-box; }
  .grm button { all: unset; box-sizing: border-box; cursor: pointer; display: block; }
  @media (max-width: 639px) {
    .grm-sheet {
      position: fixed !important; bottom: 0 !important; left: 0 !important;
      right: 0 !important; top: auto !important; transform: none !important;
      border-radius: 20px 20px 0 0 !important; max-height: 96dvh !important; width: 100% !important;
    }
  }
  @media (min-width: 640px) {
    .grm-sheet {
      position: fixed !important; top: 50% !important; left: 50% !important;
      right: auto !important; bottom: auto !important;
      transform: translate(-50%, -50%) !important;
      border-radius: 16px !important; width: 460px !important; max-height: 92vh !important;
    }
  }
`

export default function GoogleRoleModal({ user, onComplete }: Props) {
  const fullName    = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const hintRole    = (() => { try { return localStorage.getItem('ach_oauth_role_hint') as 'client' | 'designer' | null } catch { return null } })()

  const [role, setRole]                         = useState<'client' | 'designer'>(hintRole === 'designer' ? 'designer' : 'client')
  const [consentTerms, setConsentTerms]         = useState(false)
  const [consentDesigner, setConsentDesigner]   = useState(false)
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')

  const handleConfirm = async () => {
    if (!consentTerms) { setError('Please agree to the Terms of Service and Privacy Policy.'); return }
    if (role === 'designer' && !consentDesigner) { setError('Please agree to the Designer Agreement to continue.'); return }

    setLoading(true)
    setError('')
    try {
      const email = user.email || ''
      await upsertProfile(user.id, fullName, role, email)

      if (role === 'designer') {
        const { error: dErr } = await supabase
          .from('designers')
          .upsert(
            [{ id: user.id, badge: 'under_review', verified: false, public_visible: false }],
            { onConflict: 'id' }
          )
        if (dErr) console.warn('Designer row creation failed (non-fatal):', dErr.message)
      }

      try {
        await fetch('/api/send-welcome-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, name: fullName, role }),
        })
      } catch { /* non-fatal */ }

      try { localStorage.removeItem('ach_oauth_role_hint') } catch { /* ignore */ }

      onComplete(role)
    } catch (err: any) {
      setError(err?.message || 'Failed to save your profile. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 290, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)' }} />

      <div className="grm grm-sheet" style={{ zIndex: 300, background: '#111114', border: '1px solid rgba(201,168,76,0.14)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflowY: 'auto', padding: '32px 28px 40px' }}>

        {/* Google avatar row */}
        {user?.user_metadata?.avatar_url && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid rgba(201,168,76,0.3)` }}
            />
          </div>
        )}

        <div style={{ width: 28, height: 2, background: S.gold, marginBottom: 14 }} />
        <h2 style={{ margin: '0 0 6px', fontFamily: S.headline, fontWeight: 300, fontSize: 'clamp(20px,5vw,26px)', color: S.text, lineHeight: 1.15 }}>
          Welcome, <em style={{ color: S.gold, fontStyle: 'italic' }}>{fullName.split(' ')[0]}.</em>
        </h2>
        <p style={{ margin: '0 0 24px', fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.5 }}>
          One last step — tell us how you'll use the Hub.
        </p>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.textFaint }}>I am a</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              { k: 'client',   icon: '◉', label: 'Client',   sub: 'I need creative work'      },
              { k: 'designer', icon: '◈', label: 'Designer',  sub: 'I offer creative services' },
            ] as const).map(r => {
              const on = role === r.k
              return (
                <button key={r.k} onClick={() => setRole(r.k)} style={{
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

        {/* Consent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentTerms}
              onChange={e => setConsentTerms(e.target.checked)}
              style={{ marginTop: 3, accentColor: '#c9a84c', flexShrink: 0 }}
            />
            <span style={{ fontFamily: S.body, fontSize: 12, color: S.textMuted, lineHeight: 1.6 }}>
              I agree to the{' '}
              <a href="https://accracreativeshub.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Terms of Service</a>
              {' '}and acknowledge the{' '}
              <a href="https://accracreativeshub.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Privacy Policy</a>
              . <span style={{ color: '#f87171' }}>*</span>
            </span>
          </label>

          {role === 'designer' && (
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentDesigner}
                onChange={e => setConsentDesigner(e.target.checked)}
                style={{ marginTop: 3, accentColor: '#c9a84c', flexShrink: 0 }}
              />
              <span style={{ fontFamily: S.body, fontSize: 12, color: S.textMuted, lineHeight: 1.6 }}>
                I have read and agree to the{' '}
                <a href="https://accracreativeshub.com/designer-agreement" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Designer Agreement</a>
                , including commission terms and independent contractor status.{' '}
                <span style={{ color: '#f87171' }}>*</span>
              </span>
            </label>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 9, padding: '12px 15px', marginBottom: 14 }}>
            <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: '#f87171', lineHeight: 1.7 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', minHeight: 54,
            background: loading ? 'rgba(201,168,76,0.45)' : S.gold,
            border: 'none', borderRadius: 10,
            fontFamily: S.headline, fontSize: 11,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 700, color: '#131313',
            transition: 'all 0.18s ease',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Setting up your account…' : `Continue as ${role === 'client' ? 'Client' : 'Designer'} →`}
        </button>

      </div>
    </>
  )
}
