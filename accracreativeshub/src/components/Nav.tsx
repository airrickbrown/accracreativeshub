// ── src/components/Nav.tsx ──

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { useTheme } from '../ThemeContext'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.5"/>
    <line x1="12" y1="2" x2="12" y2="4.5"/>
    <line x1="12" y1="19.5" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="6.69" y2="6.69"/>
    <line x1="17.31" y1="17.31" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="4.5" y2="12"/>
    <line x1="19.5" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="6.69" y2="17.31"/>
    <line x1="17.31" y1="6.69" x2="19.07" y2="4.93"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

interface NavProps {
  scrolled:          boolean
  user:              any
  isAdmin?:          boolean
  isDesigner?:       boolean
  isClient?:         boolean
  onAdmin:           () => void
  onSignup:          () => void
  onMessages:        () => void
  onMarketplace:     () => void
  onHowItWorks:      () => void
  onForDesigners:    () => void
  onLogin:           () => void
  onSignOut:         () => void
  onProfile?:        () => void
}

export default function Nav({
  scrolled, user,
  isAdmin    = false,
  isDesigner = false,
  isClient   = false,
  onAdmin, onSignup, onMessages, onMarketplace,
  onHowItWorks, onForDesigners, onLogin, onSignOut,
  onProfile = () => {},
}: NavProps) {
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

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

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: isDark
        ? (scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.99)')
        : (scrolled ? 'rgba(249,247,242,0.97)' : 'rgba(249,247,242,0.99)'),
      borderBottom: `1px solid ${scrolled ? 'rgba(201,168,76,0.15)' : S.borderFaint}`,
      backdropFilter: 'blur(20px)',
      transition: 'background 0s, border-color 0.3s ease',
      minHeight: isMobile ? 64 : 72,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding:  isMobile ? '0 16px' : '0 40px',
        height:   isMobile ? 64 : 72,
        display:  'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 12,
      }}>

        {/* ── Logo ── */}
        <div
          onClick={() => { onMarketplace(); close() }}
          style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, cursor: 'pointer', flexShrink: 0 }}
        >
          <img
            src="/logo.svg"
            alt=""
            style={{
              height:     isMobile ? 64 : 84,
              width:      'auto',
              objectFit:  'contain',
              display:    'block',
              flexShrink: 0,
            }}
            onError={(e: any) => { e.target.style.display = 'none' }}
          />

          {/* Brand text */}
          <div>
            <div style={{
              fontFamily:    S.headline,
              fontWeight:    700,
              color:         S.gold,
              fontSize:      isMobile ? 'clamp(14px,4vw,16px)' : 'clamp(16px,2vw,20px)',
              letterSpacing: '0.04em',
              lineHeight:    1,
              whiteSpace:    'nowrap',
            }}>
              ACCRA CREATIVES HUB
            </div>
            <div style={{
              fontFamily:    S.body,
              fontSize:      isMobile ? 8 : 9,
              color:         S.textFaint,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop:     3,
            }}>
              Ghana's Creative Marketplace
            </div>
          </div>
        </div>

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
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ ...btn, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '9px 12px', borderRadius: 8, lineHeight: 1, display: 'flex', alignItems: 'center', transition: 'none' }}
                onMouseEnter={(e: any) => { e.currentTarget.style.color = S.gold; e.currentTarget.style.borderColor = `${S.gold}60` }}
                onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

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
                    <button onClick={onAdmin} style={{ ...btn, color: S.gold, border: `1px solid rgba(201,168,76,0.35)`, padding: '9px 16px', borderRadius: 8, background: 'rgba(201,168,76,0.06)' }}
                      onMouseEnter={(e: any) => (e.currentTarget.style.background = 'rgba(201,168,76,0.12)')}
                      onMouseLeave={(e: any) => (e.currentTarget.style.background = 'rgba(201,168,76,0.06)')}
                    >◈ Admin</button>
                  )}

                  <button onClick={onProfile} style={ghostBtn}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = S.border }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.borderColor = S.borderFaint }}
                  >Profile</button>

                  <button onClick={onSignOut} style={{ ...btn, color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', padding: '9px 16px', borderRadius: 8 }}
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

                  <button onClick={onSignup} style={{ ...btn, background: S.gold, color: '#131313', padding: '10px 20px', borderRadius: 8, fontWeight: 700 }}
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
          <button onClick={() => setMobileOpen(v => !v)} aria-label="Menu"
            style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.text, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ width: 20, height: 1.5, background: S.text, display: 'block', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
            </div>
          </button>
        )}
      </div>

      {/* ── Mobile drawer ── */}
      {isMobile && mobileOpen && (
        <div style={{ borderTop: `1px solid ${S.borderFaint}`, background: isDark ? 'rgba(6,6,6,0.99)' : 'rgba(249,247,242,0.99)', padding: '12px 16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navLinks.map(l => (
              <button key={l.key} onClick={l.fn}
                style={{ ...btn, color: S.text, textAlign: 'left', padding: '14px 4px', fontSize: 13, borderBottom: `1px solid ${S.borderFaint}`, width: '100%' }}
              >{l.label}</button>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                onClick={toggleTheme}
                style={{ ...btn, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '12px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'none' }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  <button onClick={() => { onMessages(); close() }} style={{ ...btn, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>Messages</button>
                  {isDesigner && !isAdmin && <button onClick={() => { onSignup(); close() }} style={{ ...btn, color: S.textMuted, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>My Application</button>}
                  {isAdmin && <button onClick={() => { onAdmin(); close() }} style={{ ...btn, color: S.gold, border: `1px solid rgba(201,168,76,0.35)`, background: 'rgba(201,168,76,0.06)', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>◈ Admin Panel</button>}
                  <button onClick={() => { onProfile(); close() }} style={{ ...btn, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>Profile Settings</button>
                  <button onClick={() => { onSignOut(); close() }} style={{ ...btn, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onLogin(); close() }} style={{ ...btn, color: S.text, border: `1px solid ${S.borderFaint}`, padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontSize: 13 }}>Login</button>
                  <button onClick={() => { onSignup(); close() }} style={{ ...btn, background: S.gold, color: '#131313', padding: '14px 0', borderRadius: 8, textAlign: 'center', width: '100%', fontWeight: 700, fontSize: 13 }}>Designer Signup</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}