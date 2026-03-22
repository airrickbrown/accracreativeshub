// ── DESIGN TOKENS ──
// All colors and fonts come from Stitch's code.html files.
// Change values here and the whole app updates automatically.

export const S = {
  bg:             "#131313",
  bgDeep:         "#080808",
  bgLow:          "#1c1b1b",
  surface:        "#201f1f",
  surfaceHigh:    "#2a2a2a",
  surfaceHighest: "#353534",
  gold:           "#c9a84c",
  goldBright:     "#e6c364",
  goldDim:        "rgba(201,168,76,0.12)",
  onPrimary:      "#3d2e00",
  text:           "#e5e2e1",
  textMuted:      "#d0c5b2",
  textFaint:      "#99907e",
  border:         "#4d4637",
  borderFaint:    "rgba(77,70,55,0.3)",
  success:        "#4a9a4a",
  danger:         "#ffb4ab",
  dangerDim:      "rgba(255,180,171,0.15)",
  info:           "#4a7acc",
  headline:       "'Newsreader', Georgia, serif",
  body:           "'Manrope', sans-serif",
}

export const kenteUrl = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`

export const BADGES: Record<string, { label: string; color: string; bg: string }> = {
  under_review: { label: "Under Review", color: S.textFaint, bg: "rgba(153,144,126,0.15)" },
  new:          { label: "New",          color: S.info,      bg: "rgba(147,197,253,0.12)" },
  verified:     { label: "Verified",     color: S.gold,      bg: S.goldDim               },
  top_rated:    { label: "Top Rated",    color: "#fcd34d",   bg: "rgba(252,211,77,0.12)" },
  elite:        { label: "Elite",        color: "#c4b5fd",   bg: "rgba(196,181,253,0.12)"},
}

export const fmt = (n: number) => `GH₵${Number(n).toLocaleString()}`
export const pct = (n: number, t: number) => t ? Math.round((n / t) * 100) : 0
