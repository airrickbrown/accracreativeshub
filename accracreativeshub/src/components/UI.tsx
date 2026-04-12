// ── src/components/UI.tsx ──
// All components use fluid clamp() sizing from tokens.
// Text, buttons, and spacing scale smoothly from mobile to desktop.

import React, { useState } from 'react'
import { S, BADGES } from '../styles/tokens'

// ── Typography ──────────────────────────────────────────────

export const Hl = ({ children, style = {} }: any) => (
  <div style={{
    fontFamily: S.headline,
    color: S.text,
    fontSize: S.text_xl,
    lineHeight: 1.2,
    ...style,
  }}>
    {children}
  </div>
)

export const Lbl = ({ children, style = {} }: any) => (
  <div style={{
    fontFamily: S.headline,
    color: S.textFaint,
    fontSize: S.text_xs,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
    ...style,
  }}>
    {children}
  </div>
)

export const Body = ({ children, style = {} }: any) => (
  <p style={{
    fontFamily: S.body,
    color: S.textMuted,
    fontSize: S.text_base,
    lineHeight: 1.75,
    margin: 0,
    ...style,
  }}>
    {children}
  </p>
)

// ── Gold accent line ─────────────────────────────────────────

export const GoldLine = ({ w = '48px' }: any) => (
  <div style={{
    width: w,
    height: 2,
    background: `linear-gradient(90deg, ${S.gold}, transparent)`,
    margin: `${S.space_sm} 0`,
  }} />
)

export const Divider = () => (
  <div style={{ height: 1, background: S.borderFaint, margin: `${S.space_sm} 0` }} />
)

// ── Badge pill ───────────────────────────────────────────────

export const Badge = ({ type, size = 10 }: any) => {
  const b = BADGES[type] || BADGES.new
  return (
    <span style={{
      background: b.bg,
      color: b.color,
      fontSize: `clamp(${size - 1}px, 2vw, ${size + 1}px)`,
      padding: '4px 10px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontFamily: S.body,
      fontWeight: 600,
      border: `1px solid ${b.color}20`,
      borderRadius: 999,
      whiteSpace: 'nowrap',
    }}>
      {b.label}
    </span>
  )
}

// ── Star rating ──────────────────────────────────────────────

export const Stars = ({ rating }: any) => (
  <span style={{ color: S.gold, fontSize: S.text_sm, letterSpacing: 2 }}>
    {'★'.repeat(Math.floor(rating))}
    <span style={{ color: S.textFaint }}>
      {'★'.repeat(5 - Math.floor(rating))}
    </span>
  </span>
)

// ── Button ───────────────────────────────────────────────────
// Size scale:
//   sm  → compact actions, table rows
//   md  → default
//   lg  → hero CTAs, prominent actions

export const Btn = ({
  children, onClick,
  variant  = 'outline',
  size     = 'md',
  full     = false,
  disabled = false,
  type     = 'button',
}: any) => {
  const [h, setH] = useState(false)

  const padMap: Record<string, string> = {
    sm: 'clamp(8px,2vw,10px) clamp(14px,3vw,18px)',
    md: 'clamp(11px,2.5vw,14px) clamp(20px,4vw,28px)',
    lg: 'clamp(14px,3vw,18px) clamp(28px,5vw,40px)',
  }

  const fontMap: Record<string, string> = {
    sm: 'clamp(9px, 2vw, 10px)',
    md: 'clamp(10px, 2vw, 11px)',
    lg: 'clamp(11px, 2.5vw, 13px)',
  }

  const minHMap: Record<string, number> = {
    sm: 36,
    md: 44,
    lg: 52,
  }

  const pad    = padMap[size]    ?? padMap.md
  const fSize  = fontMap[size]   ?? fontMap.md
  const minH   = minHMap[size]   ?? 44

  const variants: any = {
    gold: {
      background: h ? S.goldBright : S.gold,
      color: S.onPrimary,
      border: 'none',
      fontWeight: 700,
      boxShadow: h ? S.shadowSoft : 'none',
      transform: h ? 'translateY(-1px)' : 'none',
    },
    outline: {
      background: h ? 'rgba(201,168,76,0.08)' : 'none',
      color: h ? S.text : S.gold,
      border: `1px solid ${h ? S.gold : S.border}`,
      transform: h ? 'translateY(-1px)' : 'none',
    },
    ghost: {
      background: h ? S.surfaceHigh : 'none',
      color: h ? S.text : S.textMuted,
      border: `1px solid ${S.borderFaint}`,
      transform: h ? 'translateY(-1px)' : 'none',
    },
    danger: {
      background: h ? 'rgba(255,180,171,0.08)' : 'none',
      color: h ? '#ffd4d0' : S.danger,
      border: `1px solid ${h ? 'rgba(255,180,171,0.45)' : S.dangerDim}`,
    },
    success: {
      background: h ? '#5aaa5a' : S.success,
      color: '#fff',
      border: 'none',
      transform: h ? 'translateY(-1px)' : 'none',
    },
    dark: {
      background: h ? S.surfaceHighest : S.surfaceHigh,
      color: S.text,
      border: `1px solid ${S.border}`,
      transform: h ? 'translateY(-1px)' : 'none',
    },
  }

  return (
    <button
      type={type}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: pad,
        fontFamily: S.headline,
        fontSize: fSize,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: S.radiusMd,
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: minH,
        WebkitTapHighlightColor: 'transparent',
        // Prevent text from being too small on touch devices
        WebkitTextSizeAdjust: '100%',
      }}
    >
      {children}
    </button>
  )
}

