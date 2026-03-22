// ── DESIGNER DASHBOARD / ANALYTICS COMPONENT ──
// Personal dashboard for designers to track their performance.
// Shows earnings chart, badge progress, referral program.

import React from 'react'
import { S, fmt, pct, BADGES } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard, GoldLine } from './UI'
import Nav from './Nav'

interface DesignerDashboardProps {
  designer: any
  onClose:  () => void
}

export default function DesignerDashboard({ designer, onClose }: DesignerDashboardProps) {
  // Monthly earnings data for the chart
  const monthly = [
    { m: 'Jan', e: 1200 }, { m: 'Feb', e: 2100 }, { m: 'Mar', e: 1840 },
    { m: 'Apr', e: 3200 }, { m: 'May', e: 2700 }, { m: 'Jun', e: 3680 },
  ]
  const maxE = Math.max(...monthly.map(d => d.e))
  // SVG path points for the earnings curve
  const pts  = monthly.map((d, i) => `${60 + i * 100},${140 - (d.e / maxE) * 110}`).join(' ')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}} scrolled={true} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <Lbl style={{ marginBottom: 12 }}>Performance Overview</Lbl>
            <Hl style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300 }}>
              The Designer<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Portfolio Ledger</em>
            </Hl>
          </div>
          <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
        </div>
        <GoldLine w="60px" />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: S.borderFaint, marginBottom: 24 }}>
          <StatCard label="Total Earnings"  value={fmt(designer.earnings)} color={S.gold}      sub="↑ 18% from last month" />
          <StatCard label="Active Projects" value={designer.orders}                             sub="2 awaiting review"     />
          <StatCard label="Client Rating"   value={`${designer.rating} ★`} color={S.gold}      sub="Top 5% on platform"   />
          <StatCard label="Badge Progress"  value={BADGES[designer.badge]?.label || '—'} color={BADGES[designer.badge]?.color} sub="70% to next tier" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 20 }}>

          {/* ── Earnings chart ── */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <Lbl style={{ marginBottom: 6 }}>Earnings Over Time</Lbl>
                <Body style={{ fontSize: 10, color: S.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Revenue Performance · Fiscal Year 2026</Body>
              </div>
              <Btn variant="ghost" size="sm">Export ↗</Btn>
            </div>
            {/* SVG line chart */}
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

          {/* ── Right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Referral programme */}
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px', flex: 1 }}>
              <Lbl style={{ marginBottom: 12 }}>Enlarge the Creative Circle</Lbl>
              <Hl style={{ fontSize: 18, marginBottom: 10 }}><em style={{ fontStyle: 'italic', color: S.gold }}>Referral Programme</em></Hl>
              <Body style={{ fontSize: 11, marginBottom: 14 }}>Earn GH₵20 for every new client you refer who completes their first order.</Body>
              {/* Referral link */}
              <div style={{ background: S.bgLow, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ color: S.gold, fontSize: 10, fontFamily: 'monospace', flex: 1 }}>{`hub.gh/r/${designer.referralCode}`}</code>
                <button onClick={() => alert('Copied!')} style={{ background: S.gold, color: S.onPrimary, border: 'none', padding: '4px 10px', fontSize: 9, fontFamily: S.body, fontWeight: 700, cursor: 'pointer' }}>COPY</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: S.bgLow, padding: '12px', textAlign: 'center' }}>
                  <Hl style={{ color: S.gold, fontSize: 22 }}>{designer.referrals}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4, fontSize: 7 }}>Referrals</Lbl>
                </div>
                <div style={{ background: S.bgLow, padding: '12px', textAlign: 'center' }}>
                  <Hl style={{ color: S.gold, fontSize: 22 }}>{fmt(designer.referrals * 20)}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4, fontSize: 7 }}>Earned</Lbl>
                </div>
              </div>
            </div>

            {/* Top performer portfolio preview */}
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '16px' }}>
              <Lbl style={{ marginBottom: 8, fontSize: 7 }}>Top Performer</Lbl>
              <div style={{ height: 100, overflow: 'hidden', position: 'relative' }}>
                <img src={designer.portfolio[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.6 }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                  <Lbl style={{ color: S.gold, fontSize: 7 }}>Best Work</Lbl>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Recent disbursements table ── */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px', marginBottom: 20 }}>
          <Lbl style={{ marginBottom: 16 }}>Recent Disbursements</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 1, background: S.borderFaint }}>
            {['Project', 'Date', 'Status', 'Amount'].map(h => (
              <div key={h} style={{ background: S.surfaceHigh, padding: '8px 16px' }}>
                <Lbl style={{ margin: 0, fontSize: 8 }}>{h}</Lbl>
              </div>
            ))}
            {[
              { p: 'Indigo Textile Identity',      d: 'Oct 12, 2026', s: 'Active', a: 12400 },
              { p: 'Agenta Architecture Render',   d: 'Oct 08, 2026', s: 'Done',   a: 8200  },
            ].map((r, i) => [
              <div key={`p${i}`} style={{ background: S.surface, padding: '10px 16px', borderBottom: `1px solid ${S.borderFaint}` }}><Hl style={{ fontSize: 12 }}>{r.p}</Hl></div>,
              <div key={`d${i}`} style={{ background: S.surface, padding: '10px 16px', borderBottom: `1px solid ${S.borderFaint}` }}><Body style={{ fontSize: 11 }}>{r.d}</Body></div>,
              <div key={`s${i}`} style={{ background: S.surface, padding: '10px 16px', borderBottom: `1px solid ${S.borderFaint}` }}><span style={{ background: r.s === 'Active' ? S.goldDim : 'rgba(74,154,74,0.12)', color: r.s === 'Active' ? S.gold : S.success, fontSize: 9, padding: '3px 8px', fontFamily: S.body, fontWeight: 700, letterSpacing: '0.1em' }}>{r.s.toUpperCase()}</span></div>,
              <div key={`a${i}`} style={{ background: S.surface, padding: '10px 16px', borderBottom: `1px solid ${S.borderFaint}` }}><Hl style={{ color: S.gold, fontSize: 13 }}>₵{r.a.toLocaleString()}</Hl></div>,
            ])}
          </div>
        </div>

        {/* ── Badge progression ── */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px', marginBottom: 20 }}>
          <Lbl style={{ marginBottom: 16 }}>Badge Progression</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(BADGES).map(([key, b]) => {
              const done = (key === 'new') || (key === 'verified' && designer.orders > 0) || (key === 'top_rated' && designer.orders >= 10 && designer.rating >= 4.8) || (key === 'elite' && designer.orders >= 50)
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', background: done ? S.goldDim : S.bgLow, border: `1px solid ${done ? S.gold : S.borderFaint}` }}>
                  <span style={{ background: b.bg, color: b.color, fontSize: 9, padding: '3px 10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: S.body, fontWeight: 700, border: `1px solid ${b.color}20`, whiteSpace: 'nowrap' }}>{b.label}</span>
                  <Body style={{ fontSize: 11, flex: 1 }}>
                    {key === 'new'       && 'Account approved by admin'}
                    {key === 'verified'  && '1+ completed order with 4+ star review'}
                    {key === 'top_rated' && '10+ orders with 4.8+ average rating'}
                    {key === 'elite'     && '50+ orders with 4.9+ average · Invite only'}
                  </Body>
                  <div style={{ color: done ? S.success : S.textFaint, fontSize: 16 }}>{done ? '✓' : '○'}</div>
                </div>
              )
            })}
          </div>
        </div>

        <Btn variant="outline" full onClick={() => alert('Support contacted.')}>
          Need Technical Support? · Contact Support
        </Btn>

      </div>
    </div>
  )
}
