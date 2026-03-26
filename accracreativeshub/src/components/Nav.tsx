// ── NAV COMPONENT ── All links wired and working

import React from 'react'
import { S } from '../styles/tokens'
import { Btn } from './UI'

interface NavProps {
  onAdmin:       () => void
  onSignup:      () => void
  onMessages:    () => void
  onMarketplace: () => void
  onHowItWorks:  () => void
  onForDesigners:() => void
  onAuth:        () => void
  scrolled:      boolean
}

export default function Nav({ onAdmin, onSignup, onMessages, onMarketplace, onHowItWorks, onForDesigners, onAuth, scrolled }: NavProps) {
  const links = [
    { label: 'Marketplace',  fn: onMarketplace   },
    { label: 'Designers',    fn: onMarketplace   },
    { label: 'How It Works', fn: onHowItWorks    },
    { label: 'For Designers',fn: onForDesigners  },
  ]

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, zIndex:50,
      background: scrolled ? 'rgba(19,19,19,0.95)' : S.bg,
      borderBottom:`1px solid ${scrolled ? S.borderFaint : 'transparent'}`,
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition:'all 0.4s',
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px', height:68, display:'flex', justifyContent:'space-between', alignItems:'center' }}>

        {/* Logo */}
        <div onClick={onMarketplace} style={{ fontFamily:S.headline, fontSize:20, fontWeight:700, color:S.gold, letterSpacing:'-0.02em', cursor:'pointer', userSelect:'none' }}>
          ACCRA CREATIVES HUB
        </div>

        {/* Nav links */}
        <nav style={{ display:'flex', alignItems:'center', gap:32 }}>
          {links.map(l => (
            <button key={l.label} onClick={l.fn}
              style={{ background:'none', border:'none', fontFamily:S.headline, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:S.textMuted, cursor:'pointer', padding:0, transition:'color 0.2s' }}
              onMouseEnter={(e:any) => e.target.style.color = S.text}
              onMouseLeave={(e:any) => e.target.style.color = S.textMuted}>
              {l.label}
            </button>
          ))}
        </nav>

        {/* Right buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={onAuth}
            style={{ background:'none', border:`1px solid ${S.borderFaint}`, fontFamily:S.headline, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:S.textMuted, cursor:'pointer', padding:'8px 16px', transition:'all 0.2s' }}
            onMouseEnter={(e:any) => { e.target.style.color=S.text; e.target.style.borderColor=S.border }}
            onMouseLeave={(e:any) => { e.target.style.color=S.textMuted; e.target.style.borderColor=S.borderFaint }}>
            Login
          </button>
          <button onClick={onMessages}
            style={{ background:'none', border:`1px solid ${S.borderFaint}`, fontFamily:S.headline, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:S.textMuted, cursor:'pointer', padding:'8px 16px', transition:'all 0.2s' }}
            onMouseEnter={(e:any) => { e.target.style.color=S.text; e.target.style.borderColor=S.border }}
            onMouseLeave={(e:any) => { e.target.style.color=S.textMuted; e.target.style.borderColor=S.borderFaint }}>
            Messages
          </button>
          <button onClick={onAdmin}
            style={{ background:'none', border:'none', fontFamily:S.headline, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:S.textMuted, cursor:'pointer', transition:'color 0.2s' }}
            onMouseEnter={(e:any) => e.target.style.color = S.text}
            onMouseLeave={(e:any) => e.target.style.color = S.textMuted}>
            Admin
          </button>
          <Btn variant="gold" size="sm" onClick={onSignup}>Designer Signup</Btn>
        </div>
      </div>
    </header>
  )
}
