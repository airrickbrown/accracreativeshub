// ── src/components/Nav.tsx ──
// Fixes:
// - Logo now shows with transparent background via mix-blend-mode
// - Brand name text is larger and bolder
// - Logo sized correctly for mobile and desktop
// - Falls back gracefully if logo.png missing

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'

interface NavProps {
  scrolled:        boolean
  user:            any
  isAdmin?:        boolean
  isDesigner?:     boolean
  isClient?:       boolean
  onAdmin:         () => void
  onSignup:        () => void
  onMessages:      () => void
  onMarketplace:   () => void
  onHowItWorks:    () => void
  onForDesigners:  () => void
  onLogin:         () => void
  onSignOut:       () => void
}

export default function Nav({
  scrolled, user,
  isAdmin    = false,
  isDesigner = false,
  isClient   = false,
  onAdmin, onSignup, onMessages, onMarketplace,
  onHowItWorks, onForDesigners, onLogin, onSignOut,
}: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])
  const close = () => setMobileOpen(false)

  const showForDesigners = !user || isDesigner || isAdmin

  const navLinks = [
    { key: 'marketplace',  label: 'Marketplace',  fn: () => { onMarketplace(); close() } },
    { key: 'how-it-works', label: 'How It Works', fn: () => { onHowItWorks(); close()  } },
    ...(showForDesigners
      ? [{ key: 'for-designers', label: 'For Designers', fn: () => { onForDesigners(); close() } }]
      : []
    ),
  ]

  const btn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: S.headline, fontSize: 11,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    whiteSpace: 'nowrap', transition: 'all 0.2s',
  }

  const ghostBtn: React.CSSProperties = {
    ...btn, color: S.textMuted,
    border: `1px solid ${S.borderFaint}`,
    padding: '9px 16px', borderRadius: 8,
  }

  // ── Logo component — handles background removal ──
  const Logo = () => (
    <div
      onClick={() => { onMarketplace(); close() }}
      style={{
        display: 'flex', alignItems: 'center',
        gap: isMobile ? 8 : 12,
        cursor: 'pointer', flexShrink: 0,
        textDecoration: 'none',
      }}
    >
      {logoLoaded && (
        <div style={{
          // Container clips the logo to a clean shape
          width:    isMobile ? 36 : 48,
          height:   isMobile ? 36 : 48,
          flexShrink: 0,
          display:  'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // No background — fully transparent
          background: 'transparent',
        }}>
          <img
            src="/logo.svg"
            alt="Accra Creatives Hub"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoLoaded(false)}
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'contain',
              // ── Background removal trick ──
              // mix-blend-mode: screen makes dark/black backgrounds transparent
              // Works perfectly on dark navbars
              // If your logo has a WHITE background, use: mix-blend-mode: multiply
              // If your logo has a BLACK background, use: mix-blend-mode: screen
              mixBlendMode: 'screen' as any,
              // Boost logo visibility slightly
              filter: 'brightness(1.1) contrast(1.05)',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Brand name — larger and bolder */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontFamily:    S.headline,
          fontWeight:    700,
          color:         S.gold,
          // Bigger than before — readable on mobile
          fontSize:      isMobile ? 'clamp(13px, 3.5vw, 15px)' : 'clamp(15px, 2vw, 18px)',
          letterSpacing: '0.04em',
          whiteSpace:    'nowrap',
          lineHeight:    1,
        }}>
          ACCRA CREATIVES HUB
        </span>
        {/* Subtle tagline on desktop only */}
        {!isMobile && (
          <span style={{
            fontFamily:    S.body,
            fontSize:      9,
            color:         S.textFaint,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop:     3,
          }}>
            Ghana's Creative Marketplace
          </span>
        )}
      </div>
    </div>
  )

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background:   scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.99)',
      borderBottom: `1px solid ${scrolled ? 'rgba(201,168,76,0.12)' : 'rgba(77,70,55,0.1)'}`,
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease',
      // Taller nav for better logo breathing room
      minHeight: isMobile ? 64 : 72,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding:  isMobile ? '0 16px' : '0 40px',
        height:   isMobile ? 64 : 72,
        display:  'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        gap: 12,
      }}>

        <Logo />

        {/* ── Desktop nav ── */}
        {!isMobile && (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {navLinks.map(l => (
                <button key={l.key} onClick={l.fn}
                  style={{ ...btn, color: S.textMuted }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textMuted)}
                >{l.label}</button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user ? (
                <>
                  <button onClick={onMessages} style={ghostBtn}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = S.border }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                  >Messages</button>

                  {isDesigner && !isAdmin && (
                    <button onClick={onSignup} style={ghostBtn}
                      onMouseEnter={(e: any) => { e.currentTarget.style.color = S.gold; e.currentTarget.style.borderColor = S.gold }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                    >My Application</button>
                  )}

                  {isAdmin && (
                    <button onClick={onAdmin} style={{
                      ...btn, color: S.gold,
                      border: `1px solid rgba(201,168,76,0.35)`,
                      padding: '9px 16px', borderRadius: 8,
                      background: 'rgba(201,168,76,0.06)',
                    }}
                      onMouseEnter={(e: any) => (e.currentTarget.style.background = 'rgba(201,168,76,0.12)')}
                      onMouseLeave={(e: any) => (e.currentTarget.style.background = 'rgba(201,168,76,0.06)')}
                    >◈ Admin</button>
                  )}

                  <button onClick={onSignOut} style={{
                    ...btn, color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.28)',
                    padding: '9px 16px', borderRadius: 8,
                  }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = '#ef4444' }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.28)' }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={onLogin} style={ghostBtn}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = S.border }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                  >Login</button>

                  <button onClick={onSignup} style={{
                    ...btn, background: S.gold, color: '#131313',
                    padding: '10px 20px', borderRadius: 8, fontWeight: 700,
                  }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={(e: any) => (e.currentTarget.style.opacity = '1')}
                  >Designer Signup</button>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Mobile hamburger ── */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
            style={{
              background: 'none',
              border: `1px solid ${S.borderFaint}`,
              color: S.text,
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
            </div>
          </button>
        )}
      </div>

      {/* ── Mobile drawer ── */}
      {isMobile && mobileOpen && (
        <div style={{
          borderTop: `1px solid ${S.borderFaint}`,
          background: 'rgba(6,6,6,0.99)',
          padding: '12px 16px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navLinks.map(l => (
              <button key={l.key} onClick={l.fn}
                style={{ ...btn, color: S.text, textAlign: 'left', padding: '14px 4px', fontSize: 13, borderBottom: `1px solid ${S.borderFaint}`, width: '100%' }}
              >{l.label}</button>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {user ? (
                <>
                  <button onClick={() => { onMessages(); close() }}
                    style={{ ...btn, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}
                  >Messages</button>

                  {isDesigner && !isAdmin && (
                    <button onClick={() => { onSignup(); close() }}
                      style={{ ...btn, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}
                    >My Application</button>
                  )}

                  {isAdmin && (
                    <button onClick={() => { onAdmin(); close() }}
                      style={{ ...btn, color: S.gold, border: `1px solid rgba(201,168,76,0.35)`, background: 'rgba(201,168,76,0.06)', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}
                    >◈ Admin Panel</button>
                  )}

                  <button onClick={() => { onSignOut(); close() }}
                    style={{ ...btn, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onLogin(); close() }}
                    style={{ ...btn, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}
                  >Login</button>

                  <button onClick={() => { onSignup(); close() }}
                    style={{ ...btn, background: S.gold, color: '#131313', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontWeight: 700, fontSize: 13 }}
                  >Designer Signup</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}