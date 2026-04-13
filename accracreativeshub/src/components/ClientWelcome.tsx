// ── src/components/ClientWelcome.tsx ──
// Shown after a client verifies their email and logs in.
// Warm, premium welcome with clear next steps.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'
import { useAuth } from '../AuthContext'

interface Props {
  onBrowse:   () => void
  onMessages: () => void
}

export default function ClientWelcome({ onBrowse, onMessages }: Props) {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
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
      title: 'Browse verified designers',
      body:  'Every creative on our platform has passed our editorial review. Browse by category — graphic design, UI/UX, or motion graphics.',
    },
    {
      icon:  '▣',
      title: 'Build your brief',
      body:  'Click "Hire" on any designer. Fill in your project details, budget, and timeline. It takes about 3 minutes.',
    },
    {
      icon:  '◉',
      title: 'Pay securely — always protected',
      body:  'Your payment is processed by Paystack and held securely until you approve the final delivery. You are always protected.',
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
        margin: '0 auto',
        padding: isMobile
          ? 'clamp(48px,12vw,64px) clamp(20px,5vw,28px) 60px'
          : 'clamp(80px,10vw,100px) 40px 80px',
        textAlign: 'center',
        animation: visible ? 'fadeUp 0.5s ease forwards' : 'none',
      }}>

        {/* Symbol */}
        <div style={{ color: S.gold, fontSize: 'clamp(40px,8vw,56px)', marginBottom: 20, lineHeight: 1 }}>◈</div>

        {/* Label */}
        <Lbl style={{ marginBottom: 14, textAlign: 'center', fontSize: 9 }}>
          Welcome to Accra Creatives Hub
        </Lbl>

        {/* Heading */}
        <h1 style={{
          fontFamily:  S.headline,
          fontWeight:  300,
          color:       S.text,
          fontSize:    'clamp(28px,7vw,48px)',
          lineHeight:  1.1,
          margin:      '0 0 clamp(12px,3vw,16px)',
        }}>
          You&apos;re in,{' '}
          <em style={{ color: S.gold, fontStyle: 'italic' }}>{firstName}.</em>
        </h1>

        <GoldLine w="48px" />

        {/* Subtext */}
        <p style={{
          fontFamily: S.body,
          color:      S.textMuted,
          fontSize:   'clamp(14px,3.5vw,17px)',
          lineHeight: 1.8,
          margin:     '0 0 clamp(32px,7vw,48px)',
        }}>
          Ghana's most curated creative marketplace is yours to explore.
          Here's how it works.
        </p>

        {/* Steps */}
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          gap:            1,
          background:     S.borderFaint,
          borderRadius:   S.radiusMd,
          overflow:       'hidden',
          marginBottom:   'clamp(28px,6vw,40px)',
          textAlign:      'left',
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: S.surface,
              padding:    'clamp(18px,4vw,24px)',
              display:    'flex',
              gap:        16,
              alignItems: 'flex-start',
            }}>
              <span style={{
                color:      S.gold,
                fontSize:   'clamp(22px,5vw,28px)',
                flexShrink: 0,
                marginTop:  2,
                lineHeight: 1,
              }}>
                {s.icon}
              </span>
              <div>
                <div style={{
                  fontFamily:   S.headline,
                  color:        S.text,
                  fontSize:     'clamp(13px,3vw,15px)',
                  fontWeight:   600,
                  marginBottom: 6,
                }}>
                  {s.title}
                </div>
                <p style={{
                  fontFamily: S.body,
                  color:      S.textMuted,
                  fontSize:   'clamp(12px,2.5vw,14px)',
                  lineHeight: 1.75,
                  margin:     0,
                }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{
          display:        'flex',
          gap:            12,
          justifyContent: 'center',
          flexDirection:  isMobile ? 'column' : 'row',
        }}>
          <Btn variant="gold" size="lg" onClick={onBrowse} full={isMobile}>
            Explore Designers →
          </Btn>
          <Btn variant="ghost" size="lg" onClick={onMessages} full={isMobile}>
            My Messages
          </Btn>
        </div>

        {/* Support note */}
        <p style={{
          fontFamily: S.body,
          color:      S.textFaint,
          fontSize:   11,
          marginTop:  24,
          lineHeight: 1.6,
        }}>
          Need help? Email{' '}
          <a href="mailto:clients@accracreativeshub.com" style={{ color: S.gold }}>
            clients@accracreativeshub.com
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