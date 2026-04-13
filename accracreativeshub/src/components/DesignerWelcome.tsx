// ── src/components/DesignerWelcome.tsx ──
// Shown after a designer verifies their email and logs in for the first time.
// Confirms their application is in and explains what happens next.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'
import { useAuth } from '../AuthContext'

interface Props {
  onContinue: () => void  // opens DesignerSignup (application form)
  onBrowse:   () => void  // browse marketplace while waiting
}

export default function DesignerWelcome({ onContinue, onBrowse }: Props) {
  const { user } = useAuth()
  const [visible, setVisible]   = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', check)
    setTimeout(() => setVisible(true), 80)
    return () => window.removeEventListener('resize', check)
  }, [])

  const steps = [
    {
      icon:  '◈',
      title: 'Complete your application',
      body:  'Fill in your designer profile — portfolio samples, your category, rates, and a short bio. The more complete your profile, the faster you get approved.',
    },
    {
      icon:  '◐',
      title: 'Editorial review (3–5 days)',
      body:  'Our team reviews every designer before they go live. We check quality, consistency, and professionalism. You\'ll be notified by email with the outcome.',
    },
    {
      icon:  '◉',
      title: 'Go live and start earning',
      body:  'Once approved, your profile is visible to clients. Receive structured briefs, collaborate securely, and get paid through our platform — every time.',
    },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: S.bgDeep,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch' as any,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
    }}>
      <div style={{
        maxWidth: 540,
        margin:   '0 auto',
        padding:  isMobile
          ? 'clamp(48px,12vw,64px) clamp(20px,5vw,28px) 60px'
          : 'clamp(80px,10vw,100px) 40px 80px',
        textAlign: 'center',
        animation: visible ? 'fadeUp 0.5s ease forwards' : 'none',
      }}>

        {/* Symbol */}
        <div style={{ color: S.gold, fontSize: 'clamp(40px,8vw,56px)', marginBottom: 20, lineHeight: 1 }}>◈</div>

        {/* Label */}
        <Lbl style={{ marginBottom: 14, textAlign: 'center', fontSize: 9 }}>
          Designer Application
        </Lbl>

        {/* Heading */}
        <h1 style={{
          fontFamily: S.headline, fontWeight: 300,
          color:      S.text,
          fontSize:   'clamp(28px,7vw,48px)',
          lineHeight: 1.1,
          margin:     '0 0 clamp(12px,3vw,16px)',
        }}>
          Application received,{' '}
          <em style={{ color: S.gold, fontStyle: 'italic' }}>{firstName}.</em>
        </h1>

        <GoldLine w="48px" />

        {/* Subtext */}
        <p style={{
          fontFamily: S.body, color: S.textMuted,
          fontSize:   'clamp(14px,3.5vw,17px)',
          lineHeight: 1.8,
          margin:     '0 0 clamp(32px,7vw,48px)',
        }}>
          Your account is created. Now complete your application so our editorial board can review your work.
        </p>

        {/* Steps */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 1,
          background: S.borderFaint,
          borderRadius: S.radiusMd, overflow: 'hidden',
          marginBottom: 'clamp(28px,6vw,40px)',
          textAlign: 'left',
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: i === 0 ? 'rgba(201,168,76,0.05)' : S.surface,
              padding:    'clamp(18px,4vw,24px)',
              display:    'flex', gap: 16, alignItems: 'flex-start',
              borderLeft: i === 0 ? `3px solid ${S.gold}` : '3px solid transparent',
            }}>
              <span style={{ color: S.gold, fontSize: 'clamp(22px,5vw,28px)', flexShrink: 0, marginTop: 2, lineHeight: 1 }}>
                {s.icon}
              </span>
              <div>
                <div style={{
                  fontFamily: S.headline, color: i === 0 ? S.gold : S.text,
                  fontSize: 'clamp(13px,3vw,15px)', fontWeight: 600, marginBottom: 6,
                }}>
                  {i === 0 && <span style={{ marginRight: 8, fontSize: 10, background: S.gold, color: '#131313', padding: '2px 8px', borderRadius: 99, letterSpacing: '0.1em', verticalAlign: 'middle' }}>NEXT</span>}
                  {s.title}
                </div>
                <p style={{ fontFamily: S.body, color: S.textMuted, fontSize: 'clamp(12px,2.5vw,14px)', lineHeight: 1.75, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 12,
          justifyContent: 'center',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Btn variant="gold" size="lg" onClick={onContinue} full={isMobile}>
            Complete My Application →
          </Btn>
          <Btn variant="ghost" size="lg" onClick={onBrowse} full={isMobile}>
            Browse Platform
          </Btn>
        </div>

        {/* Support note */}
        <p style={{
          fontFamily: S.body, color: S.textFaint,
          fontSize: 11, marginTop: 24, lineHeight: 1.6,
        }}>
          Questions about your application?{' '}
          <a href="mailto:designers@accracreativeshub.com" style={{ color: S.gold }}>
            designers@accracreativeshub.com
          </a>
        </p>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}