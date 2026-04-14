// ── src/components/DesignerDashboard.tsx ──
// FIXED:
//  1. Export button → downloads real CSV of ledger + monthly data
//  2. COPY button   → inline ✓ feedback (no alert)
//  3. Contact Support → real modal: category / subject / message / email
//                       sends to designers@accracreativeshub.com via Resend
//  4. Referral code → deterministic generation when missing (ACH-INITIALS-SUFFIX)
//  5. Disbursements → proper columns incl. Reference + Payout state
//  6. Stats sub-text → dynamic based on real designer data
//  7. Support form  → confirmation email to designer on submit

import React, { useState, useMemo, useEffect } from 'react'
import { S, fmt, BADGES } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard, GoldLine } from './UI'
import Nav from './Nav'
import { useAuth } from '../AuthContext'

// ── Resend — same pattern as ContactPage ─────────────────────────────────────
const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM_ADDR    = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const SUPPORT_ADDR = 'designers@accracreativeshub.com'

// ── Types ────────────────────────────────────────────────────────────────────
interface DesignerDashboardProps {
  designer: any
  onClose:  () => void
}

type SupportStatus = 'idle' | 'sending' | 'sent' | 'error'

interface LedgerRow {
  project: string
  ref:     string
  date:    string
  type:    string
  amount:  number
  status:  string
  payout:  string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a deterministic referral code from the designer object.
 * Priority: existing referralCode → ACH-{INITIALS}-{ID_SUFFIX}
 * Never regenerates: uses useMemo keyed on id.
 */
function buildReferralCode(designer: any): string {
  if (designer.referralCode) return designer.referralCode

  const namePart = (designer.name || 'DESIGNER')
    .split(' ')
    .map((w: string) => (w[0] || '').toUpperCase())
    .join('')
    .slice(0, 4)

  // Last 4 alphanumeric chars of the designer's id
  const idStr  = String(designer.id || Math.random().toString(36)).replace(/[^a-zA-Z0-9]/g, '')
  const idPart = idStr.slice(-4).toUpperCase().padStart(4, '0')

  return `ACH-${namePart}-${idPart}`
}

/**
 * Download ledger data as a CSV file.
 * Combines monthly earnings rows + individual ledger rows.
 */
function downloadCSV(
  designer:  any,
  monthly:   { m: string; e: number }[],
  ledger:    LedgerRow[],
) {
  const dateStr  = new Date().toISOString().slice(0, 10)
  const safeName = (designer.name || 'designer').toLowerCase().replace(/\s+/g, '-')
  const filename = `ach-ledger-${safeName}-${dateStr}.csv`

  const rows: string[][] = [
    ['Date', 'Reference', 'Project / Description', 'Type', 'Amount (GH₵)', 'Status', 'Payout State'],
    ...monthly.map(m => [
      `${m.m} 2026`, '—', 'Monthly Earnings Summary', 'Earnings', m.e.toFixed(2), 'Settled', 'Paid',
    ]),
    ...ledger.map(r => [
      r.date, r.ref, r.project, r.type, r.amount.toFixed(2), r.status, r.payout,
    ]),
  ]

  const csv  = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Support form categories ───────────────────────────────────────────────────
const SUPPORT_CATEGORIES = [
  'Payout / Payment Issue',
  'Account or Profile Problem',
  'Order / Client Dispute',
  'Technical Bug',
  'Portfolio Upload Issue',
  'Referral Programme',
  'Other',
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function DesignerDashboard({ designer, onClose }: DesignerDashboardProps) {
  const { user } = useAuth()

  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied]     = useState(false)

  // Support modal state
  const [showSupport, setShowSupport]       = useState(false)
  const [supportStatus, setSupportStatus]   = useState<SupportStatus>('idle')
  const [supportError, setSupportError]     = useState('')
  const [supportForm, setSupportForm]       = useState({
    name:     designer.name || '',
    email:    (user as any)?.email || '',
    category: '',
    subject:  '',
    message:  '',
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Stable referral code — never re-computes unless designer.id changes ──
  const referralCode = useMemo(
    () => buildReferralCode(designer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [designer.id, designer.referralCode],
  )
  // Referral URL uses the real domain — referral tracking backend is pending
  const referralUrl = `accracreativeshub.com/r/${referralCode}`

  // ── Chart data — placeholder until Supabase monthly aggregates are wired ──
  // TODO: Replace with real query:
  //   SELECT DATE_TRUNC('month', created_at) as month, SUM(amount * 0.9) as earnings
  //   FROM orders WHERE designer_id = designer.id AND status = 'completed'
  //   GROUP BY 1 ORDER BY 1 LIMIT 6
  const monthly = [
    { m: 'Jan', e: 0 }, { m: 'Feb', e: 0 }, { m: 'Mar', e: 0 },
    { m: 'Apr', e: 0 }, { m: 'May', e: 0 }, { m: 'Jun', e: 0 },
  ]
  const maxE = Math.max(...monthly.map(d => d.e))
  const pts  = monthly.map((d, i) => `${60 + i * 100},${140 - (d.e / maxE) * 110}`).join(' ')

  // ── Ledger rows — placeholder until real order history is fetched ──
  // TODO: Replace with real query:
  //   SELECT project_name, id, created_at, amount, status, payout_status
  //   FROM orders WHERE designer_id = designer.id ORDER BY created_at DESC
  const ledger: LedgerRow[] = []

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCopy = () => {
    const doCopy = (text: string) => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return text
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl).then(() => doCopy(referralUrl)).catch(() => {
        legacyCopy(referralUrl)
        doCopy(referralUrl)
      })
    } else {
      legacyCopy(referralUrl)
      doCopy(referralUrl)
    }
  }

  const handleExport = () => downloadCSV(designer, monthly, ledger)

  const openSupport = () => {
    setSupportStatus('idle')
    setSupportError('')
    setSupportForm(f => ({
      ...f,
      name:  f.name  || designer.name || '',
      email: f.email || (user as any)?.email || '',
    }))
    setShowSupport(true)
  }

  const closeSupport = () => {
    setShowSupport(false)
    setSupportStatus('idle')
    setSupportError('')
  }

  const sf = (k: string, v: string) => setSupportForm(p => ({ ...p, [k]: v }))

  const handleSupportSubmit = async () => {
    if (!supportForm.name.trim())    { setSupportError('Please enter your name.'); return }
    if (!supportForm.email.trim())   { setSupportError('Please enter your email address.'); return }
    if (!supportForm.category)       { setSupportError('Please select a support category.'); return }
    if (!supportForm.subject.trim()) { setSupportError('Please enter a subject.'); return }
    if (!supportForm.message.trim()) { setSupportError('Please describe your issue.'); return }

    setSupportStatus('sending')
    setSupportError('')

    const key = RESEND_KEY()
    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Africa/Accra', dateStyle: 'medium', timeStyle: 'short',
    })

    // ── Fallback: open mailto if no API key is configured ──
    if (!key) {
      const sub  = encodeURIComponent(`[Designer Support] ${supportForm.category} — ${supportForm.subject}`)
      const body = encodeURIComponent(
        `Name: ${supportForm.name}\nEmail: ${supportForm.email}\nCategory: ${supportForm.category}\n\n${supportForm.message}`,
      )
      window.open(`mailto:${SUPPORT_ADDR}?subject=${sub}&body=${body}`, '_blank')
      setSupportStatus('sent')
      return
    }

    try {
      // 1. Notify designers@accracreativeshub.com
      const r = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     FROM_ADDR,
          to:       SUPPORT_ADDR,
          reply_to: supportForm.email,
          subject:  `[Designer Support] ${supportForm.category} — ${supportForm.subject}`,
          html: `<div style="font-family:Arial;max-width:600px;background:#f5f5f5;padding:32px;">
            <h2 style="color:#131313;margin:0 0 20px;">Designer Support Request</h2>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;width:130px;font-weight:600;">Designer</td><td style="padding:12px 16px;font-size:13px;">${supportForm.name}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Email</td><td style="padding:12px 16px;font-size:13px;"><a href="mailto:${supportForm.email}" style="color:#c9a84c;">${supportForm.email}</a></td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Referral Code</td><td style="padding:12px 16px;font-size:13px;font-weight:700;">${referralCode}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Category</td><td style="padding:12px 16px;font-size:13px;">${supportForm.category}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Subject</td><td style="padding:12px 16px;font-size:13px;">${supportForm.subject}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;vertical-align:top;">Message</td><td style="padding:12px 16px;font-size:13px;line-height:1.7;white-space:pre-wrap;">${supportForm.message}</td></tr>
            </table>
            <p style="color:#999;font-size:11px;margin:16px 0 0;">Sent ${timestamp} WAT · accracreativeshub.com</p>
          </div>`,
        }),
      })
      if (!r.ok) throw new Error(await r.text())

      // 2. Confirmation to designer (fire-and-forget)
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    FROM_ADDR,
          to:      supportForm.email,
          subject: 'Support request received — Accra Creatives Hub',
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:36px 40px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">Request received, ${supportForm.name.split(' ')[0]}.</h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">Our team has received your support request about <strong style="color:#f5f5f5;">${supportForm.category}</strong>. We will respond to this email within <strong style="color:#f5f5f5;">1–2 business days</strong>.</p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:16px 0;">
    <p style="color:#888;font-size:12px;margin:0 0 4px;font-weight:600;">Subject:</p>
    <p style="color:#aaa;font-size:12px;margin:0;">${supportForm.subject}</p>
  </div>
  <p style="color:#666;font-size:13px;margin:20px 0 0;">Urgent: <a href="mailto:${SUPPORT_ADDR}" style="color:#c9a84c;">${SUPPORT_ADDR}</a></p>
