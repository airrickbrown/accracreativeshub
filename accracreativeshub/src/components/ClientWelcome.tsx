// ── src/components/ClientWelcome.tsx ──
// Shown at /welcome after a client logs in for the first time.

import React from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'
import { useAuth } from '../AuthContext'

interface ClientWelcomeProps {
  onBrowse:    () => void
  onMessages:  () => void
}

export default function ClientWelcome({ onBrowse, onMessages }: ClientWelcomeProps) {
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: S.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>

        <div style={{ color: S.gold, fontSize: 36, marginBottom: 24 }}>◉</div>

        <Lbl style={{ marginBottom: 14, color: S.gold }}>Welcome to the Hub</Lbl>

        <Hl style={{ fontSize: 'clamp(28px,6vw,44px)', fontWeight: 300, marginBottom: 16, lineHeight: 1.1 }}>
          Hi <em style={{ fontStyle: 'italic', color: S.gold }}>{name}</em>, you're in.
        </Hl>

        <GoldLine w="40px" />

        <Body style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
          You now have access to Ghana's most curated network of verified graphic designers. Browse, compare, and hire — all with secure escrow protection.
        </Body>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: S.borderFaint, marginBottom: 36 }}>
          {[
            { i: '▣', t: 'Browse Designers', d: 'Find the perfect creative for your project' },
            { i: '◈', t: 'Submit a Brief',   d: 'Tell designers exactly what you need'       },
            { i: '◉', t: 'Secure Escrow',    d: 'Pay only when you approve the final work'   },
          ].map(step => (
            <div key={step.t} style={{ background: S.bgLow, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ color: S.gold, fontSize: 20, marginBottom: 10 }}>{step.i}</div>
              <Hl style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{step.t}</Hl>
              <Body style={{ fontSize: 11, lineHeight: 1.6 }}>{step.d}</Body>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn variant="gold" size="lg" onClick={onBrowse}>Browse Designers →</Btn>
          <Btn variant="ghost" size="lg" onClick={onMessages}>My Messages</Btn>
        </div>

      </div>
    </div>
  )
}