import React, { useEffect, useRef, useState } from 'react'
import { S, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard } from './UI'
import Nav from './Nav'
import { DISPUTES_DATA, ORDERS, DESIGNERS } from '../data/mockData'
import { supabase } from '../lib/supabase'
import AdminToast, { useToast } from './AdminToast'
import AdminConfirmModal, { ConfirmConfig } from './AdminConfirmModal'

interface AdminPanelProps { onClose: () => void }

// Dispute shape extended with UI-only fields
interface Dispute {
  id:                    number
  client:                string
  client_email:          string
  designer:              string
  project:               string
  amount:                number
  reason:                string
  status:                string
  raised:                string
  order_id:              number | null
  evidence_requested:    boolean
  evidence_requested_at: string | null
  new_response:          boolean
}

function toDispute(raw: any): Dispute {
  return {
    id:                    raw.id,
    client:                raw.client       || '',
    client_email:          raw.client_email || '',
    designer:              raw.designer     || '',
    project:               raw.project      || '',
    amount:                raw.amount       || 0,
    reason:                raw.reason       || '',
    status:                raw.status       || 'open',
    raised:                raw.raised       || '',
    order_id:              raw.order_id     ?? null,
    evidence_requested:    raw.evidence_requested    ?? false,
    evidence_requested_at: raw.evidence_requested_at ?? null,
    new_response:          false,
  }
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab, setTab]           = useState('applications')
  const [apps, setApps]         = useState<any[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>(DISPUTES_DATA.map(toDispute))
  const [isMobile, setIsMobile] = useState(false)
  const [confirm, setConfirm]   = useState<ConfirmConfig | null>(null)

  const { toasts, addToast, dismissToast } = useToast()
  const disputesRef = useRef<Dispute[]>(disputes)
  useEffect(() => { disputesRef.current = disputes }, [disputes])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Load applications ─────────────────────────────────────────────────────

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

  // ── Load disputes from Supabase (falls back to mock data if empty) ─────────

  const loadDisputes = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('id, client, client_email, designer, project, amount, reason, status, raised, order_id, evidence_requested, evidence_requested_at')
      .eq('status', 'open')
    if (data && data.length > 0) {
      setDisputes(data.map(toDispute))
    }
    // else: keep mock data already in state
  }

  useEffect(() => {
    loadApplications()
    loadDisputes()
  }, [])

  // ── Realtime: watch for new messages on disputed orders ───────────────────

  useEffect(() => {
    const orderIds = disputesRef.current.map(d => d.order_id).filter(Boolean) as number[]
    if (orderIds.length === 0) return

    const channel = supabase
      .channel('dispute-order-messages')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `order_id=in.(${orderIds.join(',')})`,
        },
        async (payload: any) => {
          const orderId  = payload.new?.order_id
          const dispute  = disputesRef.current.find(d => d.order_id === orderId)
          if (!dispute) return

          // Mark as new response in UI
          setDisputes(prev =>
            prev.map(d => d.order_id === orderId ? { ...d, new_response: true } : d)
          )

          // Notify disputes inbox via Vercel function (non-blocking)
          fetch('/api/notify-dispute-response', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientName: dispute.client,
              orderTitle: dispute.project,
              orderId:    dispute.order_id,
            }),
          }).catch(err => console.error('notify-dispute-response failed (non-fatal):', err))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, []) // Run once on mount; order IDs are stable per admin session

  // ── Approve / reject designers ────────────────────────────────────────────

  const approveDesigner = async (id: string) => {
    const { error } = await supabase.from('designers').update({ verified: true, public_visible: true, badge: 'new' }).eq('id', id)
    if (error) { addToast('error', error.message); return }
    loadApplications()
    addToast('success', 'Designer approved and is now live on the marketplace.')
  }

  const rejectDesigner = async (id: string) => {
    const { error } = await supabase.from('designers').update({ verified: false, public_visible: false }).eq('id', id)
    if (error) { addToast('error', error.message); return }
    loadApplications()
    addToast('info', 'Application rejected.')
  }

  // ── Dispute actions ───────────────────────────────────────────────────────

  const handleRelease = (d: Dispute) => {
    setConfirm({
      title:        'Release funds to designer?',
      message:      `This will release ${fmt(d.amount)} to ${d.designer}. This action cannot be undone.`,
      confirmLabel: 'Release Funds',
      variant:      'success',
      onConfirm:    () => {
        setDisputes(prev => prev.filter(x => x.id !== d.id))
        addToast('success', `Funds released to ${d.designer}.`)
      },
    })
  }

  const handleRefund = (d: Dispute) => {
    setConfirm({
      title:        'Refund client?',
      message:      `This will refund ${fmt(d.amount)} to ${d.client}. This action cannot be undone.`,
      confirmLabel: 'Issue Refund',
      variant:      'danger',
      onConfirm:    () => {
        setDisputes(prev => prev.filter(x => x.id !== d.id))
        addToast('success', `Refund of ${fmt(d.amount)} issued to ${d.client}.`)
      },
    })
  }

  const handleRequestEvidence = async (d: Dispute) => {
    // 1. Update Supabase dispute record
    const now = new Date().toISOString()
    supabase
      .from('disputes')
      .update({ evidence_requested: true, evidence_requested_at: now })
      .eq('id', d.id)
      .then(({ error }) => {
        if (error) console.error('Supabase evidence update (non-fatal):', error.message)
      })

    // 2. Send email via Vercel function
    const emailRes = await fetch('/api/send-evidence-request', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientEmail: d.client_email || '',
        clientName:  d.client,
        orderTitle:  d.project,
        orderAmount: fmt(d.amount),
        orderId:     d.order_id ?? d.id,
      }),
    }).catch(err => { console.error('send-evidence-request fetch error:', err); return null })

    if (emailRes && !emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}))
      console.error('send-evidence-request error:', err)
      // Still mark locally — the Supabase update succeeded
    }

    // 3. Update local state
    setDisputes(prev =>
      prev.map(x => x.id === d.id
        ? { ...x, evidence_requested: true, evidence_requested_at: now }
        : x
      )
    )

    // 4. Toast
    addToast('info', `Evidence request sent to ${d.client} — they will receive an email to submit proof via the order chat.`)
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const TABS = [
    { k: 'applications', l: `Applications (${apps.length})` },
    { k: 'disputes',     l: `Disputes (${disputes.length})` },
    { k: 'featured',     l: 'Featured Slots'                },
    { k: 'orders',       l: 'Orders'                        },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
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

      {/* ── Confirm modal (overlays admin panel only) ── */}
      {confirm && (
        <AdminConfirmModal config={confirm} onCancel={() => setConfirm(null)} />
      )}

      {/* ── Toast stack ── */}
      <AdminToast toasts={toasts} onDismiss={dismissToast} />

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
                  <Btn variant="outline" size="sm" onClick={() => addToast('info', 'Portfolio review coming soon.')}>Review</Btn>
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

                {/* Title row with status badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Hl style={{ fontSize: 16, fontWeight: 600 }}>{d.project}</Hl>
                    {/* "Awaiting Evidence" badge — shown after evidence is requested */}
                    {d.evidence_requested && !d.new_response && (
                      <span style={{
                        background:    'rgba(245,158,11,0.12)',
                        border:        '1px solid rgba(245,158,11,0.35)',
                        color:         '#fbbf24',
                        fontSize:      9,
                        fontFamily:    S.body,
                        fontWeight:    700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding:       '3px 8px',
                        borderRadius:  4,
                        whiteSpace:    'nowrap',
                      }}>
                        ⏳ Awaiting Evidence
                      </span>
                    )}
                    {/* "New Response" badge — shown when a new message arrives */}
                    {d.new_response && (
                      <span
                        style={{
                          background:    'rgba(22,163,74,0.12)',
                          border:        '1px solid rgba(22,163,74,0.35)',
                          color:         '#4ade80',
                          fontSize:      9,
                          fontFamily:    S.body,
                          fontWeight:    700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          padding:       '3px 8px',
                          borderRadius:  4,
                          whiteSpace:    'nowrap',
                          cursor:        'pointer',
                        }}
                        onClick={() =>
                          setDisputes(prev => prev.map(x => x.id === d.id ? { ...x, new_response: false } : x))
                        }
                        title="Click to dismiss"
                      >
                        ● New Response
                      </span>
                    )}
                  </div>
                  <Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(d.amount)}</Hl>
                </div>

                <Body style={{ fontSize: 11, marginBottom: 8 }}>Client: {d.client} · Designer: {d.designer} · Raised: {d.raised}</Body>
                {d.evidence_requested && d.evidence_requested_at && (
                  <Body style={{ fontSize: 10, color: '#fbbf24', marginBottom: 6 }}>
                    Evidence requested {new Date(d.evidence_requested_at).toLocaleString()}
                  </Body>
                )}
                <div style={{ background: S.bgLow, borderLeft: `3px solid ${S.danger}`, padding: '10px 14px', marginBottom: 14 }}>
                  <Body style={{ fontSize: 12 }}>"{d.reason}"</Body>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn variant="success" size="sm" onClick={() => handleRelease(d)}>Release to Designer</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => handleRefund(d)}>Refund Client</Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => !d.evidence_requested && handleRequestEvidence(d)}
                    style={{ opacity: d.evidence_requested ? 0.45 : 1, cursor: d.evidence_requested ? 'not-allowed' : 'pointer' }}
                  >
                    {d.evidence_requested ? 'Evidence Requested ✓' : 'Request Evidence'}
                  </Btn>
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
                    <Btn
                      variant={d.featured ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (d.featured) {
                          addToast('info', `${d.name} removed from featured slots.`)
                        } else {
                          addToast('success', `${d.name} added to featured slots — invoice GH₵200 sent.`)
                        }
                      }}
                    >
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
