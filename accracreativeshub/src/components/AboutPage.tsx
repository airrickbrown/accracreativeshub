// ── src/components/AboutPage.tsx ──
// Full brand story using the upgraded positioning copy.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine, Divider } from './UI'

interface Props {
  onClose:   () => void
  onSignup:  () => void
  onContact: () => void
}

const PILLARS = [
  {
    icon:  '◈',
    title: 'Curated',
    body:  'Every creative on our platform is reviewed and approved by our editorial board before going live. We do not list everyone. We list the best.',
  },
  {
    icon:  '◉',
    title: 'Verified',
    body:  'Every designer carries a verified badge earned through our review process. Clients know exactly who they are hiring and what standard to expect.',
  },
  {
    icon:  '◐',
    title: 'Protected',
    body:  'Every transaction goes through our platform payment workflow. Funds are only released when the client approves the delivery. Both sides are protected, always.',
  },
  {
    icon:  '◑',
    title: 'Preferred',
    body:  'We are not building a cheap option. We are building the preferred one — the platform brands reach for when quality is non-negotiable.',
  },
]

const STATS = [
  { value: 'GH₵ 0',  label: 'Listing Fee',      sub: 'Free to join' },
  { value: '10%',     label: 'Commission Only',   sub: 'On completed orders' },
  { value: '100%',    label: 'Editorial Review',  sub: 'Every designer vetted' },
  { value: '100%',    label: 'Payment Protected',  sub: 'Every transaction' },
]

