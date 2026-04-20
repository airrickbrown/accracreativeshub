// src/components/DeleteAccountModal.tsx

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl } from './UI'

interface Props {
  userName?: string
  onClose:   () => void
  onConfirm: (name?: string) => Promise<void>
}

const CONFIRM_PHRASE = 'DELETE'

export default function DeleteAccountModal({ userName, onClose, onConfirm }: Props) {
  const [phrase,  setPhrase]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const confirmed = phrase.trim() === CONFIRM_PHRASE

  const handleDelete = async () => {
    if (!confirmed || loading) return
    setLoading(true)
    setError('')
    try {
      await onConfirm(userName)
      // Parent clears auth state and closes — no further action needed here
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 450,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose() }}
    >
      <div style={{
        background: S.surface,
        border: '1px solid rgba(220,85,85,0.35)',
        borderRadius: 14,
        padding: '32px 28px',
        maxWidth: 440, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(220,85,85,0.1)',
            border: '1px solid rgba(220,85,85,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, fontSize: 18, color: S.danger,
          }}>⚠</div>
          <Hl style={{ fontSize: 22, marginBottom: 8 }}>Delete your account</Hl>
          <Body style={{ fontSize: 13, lineHeight: 1.7 }}>
            This action is <strong style={{ color: S.text }}>permanent and cannot be undone.</strong> Please read carefully before continuing.
          </Body>
        </div>

        {/* What gets deleted */}
        <div style={{
          background: 'rgba(220,85,85,0.05)',
          border: '1px solid rgba(220,85,85,0.18)',
          borderRadius: 10, padding: '16px 18px', marginBottom: 16,
        }}>
          <Lbl style={{ color: S.danger, marginBottom: 10, display: 'block' }}>
            What will be permanently deleted:
          </Lbl>
          {[
            'Your account credentials and login access',
            'Your profile and all personal information',
            'Your portfolio and designer data (if applicable)',
            'Your session — you will be signed out immediately',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 8 : 0, alignItems: 'flex-start' }}>
              <span style={{ color: S.danger, fontSize: 11, marginTop: 2, flexShrink: 0 }}>✕</span>
              <Body style={{ fontSize: 12, lineHeight: 1.6 }}>{item}</Body>
            </div>
          ))}
        </div>

        {/* Legal retention note */}
        <div style={{
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid rgba(201,168,76,0.14)',
          borderRadius: 8, padding: '11px 14px', marginBottom: 24,
        }}>
          <Body style={{ fontSize: 11, lineHeight: 1.7, color: S.textMuted }}>
            Active orders and transaction records may be retained for legal and business compliance purposes.
          </Body>
        </div>

        {/* Confirmation input */}
        <div style={{ marginBottom: error ? 12 : 24 }}>
          <Lbl style={{ display: 'block', marginBottom: 10 }}>
            Type{' '}
            <span style={{ color: S.danger, fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 700 }}>
              DELETE
            </span>
            {' '}to confirm
          </Lbl>
          <input
            value={phrase}
            onChange={e => { setPhrase(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleDelete() }}
            placeholder="DELETE"
            disabled={loading}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: S.bgLow,
              border: `1px solid ${confirmed ? 'rgba(220,85,85,0.55)' : S.borderFaint}`,
              borderRadius: 8,
              color: confirmed ? S.danger : S.text,
              fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.14em',
              padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s, color 0.2s',
            }}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.22)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            color: '#f87171', fontSize: 12, lineHeight: 1.6,
          }}>{error}</div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn variant="ghost" full onClick={onClose} disabled={loading}>
            Cancel
          </Btn>
          <button
            onClick={handleDelete}
            disabled={!confirmed || loading}
            style={{
              flex: 1, borderRadius: 8,
              cursor: confirmed && !loading ? 'pointer' : 'not-allowed',
              fontFamily: S.headline, fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
              padding: '12px 16px', transition: 'all 0.2s',
              background: confirmed && !loading ? 'rgba(220,85,85,0.14)' : 'rgba(220,85,85,0.04)',
              border: `1px solid ${confirmed && !loading ? 'rgba(220,85,85,0.5)' : 'rgba(220,85,85,0.14)'}`,
              color: confirmed && !loading ? S.danger : 'rgba(220,85,85,0.35)',
            }}
            onMouseEnter={(e: any) => {
              if (confirmed && !loading) e.currentTarget.style.background = 'rgba(220,85,85,0.22)'
            }}
            onMouseLeave={(e: any) => {
              if (confirmed && !loading) e.currentTarget.style.background = 'rgba(220,85,85,0.14)'
            }}
          >
            {loading ? 'Deleting…' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
