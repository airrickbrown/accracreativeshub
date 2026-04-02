import React, { useEffect, useState } from 'react'
import { S, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard } from './UI'
import Nav from './Nav'
import { DISPUTES_DATA, ORDERS, DESIGNERS } from '../data/mockData'
import { supabase } from '../lib/supabase'

interface AdminPanelProps { onClose: () => void }

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab, setTab]           = useState('applications')
  const [apps, setApps]         = useState<any[]>([])
  const [disputes, setDisputes] = useState(DISPUTES_DATA)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from('designers')
      .select('*, profiles(full_name, email, phone, location)')
      .eq('verified', false)
      .eq('public_visible', false)

    if (error) { console.error('Error loading applications:', error); return }
    if (data) {
      setApps(data.map((d: any) => ({
        id:             d.id,
        name:           d.profiles?.full_name || 'Unnamed Designer',
        email:          d.profiles?.email     || '—',
        category:       d.category            || 'Unspecified',
        phone:          d.profiles?.phone     || 'No phone',
        location:       d.profiles?.location  || '—',
        idVerified:     !!d.id_uploaded,
        portfolioCount: d.portfolio_count || 0,
        appliedAt:      d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Unknown',
      })))
    }
  }

  const approveDesigner = async (id: string) => {
    const { error } = await supabase.from('designers').update({ verified: true, public_visible: true, badge: 'new' }).eq('id', id)
    if (error) { alert(error.message); return }
    loadApplications()
    alert('Designer approved and now live on marketplace!')
  }

  const rejectDesigner = async (id: string) => {
    const { error } = await supabase.from('designers').update({ verified: false, public_visible: false }).eq('id', id)
    if (error) { alert(error.message); return }
    loadApplications()
    alert('Application rejected.')
  }

  useEffect(() => { loadApplications() }, [])

  const TABS = [
    { k: 'applications', l: `Applications (${apps.length})` },
    { k: 'disputes',     l: `Disputes (${disputes.length})` },
    { k: 'featured',     l: 'Featured Slots'                },
    { k: 'orders',       l: 'Orders'                        },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
      {/* ── FIX: All Nav props provided ── */}
      <Nav
        scrolled={true}
        user={null}
        onAdmin={() => {}}
        onSignup={() => {}}
        onMessages={() => {}}
        onMarketplace={onClose}
        onHowItWorks={onClose}
        onForDesigners={onClose}
        onLogin={() => {}}
        onSignOut={() => {}}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Lbl style={{ marginBottom: 8 }}>Platform Administration</Lbl>
            <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300 }}>Admin Mode</Hl>
          </div>
          <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 1, background: S.borderFaint, marginBottom: 28 }}>
          <StatCard label="Pending Applications" value={`${apps.length}`}                              sub="Awaiting review"           />
          <StatCard label="Gross Revenue"         value="₵84,200"          color={S.gold}              sub="Month to month"            />
          <StatCard label="Pending Disputes"      value={`${disputes.filter(d => d.status === 'open').length}`}
            color={disputes.filter(d => d.status === 'open').length > 0 ? S.danger : S.text}           sub="Requires immediate action" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, background: S.borderFaint, marginBottom: 24, overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: tab === t.k ? S.goldDim : S.surface, border: 'none', color: tab === t.k ? S.gold : S.textMuted, padding: '12px 8px', fontFamily: S.headline, fontSize: isMobile ? 8 : 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Applications */}
        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apps.length === 0 && <Body style={{ textAlign: 'center', padding: '40px 0' }}>No pending applications</Body>}
            {apps.map((a) => (
              <div key={a.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '14px' : '16px 20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 14, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2a2a2a', border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 12, fontWeight: 700, fontFamily: S.body, flexShrink: 0 }}>
                  {(a.name || 'NA').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Hl style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</Hl>
                  <Body style={{ fontSize: 11, marginBottom: 4 }}>{a.email} · {a.category} · Applied {a.appliedAt}</Body>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: a.idVerified ? S.success : S.danger, fontSize: 10, fontFamily: S.body }}>● {a.idVerified ? 'ID Verified' : 'No ID uploaded'}</span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>📁 {a.portfolioCount} samples</span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>{a.phone}</span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>📍 {a.location}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn variant="outline" size="sm" onClick={() => alert('Portfolio review coming soon')}>Review</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => rejectDesigner(a.id)}>Reject</Btn>
                  <Btn variant="success" size="sm" onClick={() => approveDesigner(a.id)}>Approve</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disputes */}
        {tab === 'disputes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {disputes.length === 0 && <Body style={{ textAlign: 'center', padding: '40px 0' }}>No active disputes</Body>}
            {disputes.map((d) => (
              <div key={d.id} style={{ background: S.surface, border: '1px solid rgba(255,180,171,0.2)', padding: isMobile ? '16px' : '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <Hl style={{ fontSize: 16, fontWeight: 600 }}>{d.project}</Hl>
                  <Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(d.amount)}</Hl>
                </div>
                <Body style={{ fontSize: 11, marginBottom: 8 }}>Client: {d.client} · Designer: {d.designer} · Raised: {d.raised}</Body>
                <div style={{ background: S.bgLow, borderLeft: `3px solid ${S.danger}`, padding: '10px 14px', marginBottom: 14 }}>
                  <Body style={{ fontSize: 12 }}>"{d.reason}"</Body>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn variant="success" size="sm" onClick={() => { setDisputes(p => p.filter(x => x.id !== d.id)); alert('Funds released to designer.') }}>Release to Designer</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => { setDisputes(p => p.filter(x => x.id !== d.id)); alert('Refund issued to client.') }}>Refund Client</Btn>
                  <Btn variant="ghost"   size="sm" onClick={() => alert('Evidence requested.')}>Request Evidence</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured */}
        {tab === 'featured' && (
          <div>
            <div style={{ background: S.goldDim, border: `1px solid ${S.borderFaint}`, padding: '12px 16px', marginBottom: 16 }}>
              <Body style={{ fontSize: 11, color: S.textFaint }}>Featured slots appear at the top of the marketplace. Charging GH₵200/month per slot. 3 slots available.</Body>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DESIGNERS.map((d) => (
                <div key={d.id} style={{ background: S.surface, border: `1px solid ${d.featured ? S.gold : S.border}`, padding: isMobile ? '12px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: d.color, border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 11, fontWeight: 700, fontFamily: S.body }}>{d.avatar}</div>
                    <div>
                      <Hl style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</Hl>
                      <Body style={{ fontSize: 11 }}>{d.category}</Body>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {d.featured && <Body style={{ fontSize: 11, color: S.gold }}>Currently featured · GH₵200/mo</Body>}
                    <Btn variant={d.featured ? 'ghost' : 'outline'} size="sm" onClick={() => alert(d.featured ? `${d.name} removed` : `${d.name} added — invoice GH₵200 sent`)}>
                      {d.featured ? 'Remove' : 'Feature'}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ORDERS.map((o) => (
              <div key={o.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '12px' : '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <Hl style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{o.project}</Hl>
                  <Body style={{ fontSize: 11 }}>{o.client} → {o.designer} {o.rush && <span style={{ color: '#fcd34d' }}>· ⚡ Rush</span>} · Revisions: {o.revisions.used}/{o.revisions.total}</Body>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
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
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '12px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Body style={{ fontSize: 12 }}>Total platform commissions this period</Body>
              <Hl style={{ color: S.gold, fontSize: 20 }}>{fmt(ORDERS.reduce((s, o) => s + o.commission, 0))}</Hl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}