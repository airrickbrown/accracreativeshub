// ── ADMIN PANEL COMPONENT ──
// Platform management dashboard — only accessible to you.
// Shows applications to approve, disputes to resolve,
// featured slot management, and order/commission tracking.

import React, { useState } from 'react'
import { S, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard } from './UI'
import Nav from './Nav'
import { PENDING_APPS, DISPUTES_DATA, ORDERS, DESIGNERS } from '../data/mockData'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab,      setTab]      = useState('applications')
  const [apps,     setApps]     = useState(PENDING_APPS)
  const [disputes, setDisputes] = useState(DISPUTES_DATA)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}} scrolled={true} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <Lbl style={{ marginBottom: 8 }}>Platform Administration</Lbl>
            <Hl style={{ fontSize: 48, fontWeight: 300 }}>Admin Mode</Hl>
          </div>
          <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: S.borderFaint, marginBottom: 32 }}>
          <StatCard label="Total Orders"       value="1,428"   sub="View order set →" />
          <StatCard label="Gross Revenue"      value="₵84,200" color={S.gold} sub="Month to month" />
          <StatCard label="Pending Disputes"   value={`0${disputes.filter(d => d.status === 'open').length}`} color={disputes.filter(d => d.status === 'open').length > 0 ? S.danger : S.text} sub="Requires immediate action" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, background: S.borderFaint, marginBottom: 24 }}>
          {[{ k: 'applications', l: `Applications (${apps.length})` }, { k: 'disputes', l: `Disputes (${disputes.length})` }, { k: 'featured', l: 'Featured Slots' }, { k: 'orders', l: 'Orders' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: tab === t.k ? S.goldDim : S.surface, border: 'none', color: tab === t.k ? S.gold : S.textMuted, padding: '12px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── Applications tab ── */}
        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apps.length === 0 && <Body style={{ textAlign: 'center', padding: '40px 0' }}>No pending applications</Body>}
            {apps.map(a => (
              <div key={a.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: a.color, border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 12, fontWeight: 700, fontFamily: S.body, flexShrink: 0 }}>{a.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Hl style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</Hl>
                  <Body style={{ fontSize: 11, marginBottom: 4 }}>{a.category} · Applied {a.appliedAt}</Body>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: a.idVerified ? S.success : S.danger, fontSize: 10, fontFamily: S.body }}>● {a.idVerified ? 'ID Verified' : 'No ID uploaded'}</span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>📁 {a.portfolioCount} samples</span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>{a.phone}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="outline" size="sm" onClick={() => alert('Opening portfolio...')}>Review Portfolio</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => setApps(p => p.filter(x => x.id !== a.id))}>Reject</Btn>
                  <Btn variant="success" size="sm" onClick={() => { setApps(p => p.filter(x => x.id !== a.id)); alert(`${a.name} approved! Notified via WhatsApp.`) }}>Approve</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Disputes tab ── */}
        {tab === 'disputes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {disputes.length === 0 && <Body style={{ textAlign: 'center', padding: '40px 0' }}>No active disputes</Body>}
            {disputes.map(d => (
              <div key={d.id} style={{ background: S.surface, border: '1px solid rgba(255,180,171,0.2)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Hl style={{ fontSize: 16, fontWeight: 600 }}>{d.project}</Hl>
                  <Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(d.amount)}</Hl>
                </div>
                <Body style={{ fontSize: 11, marginBottom: 8 }}>Client: {d.client} · Designer: {d.designer} · Raised: {d.raised}</Body>
                <div style={{ background: S.bgLow, borderLeft: `3px solid ${S.danger}`, padding: '10px 14px', marginBottom: 14 }}>
                  <Body style={{ fontSize: 12 }}>"{d.reason}"</Body>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="success" size="sm" onClick={() => { setDisputes(p => p.filter(x => x.id !== d.id)); alert('Funds released to designer.') }}>Release to Designer</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => { setDisputes(p => p.filter(x => x.id !== d.id)); alert('Refund issued to client.') }}>Refund Client</Btn>
                  <Btn variant="ghost"   size="sm" onClick={() => alert('Evidence requested from both parties.')}>Request Evidence</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Featured slots tab ── */}
        {tab === 'featured' && (
          <div>
            <div style={{ background: S.goldDim, border: `1px solid ${S.borderFaint}`, padding: '12px 16px', marginBottom: 16 }}>
              <Body style={{ fontSize: 11, color: S.textFaint }}>Featured slots appear at the top of the marketplace. Charging GH₵200/month per slot. 3 slots available.</Body>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DESIGNERS.map(d => (
                <div key={d.id} style={{ background: S.surface, border: `1px solid ${d.featured ? S.gold : S.border}`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: d.color, border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 11, fontWeight: 700, fontFamily: S.body }}>{d.avatar}</div>
                    <div>
                      <Hl style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</Hl>
                      <Body style={{ fontSize: 11 }}>{d.category}</Body>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {d.featured && <Body style={{ fontSize: 11, color: S.gold }}>Currently featured · GH₵200/mo</Body>}
                    <Btn variant={d.featured ? 'ghost' : 'outline'} size="sm" onClick={() => alert(d.featured ? `${d.name} removed from featured` : `${d.name} added to featured — invoice GH₵200 sent`)}>
                      {d.featured ? 'Remove' : 'Feature'}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders tab ── */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ORDERS.map(o => (
              <div key={o.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Hl style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{o.project}</Hl>
                  <Body style={{ fontSize: 11 }}>{o.client} → {o.designer} {o.rush && <span style={{ color: '#fcd34d' }}>· ⚡ Rush</span>} · Revisions: {o.revisions.used}/{o.revisions.total}</Body>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(o.amount)}</Hl>
                    <Body style={{ fontSize: 10 }}>Commission: {fmt(o.commission)}</Body>
                  </div>
                  <div style={{ background: o.status === 'delivered' ? 'rgba(74,154,74,0.12)' : S.goldDim, color: o.status === 'delivered' ? S.success : S.gold, fontSize: 9, padding: '4px 10px', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: S.body, fontWeight: 700 }}>
                    {o.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
            {/* Total row */}
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Body style={{ fontSize: 12 }}>Total platform commissions this period</Body>
              <Hl style={{ color: S.gold, fontSize: 20 }}>{fmt(ORDERS.reduce((s, o) => s + o.commission, 0))}</Hl>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
