// ── src/components/Nav.tsx ──
// Changes:
// - "For Designers" hidden from logged-in clients
// - "Designers" removed (was non-functional)
// - Sign Out button is red
// - Logo uses transparent PNG/SVG, larger size
// - No state that could interfere with AuthContext

import React, { useState, useEffect, useCallback } from 'react'
import { S } from '../styles/tokens'

interface NavProps {
  scrolled:       boolean
  user:           any
  isAdmin:        boolean
  isDesigner:     boolean
  isClient:       boolean
  onAdmin:        () => void
  onSignup:       () => void   // designer signup
  onMessages:     () => void
  onMarketplace:  () => void
  onHowItWorks:   () => void
  onForDesigners: () => void
  onLogin:        () => void
  onSignOut:      () => void
}

export default function Nav({
  scrolled, user, isAdmin, isDesigner, isClient,
  onAdmin, onSignup, onMessages, onMarketplace,
  onHowItWorks, onForDesigners, onLogin, onSignOut,
}: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile menu when screen grows
  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  const close = () => setMobileOpen(false)

  // ── Role-based nav links ──
  // "For Designers" only visible to non-logged-in users and designers/admins
  // Clients should not see designer recruitment content
  const showForDesigners = !user || isDesigner || isAdmin

  const navLinks = [
    { key: 'marketplace', label: 'Marketplace', fn: () => { onMarketplace(); close() }, always: true },
    { key: 'how-it-works', label: 'How It Works', fn: () => { onHowItWorks(); close() }, always: true },
    // Only show for non-clients
    ...(showForDesigners ? [{ key: 'for-designers', label: 'For Designers', fn: () => { onForDesigners(); close() }, always: false }] : []),
  ]

  const btnBase: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: S.headline, fontSize: 11, letterSpacing: '0.15em',
    textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.2s',
  }

  return (
    <header style={{
      position:    'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background:  scrolled ? 'rgba(10,10,10,0.96)' : 'rgba(10,10,10,0.98)',
      borderBottom: `1px solid ${scrolled ? S.borderFaint : 'rgba(77,70,55,0.12)'}`,
      backdropFilter: 'blur(20px)',
      transition:  'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding:  isMobile ? '0 16px' : '0 40px',
        minHeight: isMobile ? 60 : 68,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>

        {/* ── Logo ── */}
        <div
          onClick={() => { onMarketplace(); close() }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
        >
          {/* Logo image — transparent PNG or SVG, no black bg box */}
          <img
            src="/logo.png"
            alt="Accra Creatives Hub"
            style={{
              height:     isMobile ? 36 : 48,
              width:      'auto',
              objectFit:  'contain',
              // If logo has white parts, use brightness filter on dark bg
              filter:     'brightness(1)',
              display:    'block',
              flexShrink: 0,
            }}
            onError={(e: any) => {
              // Fallback: hide broken image, show text logo
              e.target.style.display = 'none'
            }}
          />
          {/* Text fallback / supplement */}
          <span style={{
            fontFamily:    S.headline,
            fontWeight:    700,
            color:         S.gold,
            letterSpacing: '-0.02em',
            fontSize:      isMobile ? 11 : 16,
            whiteSpace:    'nowrap',
            lineHeight:    1,
          }}>
            ACCRA CREATIVES HUB
          </span>
        </div>

        {/* ── Desktop nav ── */}
        {!isMobile && (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {navLinks.map(l => (
                <button
                  key={l.key}
                  onClick={l.fn}
                  style={{ ...btnBase, color: S.textMuted }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textMuted)}
                >
                  {l.label}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user ? (
                <>
                  <button onClick={onMessages}
                    style={{ ...btnBase, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '9px 16px', borderRadius: 8 }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = S.border }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                  >Messages</button>

                  {isAdmin && (
                    <button onClick={onAdmin}
                      style={{ ...btnBase, color: S.gold }}
                      onMouseEnter={(e: any) => (e.target.style.opacity = '0.7')}
                      onMouseLeave={(e: any) => (e.target.style.opacity = '1')}
                    >Admin</button>
                  )}

                  {/* Designer signup — only show to non-clients (or not-logged-in) */}
                  {(isDesigner || isAdmin) && (
                    <button onClick={onSignup}
                      style={{ ...btnBase, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '9px 16px', borderRadius: 8 }}
                      onMouseEnter={(e: any) => { e.currentTarget.style.color = S.gold; e.currentTarget.style.borderColor = S.gold }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                    >My Application</button>
                  )}

                  {/* ── Sign Out — RED ── */}
                  <button onClick={onSignOut}
                    style={{ ...btnBase, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '9px 16px', borderRadius: 8, transition: 'all 0.2s' }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = '#ef4444' }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={onLogin}
                    style={{ ...btnBase, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '9px 16px', borderRadius: 8 }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = S.border }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                  >Login</button>

                  <button onClick={onSignup}
                    style={{ ...btnBase, background: S.gold, color: '#131313', padding: '10px 20px', borderRadius: 8, fontWeight: 700 }}
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
            style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.text, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <span style={{ width: 18, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(5.5px) rotate(45deg)' : 'none' }} />
              <span style={{ width: 18, height: 1.5, background: S.text, display: 'block', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
              <span style={{ width: 18, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }} />
            </div>
          </button>
        )}
      </div>

      {/* ── Mobile drawer ── */}
      {isMobile && mobileOpen && (
        <div style={{ borderTop: `1px solid ${S.borderFaint}`, background: 'rgba(8,8,8,0.99)', padding: '12px 16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navLinks.map(l => (
              <button key={l.key} onClick={l.fn}
                style={{ ...btnBase, color: S.text, textAlign: 'left', padding: '12px 4px', fontSize: 12, borderBottom: `1px solid ${S.borderFaint}` }}
              >{l.label}</button>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {user ? (
                <>
                  <button onClick={() => { onMessages(); close() }}
                    style={{ ...btnBase, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%' }}
                  >Messages</button>
                  {isAdmin && (
                    <button onClick={() => { onAdmin(); close() }}
                      style={{ ...btnBase, color: S.gold, border: `1px solid ${S.gold}40`, padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%' }}
                    >Admin Panel</button>
                  )}
                  {(isDesigner || isAdmin) && (
                    <button onClick={() => { onSignup(); close() }}
                      style={{ ...btnBase, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%' }}
                    >My Application</button>
                  )}
                  {/* Sign Out — RED on mobile too */}
                  <button onClick={() => { onSignOut(); close() }}
                    style={{ ...btnBase, color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)', padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%' }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onLogin(); close() }}
                    style={{ ...btnBase, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%' }}
                  >Login</button>
                  <button onClick={() => { onSignup(); close() }}
                    style={{ ...btnBase, background: S.gold, color: '#131313', padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontWeight: 700 }}
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