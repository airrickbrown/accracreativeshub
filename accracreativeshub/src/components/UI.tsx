// ── SHARED UI COMPONENTS ──
// These are small reusable pieces used across the whole app.
// Think of them like LEGO bricks — Nav, BriefBuilder, Chat etc
// are all built using these smaller pieces.

import React, { useState } from 'react'
import { S, BADGES } from '../styles/tokens'

// ── Typography helpers ──
export const Hl = ({ children, style = {} }: any) => (
  <div style={{ fontFamily: S.headline, color: S.text, ...style }}>{children}</div>
)

export const Lbl = ({ children, style = {} }: any) => (
  <div
    style={{
      fontFamily: S.headline,
      color: S.textFaint,
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
)

export const Body = ({ children, style = {} }: any) => (
  <p
    style={{
      fontFamily: S.body,
      color: S.textMuted,
      fontSize: 14,
      lineHeight: 1.7,
      margin: 0,
      ...style,
    }}
  >
    {children}
  </p>
)

// ── Gold horizontal rule ──
export const GoldLine = ({ w = '48px' }: any) => (
  <div
    style={{
      width: w,
      height: 1,
      background: `linear-gradient(90deg,${S.gold},transparent)`,
      margin: '16px 0',
    }}
  />
)

// ── Thin divider line ──
export const Divider = () => (
  <div style={{ height: 1, background: S.borderFaint, margin: '16px 0' }} />
)

// ── Designer badge pill (Under Review / Verified / Elite etc) ──
export const Badge = ({ type, size = 10 }: any) => {
  const b = BADGES[type] || BADGES.new
  return (
    <span
      style={{
        background: b.bg,
        color: b.color,
        fontSize: size,
        padding: '4px 10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: S.body,
        fontWeight: 600,
        border: `1px solid ${b.color}20`,
        borderRadius: 999,
      }}
    >
      {b.label}
    </span>
  )
}

// ── Star rating display ──
export const Stars = ({ rating }: any) => (
  <span style={{ color: S.gold, fontSize: 12, letterSpacing: 2 }}>
    {'★'.repeat(Math.floor(rating))}
    <span style={{ color: S.textFaint }}>{'★'.repeat(5 - Math.floor(rating))}</span>
  </span>
)

// ── Button component ──
// variant options: gold | outline | ghost | danger | success | dark
export const Btn = ({
  children,
  onClick,
  variant = 'outline',
  size = 'md',
  full = false,
  disabled = false,
  type = 'button',
}: any) => {
  const [h, setH] = useState(false)

  const pad: any = {
    sm: '9px 16px',
    md: '12px 24px',
    lg: '15px 34px',
  }[size]

  const fontSize: any = {
    sm: 10,
    md: 11,
    lg: 12,
  }[size]

  const variants: any = {
    gold: {
      background: h ? S.goldBright : S.gold,
      color: S.onPrimary,
      border: 'none',
      fontWeight: 700,
      boxShadow: h ? `0 0 0 1px rgba(0,0,0,0.04) inset, ${S.shadowSoft}` : 'none',
      transform: h ? 'translateY(-1px)' : 'translateY(0)',
    },
    outline: {
      background: h ? 'rgba(201,168,76,0.08)' : 'none',
      color: h ? S.text : S.gold,
      border: `1px solid ${h ? S.gold : S.border}`,
      transform: h ? 'translateY(-1px)' : 'translateY(0)',
    },
    ghost: {
      background: h ? S.surfaceHigh : 'none',
      color: h ? S.text : S.textMuted,
      border: `1px solid ${S.borderFaint}`,
      transform: h ? 'translateY(-1px)' : 'translateY(0)',
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
      transform: h ? 'translateY(-1px)' : 'translateY(0)',
    },
    dark: {
      background: h ? S.surfaceHighest : S.surfaceHigh,
      color: S.text,
      border: `1px solid ${S.border}`,
      transform: h ? 'translateY(-1px)' : 'translateY(0)',
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
        fontSize,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: S.radiusSm,
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 44,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

// ── Text input ──
export const Inp = ({ label, placeholder, value, onChange, type = 'text' }: any) => {
  const [focus, setFocus] = useState(false)

  return (
    <div>
      {label && <Lbl style={{ marginBottom: 8 }}>{label}</Lbl>}
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
          padding: '13px 16px',
          fontFamily: S.body,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
          minHeight: 46,
        }}
      />
    </div>
  )
}

// ── Dropdown select ──
export const Sel = ({ label, options, value, onChange }: any) => {
  const [focus, setFocus] = useState(false)

  return (
    <div>
      {label && <Lbl style={{ marginBottom: 8 }}>{label}</Lbl>}
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
          padding: '13px 16px',
          fontFamily: S.body,
          fontSize: 14,
          outline: 'none',
          appearance: 'none',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
          minHeight: 46,
        }}
      >
        {options.map((o: any) => (
          <option key={o.value || o} value={o.value || o} style={{ background: S.bgLow, color: S.text }}>
            {o.label || o}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Textarea ──
export const Txt = ({ label, placeholder, value, onChange, rows = 4 }: any) => {
  const [focus, setFocus] = useState(false)

  return (
    <div>
      {label && <Lbl style={{ marginBottom: 8 }}>{label}</Lbl>}
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
          padding: '13px 16px',
          fontFamily: S.body,
          fontSize: 14,
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          borderRadius: S.radiusSm,
          transition: 'all 0.2s ease',
          boxShadow: focus ? `0 0 0 3px rgba(201,168,76,0.08)` : 'none',
        }}
      />
    </div>
  )
}

// ── Stat card (used in dashboards) ──
export const StatCard = ({ label, value, color = S.text, sub = '' }: any) => (
  <div
    style={{
      background: S.surface,
      border: `1px solid ${S.borderFaint}`,
      padding: '20px 24px',
      flex: 1,
      minWidth: 0,
      borderRadius: S.radiusSm,
    }}
  >
    <Lbl style={{ marginBottom: 8 }}>{label}</Lbl>
    <div style={{ color, fontSize: 28, fontFamily: S.headline, fontWeight: 300, lineHeight: 1 }}>
      {value}
    </div>
    {sub && <Body style={{ fontSize: 10, marginTop: 6, color: S.textFaint }}>{sub}</Body>}
  </div>
)