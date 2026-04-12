// ── src/components/PasswordStrength.tsx ──
// Reusable password strength indicator.
// Used in: AuthModal (signup) and PasswordResetPage.
// Drop it below any password input field.

import React from 'react'
import { S } from '../styles/tokens'

interface Props {
  password: string
  style?:   React.CSSProperties
}

export function getPasswordStrength(pw: string): {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  tip:   string
} {
  if (!pw) return { score: 0, label: '', color: 'transparent', tip: '' }

  let score = 0
  if (pw.length >= 8)                            score++
  if (pw.length >= 12)                           score++
  if (/[A-Z]/.test(pw))                          score++
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4

  const map = {
    0: { label: '',          color: 'transparent', tip: ''                          },
    1: { label: 'Too short', color: '#ef4444',     tip: 'Use at least 8 characters' },
    2: { label: 'Weak',      color: '#f97316',     tip: 'Add uppercase or a number' },
    3: { label: 'Good',      color: S.gold,        tip: 'Add a symbol to strengthen' },
    4: { label: 'Strong',    color: '#4ade80',     tip: ''                          },
  }

  return { score: capped, ...map[capped] }
}

export default function PasswordStrength({ password, style = {} }: Props) {
  const { score, label, color, tip } = getPasswordStrength(password)

  if (!password) return null

  return (
    <div style={{ marginTop: 8, ...style }}>

      {/* Four strength bars */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            style={{
              flex:         1,
              height:       3,
              borderRadius: 99,
              background:   score >= n ? color : 'rgba(255,255,255,0.08)',
              transition:   'background 0.25s ease',
            }}
          />
        ))}
      </div>

      {/* Label + tip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily:  S.body,
          fontSize:    11,
          fontWeight:  600,
          color,
          transition:  'color 0.25s ease',
          lineHeight:  1,
        }}>
          {label}
        </span>
        {tip && (
          <span style={{
            fontFamily: S.body,
            fontSize:   11,
            color:      S.textFaint,
            lineHeight: 1,
          }}>
            {tip}
          </span>
        )}
      </div>

    </div>
  )
}