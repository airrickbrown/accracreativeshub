// ── ABOUT PAGE ──
// Opened when user clicks "About" in the footer.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine, Divider } from './UI'
import Nav from './Nav'

interface AboutPageProps {
  onClose:   () => void
  onSignup:  () => void
  onContact: () => void
}

export default function AboutPage({ onClose, onSignup, onContact }: AboutPageProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const values = [
    { icon: '◈', title: 'Curation Over Volume',    body: 'We review every designer. Quality is our non-negotiable.' },
    { icon: '◉', title: 'Built for Ghana',          body: 'Payment, pricing, and processes designed for the Ghanaian economy.' },
    { icon: '◐', title: 'Designers First',          body: 'Zero listing fees. 10% only when you earn. Fair for talent.' },
    { icon: '◑', title: 'Trust Through Escrow',     body: 'Clients pay securely. Designers get paid fairly. Always.' },
    { icon: '▣', title: 'Cultural Authenticity',    body: 'Celebrating African aesthetic intelligence on a global stage.' },
    { icon: '◆', title: 'Radical Transparency',     body: 'No hidden fees, no surprises. Just honest commerce.' },
  ]

  const team = [
    { initials: 'AB', name: 'Accra Creatives Hub', role: 'Platform Founder', note: 'Built with love for Ghana\'s creative community.' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav
        scrolled={true}
        user={null}
        onAdmin={() => {}}
        onSignup={onSignup}
        onMessages={() => {}}
        onMarketplace={onClose}
        onHowItWorks={onClose}
        onForDesigners={onClose}
        onLogin={() => {}}
        onSignOut={() => {}}
      />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '88px 20px 60px' : '100px 40px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 64, maxWidth: 680 }}>
          <Lbl style={{ marginBottom: 16, color: S.gold }}>Our Story</Lbl>
          <Hl style={{ fontSize: isMobile ? 36 : 60, fontWeight: 300, marginBottom: 16, lineHeight: 1.0 }}>
            We built the platform<br />
            <em style={{ fontStyle: 'italic', color: S.gold }}>Ghana's designers deserve.</em>
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 15, lineHeight: 1.9 }}>
            Accra Creatives Hub was born from a simple observation: Ghana's graphic design talent is
            world-class, but the infrastructure to connect that talent with paying clients was non-existent.
            Designers were chasing work through Instagram DMs, getting underpaid, and going without guarantees.
            Clients were hiring blind, with no vetting and no protection. We built the bridge.
          </Body>
        </div>

        <Divider />

        {/* Mission */}
        <div style={{ margin: '48px 0', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32 }}>
          <div>
            <Lbl style={{ marginBottom: 12, color: S.gold }}>Our Mission</Lbl>
            <Hl style={{ fontSize: 22, fontWeight: 300, marginBottom: 16, lineHeight: 1.3 }}>
              Elevating Ghanaian design to a global stage.
            </Hl>
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We curate, verify, and champion Ghana's most talented graphic designers — connecting
              them with clients who understand the value of real craft. Every designer on our platform
              has been reviewed by our editorial board. Every transaction is protected by escrow.
            </Body>
          </div>
          <div>
            <Lbl style={{ marginBottom: 12, color: S.gold }}>Our Vision</Lbl>
            <Hl style={{ fontSize: 22, fontWeight: 300, marginBottom: 16, lineHeight: 1.3 }}>
              The creative economy, built in Africa.
            </Hl>
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We envision a future where Ghanaian designers are the first choice for brands across
              Africa and beyond — not the affordable option, but the preferred one. A creative
              economy that generates real wealth for real talent.
            </Body>
          </div>
        </div>

        <Divider />

        {/* Values */}
        <div style={{ margin: '48px 0' }}>
          <Lbl style={{ marginBottom: 12 }}>What We Stand For</Lbl>
          <Hl style={{ fontSize: isMobile ? 26 : 36, fontWeight: 300, marginBottom: 32 }}>
            Our Values
          </Hl>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
              gap: 1,
              background: S.borderFaint,
            }}
          >
            {values.map((v) => (
              <div key={v.title} style={{ background: S.bgLow, padding: '28px 24px' }}>
                <div style={{ color: S.gold, fontSize: 24, marginBottom: 12 }}>{v.icon}</div>
                <Hl style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{v.title}</Hl>
                <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{v.body}</Body>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Stats */}
        <div style={{ margin: '48px 0' }}>
          <Lbl style={{ marginBottom: 24 }}>By the Numbers</Lbl>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              gap: 1,
              background: S.borderFaint,
            }}
          >
            {[
              { n: '10%',   l: 'Commission Only'      },
              { n: 'GH₵0',  l: 'Cost to List'         },
              { n: '100%',  l: 'Editorial Review'      },
              { n: '7 days', l: 'Auto Escrow Release'  },
            ].map((s) => (
              <div key={s.l} style={{ background: S.surface, padding: '28px 20px', textAlign: 'center' }}>
                <Hl style={{ color: S.gold, fontSize: 28, fontWeight: 300, lineHeight: 1 }}>{s.n}</Hl>
                <Lbl style={{ margin: 0, marginTop: 8, fontSize: 9 }}>{s.l}</Lbl>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            padding: isMobile ? '28px 20px' : '44px 48px',
            textAlign: 'center',
            marginTop: 48,
          }}
        >
          <GoldLine w="32px" />
          <Hl style={{ fontSize: isMobile ? 24 : 32, fontWeight: 300, marginBottom: 16, lineHeight: 1.2 }}>
            Join Ghana's most curated<br />
            <em style={{ fontStyle: 'italic', color: S.gold }}>design community.</em>
          </Hl>
          <Body style={{ fontSize: 14, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            Whether you're a designer ready to grow or a brand looking for elite craft — your place is here.
          </Body>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn variant="gold"    size="lg" onClick={onSignup}>Apply as Designer →</Btn>
            <Btn variant="outline" size="lg" onClick={onContact}>Get in Touch</Btn>
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted,
              fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em',
              textTransform: 'uppercase', padding: '10px 24px', cursor: 'pointer', borderRadius: 8,
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}