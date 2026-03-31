import React, { useEffect, useState } from 'react'
import { S } from '../styles/tokens'
import { Btn } from './UI'

interface NavProps {
  onAdmin:        () => void
  onSignup:       () => void
  onMessages:     () => void
  onMarketplace:  () => void
  onHowItWorks:   () => void
  onForDesigners: () => void
  onLogin:        () => void
  onSignOut:      () => void
  scrolled:       boolean
  user:           any
}

export default function Nav({
  onAdmin,
  onSignup,
  onMessages,
  onMarketplace,
  onHowItWorks,
  onForDesigners,
  onLogin,
  onSignOut,
  scrolled,
  user,
}: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false)
    }
  }, [isMobile])

  const closeMobileMenu = () => setMobileOpen(false)

  const navLinks = [
    { key: 'marketplace', label: 'Marketplace', fn: onMarketplace },
    { key: 'designers', label: 'Designers', fn: onMarketplace },
    { key: 'how', label: 'How It Works', fn: onHowItWorks },
    { key: 'for-designers', label: 'For Designers', fn: onForDesigners },
  ]

  const mobileMenuButton = (
    <button
      onClick={() => setMobileOpen((v) => !v)}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      style={{
        background: 'none',
        border: `1px solid ${S.borderFaint}`,
        color: S.text,
        width: 44,
        height: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 18,
            height: 1.5,
            background: S.text,
            transition: 'all 0.2s ease',
            transform: mobileOpen ? 'translateY(5.5px) rotate(45deg)' : 'none',
          }}
        />
        <span
          style={{
            width: 18,
            height: 1.5,
            background: S.text,
            opacity: mobileOpen ? 0 : 1,
            transition: 'all 0.2s ease',
          }}
        />
        <span
          style={{
            width: 18,
            height: 1.5,
            background: S.text,
            transition: 'all 0.2s ease',
            transform: mobileOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none',
          }}
        />
      </div>
    </button>
  )

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(19,19,19,0.95)' : 'rgba(19,19,19,0.98)',
        borderBottom: `1px solid ${scrolled ? S.borderFaint : 'rgba(77,70,55,0.14)'}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '0 14px' : '0 40px',
          minHeight: isMobile ? 74 : 68,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          onClick={() => {
            onMarketplace()
            closeMobileMenu()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 12,
            cursor: 'pointer',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="Accra Creatives Hub logo"
            style={{
              width: isMobile ? 28 : 38,
              height: isMobile ? 28 : 38,
              objectFit: 'contain',
              borderRadius: 6,
              flexShrink: 0,
              filter: 'drop-shadow(0 0 6px rgba(201,166,70,0.35))',
            }}
          />

          <div
            style={{
              fontFamily: S.headline,
              fontWeight: 700,
              color: S.gold,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              fontSize: isMobile ? 10 : 20,
              whiteSpace: 'nowrap',
            }}
          >
            ACCRA CREATIVES HUB
          </div>
        </div>

        {!isMobile && (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {navLinks.map((l) => (
                <button
                  key={l.key}
                  onClick={l.fn}
                  onMouseEnter={() => setHovered(l.key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: S.headline,
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: hovered === l.key ? S.text : S.textMuted,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user ? (
                <>
                  <button
                    onClick={onMessages}
                    style={{
                      background: 'none',
                      border: `1px solid ${S.borderFaint}`,
                      fontFamily: S.headline,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: S.textMuted,
                      cursor: 'pointer',
                      padding: '10px 16px',
                      transition: 'all 0.2s ease',
                      borderRadius: 10,
                    }}
                    onMouseEnter={(e: any) => {
                      e.target.style.color = S.text
                      e.target.style.borderColor = S.border
                    }}
                    onMouseLeave={(e: any) => {
                      e.target.style.color = S.textMuted
                      e.target.style.borderColor = S.borderFaint
                    }}
                  >
                    Messages
                  </button>

                  <button
                    onClick={onAdmin}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: S.headline,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: S.textMuted,
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                    onMouseLeave={(e: any) => (e.target.style.color = S.textMuted)}
                  >
                    Admin
                  </button>

                  <button
                    onClick={onSignOut}
                    style={{
                      background: 'none',
                      border: `1px solid ${S.borderFaint}`,
                      fontFamily: S.headline,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: S.textMuted,
                      cursor: 'pointer',
                      padding: '10px 16px',
                      transition: 'all 0.2s ease',
                      borderRadius: 10,
                    }}
                    onMouseEnter={(e: any) => {
                      e.target.style.color = S.danger
                      e.target.style.borderColor = S.danger
                    }}
                    onMouseLeave={(e: any) => {
                      e.target.style.color = S.textMuted
                      e.target.style.borderColor = S.borderFaint
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onLogin}
                    style={{
                      background: 'none',
                      border: `1px solid ${S.borderFaint}`,
                      fontFamily: S.headline,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: S.textMuted,
                      cursor: 'pointer',
                      padding: '10px 16px',
                      transition: 'all 0.2s ease',
                      borderRadius: 10,
                    }}
                    onMouseEnter={(e: any) => {
                      e.target.style.color = S.text
                      e.target.style.borderColor = S.border
                    }}
                    onMouseLeave={(e: any) => {
                      e.target.style.color = S.textMuted
                      e.target.style.borderColor = S.borderFaint
                    }}
                  >
                    Login
                  </button>

                  <Btn variant="gold" size="sm" onClick={onSignup}>
                    Designer Signup
                  </Btn>
                </>
              )}
            </div>
          </>
        )}

        {isMobile && mobileMenuButton}
      </div>

      {isMobile && mobileOpen && (
        <div
          style={{
            borderTop: `1px solid ${S.borderFaint}`,
            background: 'rgba(8,8,8,0.98)',
            padding: '14px 16px 18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: `1px solid ${S.borderFaint}`,
            }}
          >
            <img
              src="/logo.png"
              alt="Accra Creatives Hub logo"
              style={{
                width: 30,
                height: 30,
                objectFit: 'contain',
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontFamily: S.headline,
                fontWeight: 700,
                color: S.gold,
                letterSpacing: '-0.02em',
                fontSize: 11,
                lineHeight: 1.05,
                whiteSpace: 'nowrap',
              }}
            >
              ACCRA CREATIVES HUB
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {navLinks.map((l) => (
              <button
                key={l.key}
                onClick={() => {
                  l.fn()
                  closeMobileMenu()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: S.text,
                  textAlign: 'left',
                  padding: '12px 2px',
                  fontFamily: S.headline,
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}

            <div
              style={{
                height: 1,
                background: S.borderFaint,
                margin: '4px 0 8px',
              }}
            />

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn
                  variant="ghost"
                  full
                  onClick={() => {
                    onMessages()
                    closeMobileMenu()
                  }}
                >
                  Messages
                </Btn>

                <Btn
                  variant="outline"
                  full
                  onClick={() => {
                    onAdmin()
                    closeMobileMenu()
                  }}
                >
                  Admin
                </Btn>

                <Btn
                  variant="dark"
                  full
                  onClick={() => {
                    onSignOut()
                    closeMobileMenu()
                  }}
                >
                  Sign Out
                </Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn
                  variant="ghost"
                  full
                  onClick={() => {
                    onLogin()
                    closeMobileMenu()
                  }}
                >
                  Login
                </Btn>

                <Btn
                  variant="gold"
                  full
                  onClick={() => {
                    onSignup()
                    closeMobileMenu()
                  }}
                >
                  Designer Signup
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}