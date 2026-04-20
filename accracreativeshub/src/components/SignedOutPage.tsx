// ── src/components/SignedOutPage.tsx ──

import React, { useState, useEffect } from 'react'
import { S, kenteUrl } from '../styles/tokens'

interface Props {
  onLogin:    () => void
  onHomepage: () => void
}

const STYLES = `
  @keyframes ach-so-fade { from{opacity:0} to{opacity:1} }
  @keyframes ach-so-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .ach-so-btn-gold { background:${S.gold}!important; }
  .ach-so-btn-gold:hover { opacity:0.88!important; }
  .ach-so-btn-ghost:hover { border-color:rgba(201,168,76,0.4)!important; color:${S.textMuted}!important; }
  .ach-so-login:hover { color:${S.textMuted}!important; }
`

export default function SignedOutPage({ onLogin, onHomepage }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{STYLES}</style>

      <div style={{
        position:        'fixed',
        inset:           0,
        zIndex:          300,
        background:      S.bgDeep,
        backgroundImage: kenteUrl,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         'clamp(40px,8vw,80px) clamp(20px,5vw,40px)',
        animation:       'ach-so-fade 0.25s ease forwards',
      }}>

        {/* Logo watermark */}
        <img
          src="/logo.svg"
          alt=""
          aria-hidden
          style={{
            position:      'fixed',
            left:          '50%',
            top:           '50%',
            transform:     'translate(-50%,-50%)',
            width:         480,
            opacity:       0.018,
            pointerEvents: 'none',
            mixBlendMode:  'screen' as any,
            userSelect:    'none',
          }}
        />

        <div style={{
          position:  'relative',
          width:     '100%',
          maxWidth:  480,
          textAlign: 'center',
          animation: mounted ? 'ach-so-up 0.5s ease 0.08s both' : 'none',
        }}>

          {/* Brand mark */}
          <div style={{ marginBottom: 40 }}>
            <p style={{
              margin:        '0 0 4px',
              fontFamily:    S.headline,
              fontSize:      9,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color:         S.gold,
            }}>The Sovereign Gallery</p>
            <p style={{
              margin:        0,
              fontFamily:    S.headline,
              fontSize:      10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         S.textFaint,
            }}>Accra Creatives Hub</p>
          </div>

          {/* Icon */}
          <div style={{
            width:        56,
            height:       56,
            borderRadius: '50%',
            border:       `1px solid ${S.borderFaint}`,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            margin:       '0 auto 32px',
            background:   S.surface,
          }}>
            <span style={{ fontSize: 22, color: S.textFaint }}>◷</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:    S.headline,
            fontWeight:    300,
            fontSize:      'clamp(32px, 5vw, 52px)',
            color:         S.text,
            lineHeight:    1.08,
            letterSpacing: '-0.02em',
            margin:        '0 0 18px',
          }}>
            You've been
            <br />
            <em style={{ color: S.gold, fontStyle: 'italic' }}>signed out.</em>
          </h1>

          {/* Gold line */}
          <div style={{
            width:        44,
            height:       2,
            background:   `linear-gradient(90deg, transparent, ${S.gold}, transparent)`,
            margin:       '0 auto 24px',
          }} />

          {/* Body */}
          <p style={{
            fontFamily: S.body,
            fontSize:   'clamp(13px, 1.5vw, 15px)',
            color:      S.textMuted,
            lineHeight: 1.85,
            margin:     '0 0 44px',
          }}>
            Your session has ended securely.
            <br />
            We'll be here when you're ready to return.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <button
              className="ach-so-btn-gold"
              onClick={onLogin}
              style={{
                width:         '100%',
                maxWidth:      320,
                background:    S.gold,
                border:        'none',
                borderRadius:  10,
                padding:       '15px 24px',
                fontFamily:    S.headline,
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         '#131313',
                cursor:        'pointer',
                transition:    'opacity 0.2s ease',
              }}
            >
              Log back in
            </button>

            <button
              className="ach-so-btn-ghost"
              onClick={onHomepage}
              style={{
                width:         '100%',
                maxWidth:      320,
                background:    'transparent',
                border:        `1px solid ${S.borderFaint}`,
                borderRadius:  10,
                padding:       '14px 24px',
                fontFamily:    S.headline,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         S.textFaint,
                cursor:        'pointer',
                transition:    'border-color 0.2s ease, color 0.2s ease',
              }}
            >
              Go to homepage
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            fontFamily: S.body,
            fontSize:   11,
            color:      S.textFaint,
            lineHeight: 1.6,
            marginTop:  40,
          }}>
            Need help?{' '}
            <a
              href="mailto:hello@accracreativeshub.com"
              style={{ color: S.gold, textDecoration: 'none' }}
            >
              hello@accracreativeshub.com
            </a>
          </p>

        </div>
      </div>
    </>
  )
}
