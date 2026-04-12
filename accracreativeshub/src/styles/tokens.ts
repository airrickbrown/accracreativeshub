// ── src/styles/tokens.ts ──
// Single source of truth for all design values.
// Uses clamp() for fluid typography that scales between mobile and desktop
// without needing breakpoints for every single element.

export const S = {
  // ── Colours ──────────────────────────────────────────────
  bg:           '#080808',
  bgDeep:       '#050505',
  bgLow:        '#0d0d0d',
  surface:      '#131313',
  surfaceHigh:  '#1a1a1a',
  surfaceHighest:'#222',

  gold:         '#c9a84c',
  goldBright:   '#d4b45a',
  goldDim:      'rgba(201,168,76,0.15)',

  text:         '#f0ede8',
  textMuted:    '#999',
  textFaint:    '#555',

  border:       'rgba(255,255,255,0.1)',
  borderFaint:  'rgba(255,255,255,0.06)',

  success:      '#4a9a4a',
  danger:       '#e05555',
  dangerDim:    'rgba(220,85,85,0.3)',

  onPrimary:    '#131313',
  shadowSoft:   '0 4px 20px rgba(201,168,76,0.15)',

  // ── Typography ───────────────────────────────────────────
  headline: "'Newsreader', Georgia, serif",
  body:     "'Manrope', Arial, sans-serif",

  // ── Fluid type scale (clamp: mobile → desktop) ───────────
  // Usage: style={{ fontSize: S.text_sm }} etc.
  text_xs:   'clamp(10px, 2vw, 12px)',   // labels, badges, captions
  text_sm:   'clamp(12px, 2.5vw, 14px)', // body small, helper text
  text_base: 'clamp(14px, 3vw, 16px)',   // default body text
  text_md:   'clamp(15px, 3.5vw, 18px)', // slightly larger body
  text_lg:   'clamp(18px, 4vw, 22px)',   // section subtitles
  text_xl:   'clamp(22px, 5vw, 28px)',   // card titles, modal headers
  text_2xl:  'clamp(28px, 6vw, 40px)',   // section headings
  text_3xl:  'clamp(36px, 8vw, 56px)',   // hero headings
  text_4xl:  'clamp(44px, 10vw, 80px)',  // hero display

  // ── Spacing ──────────────────────────────────────────────
  // Fluid spacing: scales with viewport
  space_xs:  'clamp(8px,  2vw, 12px)',
  space_sm:  'clamp(12px, 3vw, 16px)',
  space_md:  'clamp(16px, 4vw, 24px)',
  space_lg:  'clamp(24px, 5vw, 40px)',
  space_xl:  'clamp(40px, 8vw, 80px)',
  space_2xl: 'clamp(60px, 10vw, 120px)',

  // ── Radius ───────────────────────────────────────────────
  radiusSm:  '6px',
  radiusMd:  '10px',
  radiusLg:  '16px',
  radiusXl:  '24px',
}

// ── Badge definitions ────────────────────────────────────────
export const BADGES: Record<string, { label: string; bg: string; color: string }> = {
  new:          { label: 'New',          bg: 'rgba(100,100,255,0.1)', color: '#8888ff' },
  under_review: { label: 'Under Review', bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  verified:     { label: 'Verified',     bg: 'rgba(74,154,74,0.1)',   color: '#4ade80' },
  elite:        { label: 'Elite',        bg: 'rgba(201,168,76,0.1)',  color: '#c9a84c' },
  rising:       { label: 'Rising',       bg: 'rgba(251,100,36,0.1)', color: '#fb6424' },
}

// ── Helpers ──────────────────────────────────────────────────
export const pct = (n: number) => `${n}%`
export const fmt = (n: number) =>
  `GH₵ ${(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Kente pattern watermark ──────────────────────────────────
export const kenteUrl = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='0.018'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`