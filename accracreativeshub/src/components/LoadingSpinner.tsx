// ── src/components/LoadingSpinner.tsx ──

import React, { useEffect, useState } from 'react'
import { S } from '../styles/tokens'
import { useTheme } from '../ThemeContext'

// ── LoadingSpinner ──────────────────────────────────────────

interface SpinnerProps {
  message?:  string
  fullPage?: boolean
  size?:     'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ message, fullPage = false, size = 'md' }: SpinnerProps) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(t)
  }, [])

  const dim = { sm: 20, md: 32, lg: 48 }[size]

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: dim, height: dim,
        border: `${dim <= 20 ? 2 : 3}px solid rgba(201,168,76,0.15)`,
        borderTopColor: S.gold,
        borderRadius: '50%',
        animation: 'ach_spin 0.75s linear infinite',
        flexShrink: 0,
      }} />
      {message && (
        <p style={{ fontFamily: S.body, color: S.textMuted, fontSize: 'clamp(12px,3vw,14px)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          {message}
        </p>
      )}
      {slow && (
        <p style={{ fontFamily: S.body, color: S.textFaint, fontSize: 11, margin: 0, textAlign: 'center' }}>
          Slow connection detected — still trying…
        </p>
      )}
      <style>{`@keyframes ach_spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!fullPage) return inner

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {inner}
    </div>
  )
}

// ── NotFoundPage ────────────────────────────────────────────

export function NotFoundPage({ onHome }: { onHome?: () => void }) {
  useTheme() // subscribe to theme so S tokens update on toggle
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: S.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(24px,6vw,48px)', textAlign: 'center',
    }}>
      <div style={{ color: S.gold, fontSize: 'clamp(36px,8vw,52px)', marginBottom: 20 }}>
        {offline ? '◌' : '◈'}
      </div>
      <div style={{ fontFamily: S.headline, color: S.textFaint, fontSize: 'clamp(9px,2vw,11px)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}>
        {offline ? 'Connection Lost' : '404 — Not Found'}
      </div>
      <h1 style={{ fontFamily: S.headline, fontWeight: 300, color: S.text, fontSize: 'clamp(22px,5vw,36px)', margin: '0 0 14px', lineHeight: 1.2 }}>
        {offline ? "You're offline." : "This page doesn't exist."}
      </h1>
      <p style={{ fontFamily: S.body, color: S.textMuted, fontSize: 'clamp(13px,3vw,16px)', lineHeight: 1.75, margin: '0 0 clamp(24px,5vw,36px)', maxWidth: 380 }}>
        {offline
          ? 'Check your internet connection. Your session will resume automatically when you reconnect.'
          : "Head back to the platform."}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {offline && (
          <button onClick={() => window.location.reload()} style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.border}`,
            color: S.text, padding: 'clamp(11px,3vw,14px) clamp(20px,4vw,28px)',
            borderRadius: 8, fontFamily: S.headline, fontSize: 10,
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Try Again
          </button>
        )}
        <button
          onClick={onHome ?? (() => { window.history.replaceState({}, '', '/'); window.location.reload() })}
          style={{
            background: S.gold, border: 'none', color: '#131313',
            padding: 'clamp(11px,3vw,14px) clamp(20px,4vw,28px)',
            borderRadius: 8, fontFamily: S.headline, fontSize: 10,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          ← Back to Platform
        </button>
      </div>
      {offline && (
        <p style={{ fontFamily: S.body, color: S.textFaint, fontSize: 11, marginTop: 20, animation: 'ach_pulse 2s ease infinite' }}>
          Watching for connection…
        </p>
      )}
      <style>{`@keyframes ach_pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }`}</style>
    </div>
  )
}

// ── HelpButton ──────────────────────────────────────────────
// isHomePage = true  → hides "Back to Home" (you're already there)
// isHomePage = false → shows "Back to Home"

interface HelpProps {
  onHome?:     () => void
  isHomePage?: boolean
}

export function HelpButton({ onHome, isHomePage = false }: HelpProps) {
  const { isDark } = useTheme()
  const [show, setShow]         = useState(false)
  const [hover, setHover]       = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu items — remove "Back to Home" when already on homepage
  const menuItems = [
    ...(!isHomePage ? [{
      icon:  '⌂',
      label: 'Back to Home',
      fn:    () => {
        setExpanded(false)
        if (onHome) onHome()
        else { window.history.replaceState({}, '', '/'); window.location.reload() }
      },
    }] : []),
    {
      icon:  '↑',
      label: 'Scroll to Top',
      fn:    () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setExpanded(false) },
    },
    {
      icon:  '✉',
      label: 'Contact Support',
      fn:    () => { window.location.href = 'mailto:hello@accracreativeshub.com'; setExpanded(false) },
    },
  ]

  if (!show && !expanded) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 'clamp(20px,4vw,28px)',
      right:  'clamp(16px,4vw,24px)',
      zIndex: 180,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      gap: 8,
    }}>

      {/* Expanded menu */}
      {expanded && (
        <div style={{
          background: S.surface,
          border: `1px solid ${S.border}`,
          borderRadius: 12, padding: 6,
          display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          animation: 'help_in 0.2s ease',
          minWidth: 180,
        }}>
          {menuItems.map(item => (
            <button key={item.label} onClick={item.fn} style={{
              background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              cursor: 'pointer', fontFamily: S.body,
              fontSize: 'clamp(12px,3vw,13px)', color: S.text,
              transition: 'background 0.15s', textAlign: 'left', width: '100%',
            }}
              onMouseEnter={(e: any) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e: any) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ color: S.gold, fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 'clamp(44px,10vw,52px)', height: 'clamp(44px,10vw,52px)',
          borderRadius: '50%',
          background: expanded ? S.gold : hover ? S.gold : S.surface,
          border: `2px solid ${expanded ? 'transparent' : S.border}`,
          color: expanded || hover ? (isDark ? '#131313' : '#fff') : S.gold,
          fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: hover ? '0 6px 24px rgba(201,168,76,0.3)' : isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
        }}
        aria-label="Help"
      >
        {expanded ? '×' : '?'}
      </button>

      <style>{`
        @keyframes help_in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}