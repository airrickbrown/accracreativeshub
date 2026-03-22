// ── NAV COMPONENT ──
// The top navigation bar that appears on every page.
// It becomes transparent at the top and solid when you scroll.

import React from 'react'
import { S } from '../styles/tokens'
import { Btn } from './UI'

interface NavProps {
  onAdmin:    () => void
  onSignup:   () => void
  onMessages: () => void
  scrolled:   boolean
}

export default function Nav({ onAdmin, onSignup, onMessages, scrolled }: NavProps) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(19,19,19,0.95)' : S.bg,
      borderBottom: `1px solid ${scrolled ? S.borderFaint : 'transparent'}`,
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 40px', transition: 'all 0.4s',
    }}>

      {/* Logo */}
      <div style={{ fontFamily: S.headline, fontSize: 22, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em' }}>
        ACCRA CREATIVES HUB
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {['Marketplace', 'Designers', 'How It Works'].map(l => (
          <a key={l} href="#" style={{ fontFamily: S.headline, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textMuted, textDecoration: 'none', transition: 'color 0.3s' }}
            onMouseEnter={(e: any) => e.target.style.color = S.text}
            onMouseLeave={(e: any) => e.target.style.color = S.textMuted}>
            {l}
          </a>
        ))}
      </nav>

      {/* Right buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={onMessages} style={{ fontFamily: S.headline, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e: any) => e.target.style.color = S.text}
          onMouseLeave={(e: any) => e.target.style.color = S.textMuted}>
          Messages
        </button>
        <button onClick={onAdmin} style={{ fontFamily: S.headline, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e: any) => e.target.style.color = S.text}
          onMouseLeave={(e: any) => e.target.style.color = S.textMuted}>
          Admin
        </button>
        <Btn variant="gold" size="sm" onClick={onSignup}>Designer Signup</Btn>
      </div>

    </header>
  )
}
