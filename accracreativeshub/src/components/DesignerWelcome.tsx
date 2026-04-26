// ── src/components/DesignerWelcome.tsx ──

import React, { useState, useEffect } from 'react'
import { S, kenteUrl } from '../styles/tokens'
import { useAuth } from '../AuthContext'

interface Props {
  onContinue: () => void
  onBrowse:   () => void
}

const STYLES = `
  @keyframes ach-dw-fade  { from{opacity:0}            to{opacity:1} }
  @keyframes ach-dw-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .ach-dw-card:hover      { border-color:rgba(201,168,76,0.5)!important; background:rgba(201,168,76,0.04)!important; }
  .ach-dw-card:hover .ach-dw-arrow { color:${S.gold}!important; transform:translateX(5px)!important; }
  .ach-dw-skip:hover      { color:${S.textMuted}!important; }
`

export default function DesignerWelcome({ onContinue, onBrowse }: Props) {
  const { user } = useAuth()
  const [mounted, setMounted]   = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'there'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860)
    check()
    window.addEventListener('resize', check)
    const t = setTimeout(() => setMounted(true), 40)
    return () => { window.removeEventListener('resize', check); clearTimeout(t) }
  }, [])

  const actions = [
    {
      num:   '01',
      icon:  '◈',
      title: 'Complete Your Profile',
      body:  'Add your category, rates, bio, and links. A complete profile ships through our editorial review faster.',
      fn:    onContinue,
    },
    {
      num:   '02',
      icon:  '▣',
      title: 'Upload Your Portfolio',
      body:  'Showcase your best work — minimum 3 pieces. Our team evaluates quality, consistency, and professionalism.',
      fn:    onContinue,
    },
    {
      num:   '03',
      icon:  '◉',
      title: 'Go to Dashboard',
      body:  'Track your application status, see review feedback, and prepare for your first client brief once approved.',
      fn:    onContinue,
    },
  ]

  return (
    <>
      <style>{STYLES}</style>

      <div style={{
        position:        'fixed',
        inset:           0,
        zIndex:          200,
        background:      S.bgDeep,
        backgroundImage: kenteUrl,
        overflowY:       'auto',
        WebkitOverflowScrolling: 'touch' as any,
        animation:       'ach-dw-fade 0.3s ease forwards',
      }}>

        {/* Logo watermark */}
        {!isMobile && (
          <img
            src="/logo.svg"
            alt=""
            aria-hidden
            style={{
              position:      'fixed',
              right:         '-4%',
              top:           '50%',
              transform:     'translateY(-50%)',
              width:         440,
              opacity:       0.025,
              pointerEvents: 'none',
              mixBlendMode:  'screen' as any,
              userSelect:    'none',
            }}
          />
        )}

        {/* Layout */}
        <div style={{
          minHeight:      '100dvh',
          display:        'flex',
          alignItems:     isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding:        isMobile
            ? 'clamp(52px,12vw,72px) clamp(20px,5vw,28px) 64px'
            : 'clamp(60px,7vw,80px) clamp(48px,6vw,80px)',
        }}>
          <div style={{
            width:               '100%',
            maxWidth:            1100,
            display:             'grid',
            gridTemplateColumns: isMobile ? '1fr' : '42fr 58fr',
            gap:                 isMobile ? 44 : 80,
            alignItems:          'center',
          }}>

            {/* ── LEFT: Identity + Greeting ── */}
            <div style={{
              animation: mounted ? 'ach-dw-up 0.55s ease 0.1s both' : 'none',
            }}>

              {/* Brand mark */}
              <div style={{ marginBottom: 28 }}>
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

              {/* Status pill */}
              <div style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          7,
                background:   'rgba(201,168,76,0.08)',
                border:       `1px solid rgba(201,168,76,0.22)`,
                borderRadius: 99,
                padding:      '5px 14px',
                marginBottom: 28,
              }}>
                <span style={{ color: S.gold, fontSize: 10 }}>◈</span>
                <span style={{
                  fontFamily:    S.body,
                  fontSize:      11,
                  color:         S.gold,
                  letterSpacing: '0.06em',
                }}>Application received</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily:    S.headline,
                fontWeight:    300,
                fontSize:      'clamp(40px, 5vw, 68px)',
                color:         S.text,
                lineHeight:    1.05,
                letterSpacing: '-0.02em',
                margin:        '0 0 20px',
              }}>
                Application received,
                <br />
                <em style={{ color: S.gold, fontStyle: 'italic' }}>{firstName}.</em>
              </h1>

              {/* Gold accent line */}
              <div style={{
                width:        44,
                height:       2,
                background:   `linear-gradient(90deg, ${S.gold}, transparent)`,
                marginBottom: 22,
              }} />

              {/* Body copy */}
              <p style={{
                fontFamily: S.body,
                fontSize:   'clamp(13px, 1.5vw, 15px)',
                color:      S.textMuted,
                lineHeight: 1.9,
                margin:     '0 0 clamp(36px,5vw,52px)',
                maxWidth:   320,
              }}>
                Your account is live. Complete your profile so our editorial board can review your work — typically 3–5 business days.
              </p>

              {/* Support */}
              <p style={{
                fontFamily: S.body,
                fontSize:   11,
                color:      S.textFaint,
                lineHeight: 1.6,
                margin:     0,
              }}>
                Questions about your application?{' '}
                <a
                  href="mailto:designers@accracreativeshub.com"
                  style={{ color: S.gold, textDecoration: 'none' }}
                >
                  designers@accracreativeshub.com
                </a>
              </p>
            </div>

            {/* ── RIGHT: Action cards ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actions.map((action, i) => (
                <button
                  key={i}
                  className="ach-dw-card"
                  onClick={action.fn}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          20,
                    background:   S.surface,
                    border:       `1px solid ${S.borderFaint}`,
                    borderRadius: 14,
                    padding:      isMobile ? '18px 20px' : '22px 26px',
                    cursor:       'pointer',
                    textAlign:    'left',
                    transition:   'border-color 0.2s ease, background 0.2s ease',
                    animation:    mounted
                      ? `ach-dw-up 0.5s ease ${0.22 + i * 0.11}s both`
                      : 'none',
                    width:        '100%',
                  }}
                >
                  {/* Number + symbol */}
                  <div style={{ flexShrink: 0, width: 36, textAlign: 'center' }}>
                    <div style={{
                      fontFamily:    S.headline,
                      fontStyle:     'italic',
                      fontSize:      10,
                      letterSpacing: '0.18em',
                      color:         S.gold,
                      marginBottom:  6,
                    }}>{action.num}</div>
                    <div style={{
                      fontSize:   24,
                      color:      S.gold,
                      lineHeight: 1,
                      opacity:    0.65,
                    }}>{action.icon}</div>
                  </div>

                  {/* Divider */}
                  <div style={{
                    width:      1,
                    alignSelf:  'stretch',
                    background: S.borderFaint,
                    flexShrink: 0,
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily:   S.headline,
                      fontSize:     'clamp(14px, 1.6vw, 16px)',
                      fontWeight:   600,
                      color:        S.text,
                      lineHeight:   1.2,
                      marginBottom: 6,
                    }}>{action.title}</div>
                    <p style={{
                      fontFamily: S.body,
                      fontSize:   11,
                      color:      S.textMuted,
                      lineHeight: 1.75,
                      margin:     0,
                    }}>{action.body}</p>
                  </div>

                  {/* Arrow */}
                  <div
                    className="ach-dw-arrow"
                    style={{
                      color:      S.textFaint,
                      fontSize:   16,
                      flexShrink: 0,
                      transition: 'transform 0.2s ease, color 0.2s ease',
                    }}
                  >→</div>
                </button>
              ))}

              {/* Browse platform */}
              <button
                className="ach-dw-skip"
                onClick={onBrowse}
                style={{
                  background:    'none',
                  border:        'none',
                  color:         S.textFaint,
                  fontFamily:    S.body,
                  fontSize:      11,
                  letterSpacing: '0.06em',
                  cursor:        'pointer',
                  textAlign:     'center',
                  padding:       '10px 0 0',
                  transition:    'color 0.2s ease',
                  animation:     mounted
                    ? `ach-dw-up 0.5s ease ${0.22 + 3 * 0.11}s both`
                    : 'none',
                }}
              >
                Browse the platform first
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
