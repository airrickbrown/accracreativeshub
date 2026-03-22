// ── DESIGNER PROFILE COMPONENT ──
// Full page view when you click "View Profile" on a designer card.
// Shows large portrait, stats, portfolio grid, and hire button.

import React from 'react'
import { S } from '../styles/tokens'
import { Btn, Badge, Hl, Body, Lbl, Divider } from './UI'
import Nav from './Nav'

interface DesignerProfileProps {
  designer:    any
  onHire:      (d: any) => void
  onMessage:   () => void
  onAnalytics: () => void
  onClose:     () => void
}

export default function DesignerProfile({ designer, onHire, onMessage, onAnalytics, onClose }: DesignerProfileProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>

      <Nav onAdmin={() => {}} onSignup={() => {}} onMessages={onMessage} scrolled={true} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 40px 60px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>

        {/* ── Left sidebar ── */}
        <div>
          {/* Portrait */}
          <div style={{ position: 'relative', overflow: 'hidden', height: 320 }}>
            <img src={designer.portrait} alt={designer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(100%)', opacity: 0.8 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 50%,rgba(19,19,19,0.7))' }} />
            <div style={{ position: 'absolute', top: 12, left: 12 }}><Badge type={designer.badge} /></div>
          </div>

          {/* Info panel below portrait */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderTop: 'none', padding: '18px' }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
              {designer.tags.map((t: string) => (
                <span key={t} style={{ background: S.bgLow, border: `1px solid ${S.borderFaint}`, color: S.textMuted, fontSize: 8, padding: '3px 8px', fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t}</span>
              ))}
            </div>
            <Divider />
            <Lbl style={{ marginBottom: 4, fontSize: 8 }}>Project Investment</Lbl>
            <Hl style={{ color: S.gold, fontSize: 22, marginBottom: 2 }}>Starting at<br />GH₵{designer.price}</Hl>
            <Body style={{ fontSize: 10, marginBottom: 14 }}>{designer.responseTime} · {designer.reviews} clients</Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn variant="gold"    full onClick={() => onHire(designer)}>Hire Designer</Btn>
              <Btn variant="outline" full onClick={onMessage}>View Resume</Btn>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.2em', textTransform: 'uppercase' }}>● OPEN TO PROJECTS</span>
            </div>
            <Hl style={{ fontSize: 'clamp(36px,6vw,60px)', fontWeight: 300, marginBottom: 8 }}>{designer.name}</Hl>
            <Body style={{ fontSize: 14, marginBottom: 14 }}>{designer.tagline}</Body>
            <div style={{ display: 'flex', gap: 24 }}>
              {[{ l: 'Accolades', v: designer.reviews }, { l: 'Commissions', v: designer.orders }, { l: 'Est. Delivery', v: designer.responseTime }].map(s => (
                <div key={s.l}>
                  <Lbl style={{ marginBottom: 4, fontSize: 8 }}>{s.l}</Lbl>
                  <Hl style={{ fontSize: 18 }}>{s.v}</Hl>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <Hl style={{ fontSize: 20, marginBottom: 16 }}>Selected Works</Hl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {/* First item is a text card */}
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <div style={{ textAlign: 'center' }}>
                <Lbl style={{ marginBottom: 8, fontSize: 8, color: S.gold }}>MINIMAL BRANDING PROJECT</Lbl>
                <Body style={{ fontSize: 11 }}>Brand identity exploration using Ghanaian cultural motifs for contemporary luxury market.</Body>
              </div>
            </div>
            {/* Remaining portfolio images */}
            {designer.portfolio.slice(1).map((p: string, i: number) => (
              <div key={i} style={{ overflow: 'hidden', aspectRatio: '4/3', background: designer.color }}>
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(80%)', opacity: 0.75, transition: 'all 0.4s' }}
                  onMouseEnter={(e: any) => { e.target.style.opacity = '1'; e.target.style.transform = 'scale(1.04)' }}
                  onMouseLeave={(e: any) => { e.target.style.opacity = '0.75'; e.target.style.transform = 'scale(1)' }}
                />
              </div>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="gold"    size="lg" onClick={() => onHire(designer)}>Hire Designer</Btn>
            <Btn variant="outline" size="lg" onClick={onAnalytics}>View Analytics</Btn>
          </div>
        </div>

      </div>
    </div>
  )
}