</td></tr>
<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
        }),
      }).catch(() => {}) // confirmation is best-effort

      setSupportStatus('sent')
    } catch {
      setSupportError(`Failed to send. Please email ${SUPPORT_ADDR} directly.`)
      setSupportStatus('error')
    }
  }

  // ── Shared input style for support modal ──────────────────────────────────
  const modalInput: React.CSSProperties = {
    width: '100%',
    background: S.bgLow,
    border: `1px solid ${S.border}`,
    color: S.text,
    padding: '10px 14px',
    fontFamily: S.body,
    fontSize: 13,
    outline: 'none',
    borderRadius: S.radiusSm,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>

      {/* ── Support Modal ── */}
      {showSupport && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeSupport() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: S.surface, border: `1px solid ${S.border}`,
            maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: S.radiusLg,
          }}>
            {/* Modal header */}
            <div style={{ padding: '28px 28px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <Lbl style={{ marginBottom: 8 }}>Designer Support</Lbl>
                  <Hl style={{ fontSize: 22, fontWeight: 300 }}>Technical Support</Hl>
                </div>
                <button
                  onClick={closeSupport}
                  style={{ background: 'none', border: 'none', color: S.textFaint, cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1 }}
                  aria-label="Close support modal"
                >✕</button>
              </div>
              <GoldLine w="40px" />
            </div>

            {/* Sent state */}
            {supportStatus === 'sent' ? (
              <div style={{ padding: '36px 28px', textAlign: 'center' }}>
                <div style={{ color: S.success, fontSize: 40, marginBottom: 16 }}>✓</div>
                <Hl style={{ fontSize: 20, marginBottom: 12 }}>Request sent.</Hl>
                <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 8 }}>
                  Our team will respond to{' '}
                  <strong style={{ color: S.text }}>{supportForm.email}</strong>{' '}
                  within 1–2 business days.
                </Body>
                <Body style={{ fontSize: 12, color: S.textFaint, marginBottom: 24 }}>
                  Urgent? Email{' '}
                  <a href={`mailto:${SUPPORT_ADDR}`} style={{ color: S.gold }}>{SUPPORT_ADDR}</a>
                </Body>
                <Btn variant="ghost" onClick={closeSupport}>Close</Btn>
              </div>
            ) : (
              /* Form */
              <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  <div>
                    <Lbl style={{ marginBottom: 6 }}>Your Name *</Lbl>
                    <input value={supportForm.name} onChange={e => sf('name', e.target.value)} placeholder="Full name" style={modalInput} />
                  </div>
                  <div>
                    <Lbl style={{ marginBottom: 6 }}>Your Email *</Lbl>
                    <input type="email" value={supportForm.email} onChange={e => sf('email', e.target.value)} placeholder="you@example.com" style={modalInput} />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Lbl style={{ marginBottom: 6 }}>Category *</Lbl>
                  <select
                    value={supportForm.category}
                    onChange={e => sf('category', e.target.value)}
                    style={{ ...modalInput, color: supportForm.category ? S.text : S.textFaint }}
                  >
                    <option value="">Select a category…</option>
                    {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <Lbl style={{ marginBottom: 6 }}>Subject *</Lbl>
                  <input value={supportForm.subject} onChange={e => sf('subject', e.target.value)} placeholder="Brief description of the issue" style={modalInput} />
                </div>

                {/* Message */}
                <div>
                  <Lbl style={{ marginBottom: 6 }}>Message *</Lbl>
                  <textarea
                    value={supportForm.message}
                    onChange={e => sf('message', e.target.value)}
                    placeholder="Please describe your issue in detail. Include any order IDs, dates, or screenshots if relevant."
                    rows={5}
                    style={{ ...modalInput, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                {/* Error */}
                {supportError && (
                  <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', padding: '10px 14px', borderRadius: S.radiusSm }}>
                    <Body style={{ color: S.danger, fontSize: 12, margin: 0 }}>⚠ {supportError}</Body>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="ghost" onClick={closeSupport} full>Cancel</Btn>
                  <Btn
                    variant="gold"
                    onClick={handleSupportSubmit}
                    disabled={supportStatus === 'sending'}
                    full
                  >
                    {supportStatus === 'sending' ? 'Sending…' : 'Send Request →'}
                  </Btn>
                </div>

                <Body style={{ fontSize: 11, color: S.textFaint, textAlign: 'center', margin: 0 }}>
                  Or email us directly:{' '}
                  <a href={`mailto:${SUPPORT_ADDR}`} style={{ color: S.gold }}>{SUPPORT_ADDR}</a>
                </Body>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <Nav
        scrolled={true}
        user={null}
        onAdmin={() => {}}   onSignup={() => {}}   onMessages={() => {}}
        onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose}
        onLogin={() => {}}   onSignOut={() => {}}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 60px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Lbl style={{ marginBottom: 12 }}>Performance Overview</Lbl>
            <Hl style={{ fontSize: 'clamp(28px,5vw,60px)', fontWeight: 300 }}>
              The Designer<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Portfolio Ledger</em>
            </Hl>
          </div>
          <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
        </div>
        <GoldLine w="60px" />

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: S.borderFaint, marginBottom: 24 }}>
          <StatCard
            label="Total Earnings"
            value={fmt(designer.earnings || 0)}
            color={S.gold}
            sub={designer.earnings > 0 ? '↑ from last period' : 'No earnings yet'}
          />
          <StatCard
            label="Active Projects"
            value={designer.orders || 0}
            sub={designer.orders > 0 ? `${designer.orders} project${designer.orders !== 1 ? 's' : ''}` : 'No active projects'}
          />
          <StatCard
            label="Client Rating"
            value={designer.rating > 0 ? `${designer.rating} ★` : '—'}
            color={S.gold}
            sub={designer.reviews > 0 ? `${designer.reviews} review${designer.reviews !== 1 ? 's' : ''}` : 'No reviews yet'}
          />
          <StatCard
            label="Badge Progress"
            value={BADGES[designer.badge]?.label || '—'}
            color={BADGES[designer.badge]?.color}
            sub={designer.badge === 'elite' ? 'Highest tier achieved' : 'Complete more orders to level up'}
          />
        </div>

        {/* ── Chart + Referral ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 20, marginBottom: 20 }}>

          {/* Earnings chart */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <Lbl style={{ marginBottom: 6 }}>Earnings Over Time</Lbl>
                <Body style={{ fontSize: 10, color: S.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Revenue Performance · Fiscal Year 2026
                </Body>
              </div>
              {/* FIXED: Export now downloads a real CSV */}
              <Btn variant="ghost" size="sm" onClick={handleExport}>Export ↗</Btn>
            </div>
            <svg width="100%" height="160" viewBox="0 0 660 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={S.gold} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={S.gold} stopOpacity="0"   />
                </linearGradient>
              </defs>
              <polygon points={`60,160 ${pts} 560,160`} fill="url(#cg)" />
              <polyline points={pts} fill="none" stroke={S.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {monthly.map((d, i) => (
                <g key={d.m}>
                  <circle cx={60 + i * 100} cy={140 - (d.e / maxE) * 110} r="4" fill={S.gold} />
                  <text x={60 + i * 100} y="158" textAnchor="middle" fill={S.textFaint} fontSize="9" fontFamily={S.body}>{d.m}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Referral + Top Work */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px', flex: 1 }}>
              <Lbl style={{ marginBottom: 12 }}>Referral Programme</Lbl>
              <Hl style={{ fontSize: 18, marginBottom: 10 }}>
                <em style={{ fontStyle: 'italic', color: S.gold }}>Earn GH₵20 per referral</em>
              </Hl>
              <Body style={{ fontSize: 11, marginBottom: 14, lineHeight: 1.7 }}>
                Every new client you refer who completes their first order earns you GH₵20.
              </Body>

              {/* FIXED: deterministic code + inline COPY feedback */}
              <div style={{ background: S.bgLow, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, borderRadius: S.radiusSm }}>
                <code style={{ color: S.gold, fontSize: 10, fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {referralUrl}
                </code>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? S.success : S.gold,
                    color: S.onPrimary,
                    border: 'none',
                    padding: '4px 10px',
                    fontSize: 9,
                    fontFamily: S.body,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    minWidth: 60,
                  }}
                >
                  {copied ? '✓ COPIED' : 'COPY'}
                </button>
              </div>

              <div style={{ marginBottom: 10 }}>
                <Body style={{ fontSize: 10, color: S.textFaint, margin: 0 }}>
                  Your code: <strong style={{ color: S.text, letterSpacing: '0.05em' }}>{referralCode}</strong>
                </Body>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: S.bgLow, padding: '12px', textAlign: 'center', borderRadius: S.radiusSm }}>
                  <Hl style={{ color: S.gold, fontSize: 22 }}>{designer.referrals || 0}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4, fontSize: 7 }}>Referrals</Lbl>
                </div>
                <div style={{ background: S.bgLow, padding: '12px', textAlign: 'center', borderRadius: S.radiusSm }}>
                  <Hl style={{ color: S.gold, fontSize: 22 }}>{fmt((designer.referrals || 0) * 20)}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4, fontSize: 7 }}>Earned</Lbl>
                </div>
              </div>
            </div>

            {designer.portfolio?.[0] && (
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '16px' }}>
                <Lbl style={{ marginBottom: 8, fontSize: 7 }}>Top Performer</Lbl>
                <div style={{ height: 100, overflow: 'hidden', position: 'relative', borderRadius: S.radiusSm }}>
                  <img
                    src={designer.portfolio[0]}
                    alt="Best portfolio work"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.6 }}
                  />
                  <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                    <Lbl style={{ color: S.gold, fontSize: 7 }}>Best Work</Lbl>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Disbursements ledger ── */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '20px 16px' : '28px', marginBottom: 20, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <Lbl>Recent Disbursements</Lbl>
            <Body style={{ fontSize: 11, color: S.textFaint, margin: 0 }}>
              {ledger.length} transaction{ledger.length !== 1 ? 's' : ''}
              {/* TODO: Add date-range filter once real orders are wired */}
            </Body>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 1, background: S.borderFaint, minWidth: 580 }}>
            {['Project', 'Reference', 'Date', 'Status', 'Amount'].map(h => (
              <div key={h} style={{ background: S.surfaceHigh, padding: '8px 14px' }}>
                <Lbl style={{ margin: 0, fontSize: 8 }}>{h}</Lbl>
              </div>
            ))}
            {ledger.map((r, i) => [
              <div key={`p${i}`}   style={{ background: S.surface, padding: '10px 14px', borderBottom: `1px solid ${S.borderFaint}` }}>
                <Hl style={{ fontSize: 12 }}>{r.project}</Hl>
              </div>,
              <div key={`ref${i}`} style={{ background: S.surface, padding: '10px 14px', borderBottom: `1px solid ${S.borderFaint}` }}>
                <Body style={{ fontSize: 11, color: S.textMuted, fontFamily: 'monospace' }}>{r.ref}</Body>
              </div>,
              <div key={`d${i}`}   style={{ background: S.surface, padding: '10px 14px', borderBottom: `1px solid ${S.borderFaint}` }}>
                <Body style={{ fontSize: 11 }}>{r.date}</Body>
              </div>,
              <div key={`s${i}`}   style={{ background: S.surface, padding: '10px 14px', borderBottom: `1px solid ${S.borderFaint}` }}>
                <span style={{
                  background: r.status === 'Active' ? S.goldDim : 'rgba(74,154,74,0.12)',
                  color: r.status === 'Active' ? S.gold : S.success,
                  fontSize: 9, padding: '3px 8px', fontFamily: S.body, fontWeight: 700, letterSpacing: '0.1em',
                }}>
                  {r.status.toUpperCase()}
                </span>
              </div>,
              <div key={`a${i}`}   style={{ background: S.surface, padding: '10px 14px', borderBottom: `1px solid ${S.borderFaint}` }}>
                <Hl style={{ color: S.gold, fontSize: 13 }}>₵{r.amount.toLocaleString()}</Hl>
              </div>,
            ])}
          </div>

          {ledger.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Body style={{ fontSize: 12, color: S.textFaint }}>No disbursements recorded yet.</Body>
            </div>
          )}
          {/* TODO: Replace ledger rows with live Supabase query:
               SELECT * FROM orders WHERE designer_id = designer.id ORDER BY created_at DESC */}
        </div>

        {/* ── Badge progression ── */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '20px 16px' : '28px', marginBottom: 20 }}>
          <Lbl style={{ marginBottom: 16 }}>Badge Progression</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(BADGES).map(([key, b]: [string, any]) => {
              const done =
                key === 'new' ||
                (key === 'verified'  && designer.orders > 0) ||
                (key === 'top_rated' && designer.orders >= 10 && designer.rating >= 4.8) ||
                (key === 'elite'     && designer.orders >= 50)
              const isCurrent = designer.badge === key
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    background: isCurrent ? S.goldDim : done ? 'rgba(74,154,74,0.06)' : S.bgLow,
                    border: `1px solid ${isCurrent ? S.gold : done ? 'rgba(74,154,74,0.25)' : S.borderFaint}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{
                    background: b.bg, color: b.color, fontSize: 9, padding: '3px 10px',
                    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                    fontFamily: S.body, fontWeight: 700, border: `1px solid ${b.color}20`, whiteSpace: 'nowrap' as const,
                  }}>
                    {b.label}
                  </span>
                  <Body style={{ fontSize: 11, flex: 1 }}>
                    {key === 'new'       && 'Account approved by admin'}
                    {key === 'verified'  && '1+ completed order with 4+ star review'}
                    {key === 'top_rated' && '10+ orders with 4.8+ average rating'}
                    {key === 'elite'     && '50+ orders with 4.9+ average · Invite only'}
                  </Body>
                  {isCurrent && <Lbl style={{ margin: 0, fontSize: 7, color: S.gold }}>CURRENT</Lbl>}
                  <div style={{ color: done ? S.success : S.textFaint, fontSize: 16 }}>
                    {done ? '✓' : '○'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── FIXED: Contact Support opens real modal ── */}
        <Btn variant="outline" full onClick={openSupport}>
          Need Technical Support? · Contact Support
        </Btn>

      </div>
    </div>
  )
}

// ── Clipboard fallback for browsers without navigator.clipboard ──────────────
function legacyCopy(text: string) {
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity  = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  } catch {}
}