export default function AboutPage({ onClose, onSignup, onContact }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    setTimeout(() => setVisible(true), 60)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: S.bgDeep, overflowY: 'auto',
      WebkitOverflowScrolling: 'touch' as any,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>

      {/* Close */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(5,5,5,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${S.borderFaint}`,
        padding: '16px clamp(20px,5vw,48px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: S.headline, color: S.gold, fontSize: 'clamp(11px,2.5vw,13px)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          About Accra Creatives Hub
        </span>
        <Btn variant="ghost" size="sm" onClick={onClose}>← Back</Btn>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: `clamp(48px,8vw,96px) clamp(20px,5vw,48px) 80px` }}>

        {/* ── HERO STATEMENT ── */}
        <div style={{ marginBottom: 'clamp(48px,8vw,80px)' }}>
          <Lbl style={{ marginBottom: 'clamp(12px,3vw,20px)' }}>Our Story</Lbl>

          <h1 style={{
            fontFamily: S.headline,
            fontWeight: 300,
            color: S.text,
            fontSize: 'clamp(32px,8vw,64px)',
            lineHeight: 1.05,
            margin: '0 0 clamp(20px,4vw,32px)',
            letterSpacing: '-0.02em',
          }}>
            We built the platform<br />
            <em style={{ color: S.gold, fontStyle: 'italic' }}>
              Ghana&apos;s creative talent deserves.
            </em>
          </h1>

          <GoldLine w="60px" />
        </div>

        {/* ── THE STORY ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 'clamp(32px,6vw,64px)',
          marginBottom: 'clamp(48px,8vw,80px)',
          alignItems: 'start',
        }}>
          <div>
            <p style={{
              fontFamily: S.body,
              color: S.text,
              fontSize: 'clamp(16px,3.5vw,20px)',
              lineHeight: 1.75,
              margin: '0 0 clamp(16px,4vw,24px)',
              fontWeight: 400,
            }}>
              Accra Creatives Hub was born from a simple observation: Ghana&apos;s creative talent is world-class, but the infrastructure to connect that talent with serious, paying clients was missing.
            </p>
            <p style={{
              fontFamily: S.body,
              color: S.textMuted,
              fontSize: 'clamp(14px,3vw,16px)',
              lineHeight: 1.85,
              margin: 0,
            }}>
              Designers were chasing work through Instagram DMs — underpaid, undervalued, and without guarantees. Clients were hiring blindly, with no vetting and no protection.
            </p>
          </div>

          <div style={{
            background: S.surface,
            border: `1px solid ${S.borderFaint}`,
            borderLeft: `3px solid ${S.gold}`,
            padding: 'clamp(24px,5vw,36px)',
            borderRadius: S.radiusSm,
          }}>
            <Lbl style={{ marginBottom: 16, color: S.gold }}>We built the bridge.</Lbl>
            <p style={{
              fontFamily: S.body,
              color: S.textMuted,
              fontSize: 'clamp(13px,3vw,15px)',
              lineHeight: 1.85,
              margin: 0,
            }}>
              A curated, verified, and payment-protected marketplace where Ghana&apos;s best creative talent — graphic designers, UI/UX designers, and motion artists — meets clients who understand the value of real craft.
            </p>
          </div>
        </div>

        <Divider />

        {/* ── MISSION ── */}
        <div style={{ padding: 'clamp(40px,7vw,72px) 0' }}>
          <Lbl style={{ marginBottom: 16 }}>Our Mission</Lbl>
          <h2 style={{
            fontFamily: S.headline,
            fontWeight: 300,
            color: S.text,
            fontSize: 'clamp(24px,5vw,40px)',
            lineHeight: 1.2,
            margin: '0 0 clamp(16px,4vw,24px)',
          }}>
            Elevating Ghanaian talent<br />
            <em style={{ color: S.gold, fontStyle: 'italic' }}>to a global stage.</em>
          </h2>
          <GoldLine />
          <p style={{
            fontFamily: S.body,
            color: S.textMuted,
            fontSize: 'clamp(14px,3vw,17px)',
            lineHeight: 1.85,
            maxWidth: 600,
            margin: '0 0 clamp(24px,5vw,36px)',
          }}>
            We curate, verify, and champion Ghana&apos;s most talented creatives — connecting them with clients who understand the value of real craft.
          </p>

          {/* Two mission truths */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 1,
            background: S.borderFaint,
            borderRadius: S.radiusSm,
            overflow: 'hidden',
          }}>
            {[
              { icon: '◈', statement: 'Every creative on our platform is reviewed by our editorial board.' },
              { icon: '◉', statement: 'Every transaction is payment-protected through our platform workflow.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: S.bgLow,
                padding: 'clamp(24px,5vw,36px)',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <span style={{ color: S.gold, fontSize: 24, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <p style={{
                  fontFamily: S.body,
                  color: S.text,
                  fontSize: 'clamp(14px,3vw,17px)',
                  lineHeight: 1.65,
                  margin: 0,
                  fontWeight: 500,
                }}>
                  {item.statement}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── FOUR PILLARS ── */}
        <div style={{ padding: 'clamp(40px,7vw,72px) 0' }}>
          <Lbl style={{ marginBottom: 16 }}>How We Work</Lbl>
          <h2 style={{
            fontFamily: S.headline, fontWeight: 300, color: S.text,
            fontSize: 'clamp(22px,5vw,36px)',
            margin: '0 0 clamp(28px,5vw,48px)',
          }}>
            Built on four principles.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: 1,
            background: S.borderFaint,
            borderRadius: S.radiusSm,
            overflow: 'hidden',
          }}>
            {PILLARS.map((p, i) => (
              <div key={i} style={{
                background: S.bgLow,
                padding: 'clamp(20px,4vw,30px) clamp(16px,3vw,24px)',
              }}>
                <div style={{ color: S.gold, fontSize: 'clamp(22px,5vw,28px)', marginBottom: 12 }}>{p.icon}</div>
                <div style={{
                  fontFamily: S.headline, color: S.text,
                  fontSize: 'clamp(14px,3vw,16px)',
                  fontWeight: 600, marginBottom: 10,
                }}>
                  {p.title}
                </div>
                <p style={{
                  fontFamily: S.body, color: S.textMuted,
                  fontSize: 'clamp(11px,2.5vw,13px)',
                  lineHeight: 1.75, margin: 0,
                }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── VISION ── */}
        <div style={{
          padding: 'clamp(40px,7vw,72px) 0',
          textAlign: 'center',
        }}>
          <Lbl style={{ marginBottom: 16, textAlign: 'center' }}>Our Vision</Lbl>
          <h2 style={{
            fontFamily: S.headline, fontWeight: 300,
            color: S.text,
            fontSize: 'clamp(24px,6vw,48px)',
            lineHeight: 1.15,
            margin: '0 0 clamp(16px,4vw,24px)',
          }}>
            The creative economy,<br />
            <em style={{ color: S.gold, fontStyle: 'italic' }}>built in Africa.</em>
          </h2>
          <GoldLine w="60px" />

          <p style={{
            fontFamily: S.body, color: S.textMuted,
            fontSize: 'clamp(15px,3.5vw,18px)',
            lineHeight: 1.9,
            maxWidth: 580, margin: '0 auto clamp(16px,3vw,24px)',
          }}>
            We envision a future where Ghanaian creatives are the first choice for brands across Africa and beyond — not the affordable option, but the <strong style={{ color: S.text }}>preferred one</strong>.
          </p>

          <p style={{
            fontFamily: S.headline,
            color: S.gold,
            fontSize: 'clamp(14px,3.5vw,18px)',
            lineHeight: 1.6,
            maxWidth: 500,
            margin: '0 auto',
            fontStyle: 'italic',
            fontWeight: 300,
          }}>
            &ldquo;A creative economy that generates real wealth for real talent.&rdquo;
          </p>
        </div>

        <Divider />

        {/* ── STATS ── */}
        <div style={{ padding: 'clamp(40px,6vw,60px) 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
            gap: 1,
            background: S.borderFaint,
            borderRadius: S.radiusSm,
            overflow: 'hidden',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: S.surface,
                padding: 'clamp(20px,4vw,28px)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: S.headline, color: S.gold,
                  fontSize: 'clamp(22px,5vw,32px)',
                  fontWeight: 300, lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {s.value}
                </div>
                <Lbl style={{ marginBottom: 4, textAlign: 'center', fontSize: 9 }}>{s.label}</Lbl>
                <p style={{ fontFamily: S.body, color: S.textFaint, fontSize: 11, margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(32px,6vw,56px) clamp(20px,5vw,40px)',
          background: S.surface,
          border: `1px solid ${S.borderFaint}`,
          borderRadius: S.radiusLg,
        }}>
          <Lbl style={{ marginBottom: 16, textAlign: 'center' }}>Join the Movement</Lbl>
          <h2 style={{
            fontFamily: S.headline, fontWeight: 300, color: S.text,
            fontSize: 'clamp(20px,5vw,32px)',
            margin: '0 0 clamp(12px,3vw,16px)',
          }}>
            Ready to be part of this?
          </h2>
          <p style={{
            fontFamily: S.body, color: S.textMuted,
            fontSize: 'clamp(13px,3vw,15px)',
            lineHeight: 1.8, margin: '0 0 clamp(24px,5vw,32px)',
            maxWidth: 400, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Apply to join as a verified designer or hire from Ghana&apos;s most curated creative talent.
          </p>
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
          }}>
            <Btn variant="gold" size="lg" onClick={onSignup}>Apply as a Designer →</Btn>
            <Btn variant="ghost" size="lg" onClick={onContact}>Get in Touch</Btn>
          </div>
        </div>

      </div>
    </div>
  )
}