// ── Text input ───────────────────────────────────────────────

export const Inp = ({ label, placeholder, value, onChange, type = 'text' }: any) => {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      {label && <Lbl style={{ marginBottom: S.space_xs }}>{label}</Lbl>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          background: S.bgLow,
          border: `1px solid ${focus ? S.gold : S.border}`,
          color: S.text,
          padding: 'clamp(11px,3vw,14px) clamp(12px,3vw,16px)',
          fontFamily: S.body,
          // 16px minimum prevents iOS auto-zoom on focus
          fontSize: 'clamp(16px, 3vw, 16px)',
          outline: 'none',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
          minHeight: 'clamp(44px, 8vw, 52px)',
        }}
      />
    </div>
  )
}

// ── Dropdown select ──────────────────────────────────────────

export const Sel = ({ label, options, value, onChange }: any) => {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      {label && <Lbl style={{ marginBottom: S.space_xs }}>{label}</Lbl>}
      <select
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          background: S.bgLow,
          border: `1px solid ${focus ? S.gold : S.border}`,
          color: value ? S.text : S.textFaint,
          padding: 'clamp(11px,3vw,14px) clamp(12px,3vw,16px)',
          fontFamily: S.body,
          fontSize: 'clamp(16px, 3vw, 16px)',
          outline: 'none',
          appearance: 'none',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
          minHeight: 'clamp(44px, 8vw, 52px)',
        }}
      >
        {options.map((o: any) => (
          <option
            key={o.value || o}
            value={o.value || o}
            style={{ background: S.bgLow, color: S.text }}
          >
            {o.label || o}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────────

export const Txt = ({ label, placeholder, value, onChange, rows = 4 }: any) => {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      {label && <Lbl style={{ marginBottom: S.space_xs }}>{label}</Lbl>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        rows={rows}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          background: S.bgLow,
          border: `1px solid ${focus ? S.gold : S.border}`,
          color: S.text,
          padding: 'clamp(11px,3vw,14px) clamp(12px,3vw,16px)',
          fontFamily: S.body,
          fontSize: 'clamp(16px, 3vw, 16px)',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
          lineHeight: 1.7,
          minHeight: 120,
        }}
      />
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────

export const StatCard = ({ label, value, color = S.text, sub = '' }: any) => (
  <div style={{
    background: S.surface,
    border: `1px solid ${S.borderFaint}`,
    padding: `${S.space_md} ${S.space_lg}`,
    flex: 1,
    minWidth: 0,
    borderRadius: S.radiusSm,
  }}>
    <Lbl style={{ marginBottom: S.space_xs }}>{label}</Lbl>
    <div style={{
      color,
      fontSize: S.text_2xl,
      fontFamily: S.headline,
      fontWeight: 300,
      lineHeight: 1,
    }}>
      {value}
    </div>
    {sub && (
      <Body style={{ fontSize: S.text_xs, marginTop: 6, color: S.textFaint }}>
        {sub}
      </Body>
    )}
  </div>
)