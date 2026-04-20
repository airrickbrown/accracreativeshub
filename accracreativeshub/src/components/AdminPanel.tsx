import React, { useEffect, useRef, useState } from 'react'
import { S, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, StatCard } from './UI'
import Nav from './Nav'
import { supabase } from '../lib/supabase'
import AdminToast, { useToast } from './AdminToast'
import AdminConfirmModal, { ConfirmConfig } from './AdminConfirmModal'
import { STATUS_LABELS, STATUS_COLORS } from '../lib/orderStatus'

interface AdminPanelProps { onClose: () => void }

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

const BADGE_OPTIONS = ['new', 'verified', 'top', 'suspended'] as const
const BADGE_COLORS: Record<string, string> = {
  new:        '#4ade80',
  verified:   '#c9a84c',
  top:        '#a78bfa',
  suspended:  '#ef4444',
  under_review: '#6b7280',
}

function exportOrdersCSV(orders: any[]) {
  const header = ['ID', 'Project', 'Client', 'Designer', 'Amount (GHS)', 'Commission (GHS)', 'Status', 'Rush']
  const rows = orders.map(o => [
    o.id, `"${o.project}"`, `"${o.client}"`, `"${o.designer}"`,
    o.amount, o.commission, o.status, o.rush ? 'Yes' : 'No',
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ach-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab, setTab]             = useState('applications')
  const [apps, setApps]           = useState<any[]>([])
  const [disputes, setDisputes]   = useState<Dispute[]>([])
  const [isMobile, setIsMobile]   = useState(false)
  const [confirm, setConfirm]     = useState<ConfirmConfig | null>(null)

  // Application review modal state
  const [reviewingDesigner,     setReviewingDesigner]     = useState<any>(null)
  const [reviewingIdSignedUrl,  setReviewingIdSignedUrl]  = useState<string | null>(null)
  const [rejectionNote,         setRejectionNote]         = useState('')
  const [reviewAction,          setReviewAction]          = useState<'approve' | 'reject' | null>(null)

  // Approved designers tab
  const [liveDesigners,   setLiveDesigners]   = useState<any[]>([])
  const [designersLoaded, setDesignersLoaded] = useState(false)

  // Featured
  const [featuredDesigners, setFeaturedDesigners] = useState<any[]>([])
  const [featuredLoading,   setFeaturedLoading]   = useState(false)

  // Stats + orders
  const [revenueTotal,  setRevenueTotal]  = useState<number | null>(null)
  const [orderStats,    setOrderStats]    = useState<{ total: number; active: number } | null>(null)
  const [liveOrders,    setLiveOrders]    = useState<any[]>([])

  const { toasts, addToast, dismissToast } = useToast()
  const disputesRef = useRef<Dispute[]>(disputes)
  useEffect(() => { disputesRef.current = disputes }, [disputes])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Load applications ─────────────────────────────────────────
  const loadApplications = async () => {
    const { data, error } = await supabase
      .from('designers')
      .select('*, profiles:id(full_name, email, phone, location)')
      .eq('verified', false)
      .eq('public_visible', false)
    if (error) { console.error('loadApplications:', error); return }
    setApps((data || []).map((d: any) => ({
      id:             d.id,
      name:           d.profiles?.full_name  || 'Unnamed Designer',
      email:          d.profiles?.email      || '—',
      category:       d.category             || 'Unspecified',
      phone:          d.profiles?.phone      || '—',
      location:       d.profiles?.location   || '—',
      idVerified:     !!d.id_uploaded,
      idUrl:          d.id_url               || null,
      portfolioUrls:  d.portfolio_urls       || [],
      portfolioCount: (d.portfolio_urls || []).length,
      appliedAt:      d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Unknown',
    })))
  }

  // ── Load approved designers ───────────────────────────────────
  const loadLiveDesigners = async () => {
    const { data } = await supabase
      .from('designers')
      .select('id, badge, featured, public_visible, category, verified, profiles:id(full_name, email)')
      .eq('verified', true)
      .order('created_at', { ascending: false })
    setLiveDesigners(data || [])
    setDesignersLoaded(true)
  }

  // ── Load stats ────────────────────────────────────────────────
  const loadStats = async () => {
    const [{ data: completed }, { data: all }] = await Promise.all([
      supabase.from('orders').select('amount').eq('status', 'completed'),
      supabase.from('orders').select('status'),
    ])
    if (completed) setRevenueTotal(completed.reduce((s: number, o: any) => s + (o.amount || 0), 0))
    if (all) setOrderStats({
      total:  all.length,
      active: all.filter((o: any) => !['completed', 'refunded', 'cancelled'].includes(o.status)).length,
    })
  }

  // ── Load featured ─────────────────────────────────────────────
  const loadFeaturedDesigners = async () => {
    setFeaturedLoading(true)
    const { data } = await supabase
      .from('designers')
      .select('id, featured, badge, category, profiles:id(full_name)')
      .eq('public_visible', true)
      .order('featured', { ascending: false })
    setFeaturedDesigners(data || [])
    setFeaturedLoading(false)
  }

  const toggleFeatured = async (designerId: string, currently: boolean) => {
    const next = !currently
    const { error } = await supabase.from('designers').update({ featured: next }).eq('id', designerId)
    if (error) { addToast('error', error.message); return }
    setFeaturedDesigners(prev => prev.map(d => d.id === designerId ? { ...d, featured: next } : d))
    const name = featuredDesigners.find(d => d.id === designerId)?.profiles?.full_name || 'Designer'
    addToast(next ? 'success' : 'info', next ? `${name} added to featured.` : `${name} removed from featured.`)
  }

  // ── Load orders ───────────────────────────────────────────────
  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, project_name, amount, status, rush, revisions_used, revisions_total, created_at, profiles:client_id(full_name), designer:designer_id(profiles:id(full_name))')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data) {
      setLiveOrders(data.map((o: any) => ({
        id:         o.id,
        project:    o.project_name || 'Unnamed Project',
        client:     o.profiles?.full_name || 'Unknown Client',
        designer:   o.designer?.profiles?.full_name || 'Unknown Designer',
        amount:     o.amount || 0,
        commission: Math.round((o.amount || 0) * 0.1),
        status:     o.status || 'pending',
        rush:       !!o.rush,
        revisions:  { used: o.revisions_used || 0, total: o.revisions_total || 3 },
      })))
    }
  }

  // ── Load disputes — no mock fallback ────────────────────────────
  const loadDisputes = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('id, client, client_email, designer, project, amount, reason, status, raised, order_id, evidence_requested, evidence_requested_at')
      .eq('status', 'open')
    setDisputes((data || []).map(toDispute))
  }

  useEffect(() => {
    loadApplications()
    loadDisputes()
    loadStats()
  }, [])

  // ── Realtime: new messages on disputed orders ─────────────────
  useEffect(() => {
    const orderIds = disputesRef.current.map(d => d.order_id).filter(Boolean) as number[]
    if (orderIds.length === 0) return
    const channel = supabase
      .channel('dispute-order-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=in.(${orderIds.join(',')})` },
        (payload: any) => {
          const orderId = payload.new?.order_id
          if (!disputesRef.current.find(d => d.order_id === orderId)) return
          setDisputes(prev => prev.map(d => d.order_id === orderId ? { ...d, new_response: true } : d))
          fetch('/api/notify-dispute-response', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          }).catch(() => {})
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [disputes.length])

  // ── Application review ────────────────────────────────────────
  const openReviewModal = async (app: any) => {
    setReviewingDesigner(app)
    setReviewingIdSignedUrl(null)
    setRejectionNote('')
    setReviewAction(null)
    if (app.idUrl) {
      const { data, error } = await supabase.storage.from('id-uploads').createSignedUrl(app.idUrl, 3600)
      if (!error && data?.signedUrl) setReviewingIdSignedUrl(data.signedUrl)
    }
  }

  const closeReviewModal = () => {
    setReviewingDesigner(null)
    setReviewingIdSignedUrl(null)
    setRejectionNote('')
    setReviewAction(null)
  }

  const approveDesigner = async (id: string) => {
    const { error } = await supabase
      .from('designers')
      .update({ verified: true, public_visible: true, badge: 'new' })
      .eq('id', id)
    if (error) { addToast('error', error.message); return }
    loadApplications()
    addToast('success', 'Designer approved and is now live on the marketplace.')
  }

  const rejectDesigner = async (id: string, reason?: string) => {
    const { error } = await supabase
      .from('designers')
      .update({ verified: false, public_visible: false })
      .eq('id', id)
    if (error) { addToast('error', error.message); return }
    loadApplications()
    addToast('info', `Application rejected${reason ? ' with note sent.' : '.'}`)
  }

  // ── Live designer management ──────────────────────────────────
  const updateDesignerBadge = async (id: string, badge: string) => {
    const suspended = badge === 'suspended'
    const { error } = await supabase
      .from('designers')
      .update({ badge, public_visible: !suspended })
      .eq('id', id)
    if (error) { addToast('error', error.message); return }
    setLiveDesigners(prev => prev.map(d => d.id === id ? { ...d, badge, public_visible: !suspended } : d))
    addToast(suspended ? 'info' : 'success', suspended ? 'Designer suspended and hidden from marketplace.' : `Badge updated to ${badge}.`)
  }

  // ── Dispute actions ───────────────────────────────────────────
  const handleRelease = (d: Dispute) => {
    setConfirm({
      title:        'Release funds to designer?',
      message:      `This will release ${fmt(d.amount)} to ${d.designer}. Process manually via Paystack dashboard.`,
      confirmLabel: 'Release Funds',
      variant:      'success',
      onConfirm:    async () => {
        if (d.order_id) await supabase.from('orders').update({ status: 'completed', payout_status: 'pending_transfer' }).eq('id', d.order_id)
        await supabase.from('disputes').update({ status: 'resolved_release', resolved_at: new Date().toISOString() }).eq('id', d.id)
        setDisputes(prev => prev.filter(x => x.id !== d.id))
        addToast('success', `Funds queued for transfer to ${d.designer}.`)
      },
    })
  }

  const handleRefund = (d: Dispute) => {
    setConfirm({
      title:        'Refund client?',
      message:      `This will refund ${fmt(d.amount)} to ${d.client}. Issue manually via Paystack dashboard.`,
      confirmLabel: 'Issue Refund',
      variant:      'danger',
      onConfirm:    async () => {
        if (d.order_id) await supabase.from('orders').update({ status: 'refunded' }).eq('id', d.order_id)
        await supabase.from('disputes').update({ status: 'resolved_refund', resolved_at: new Date().toISOString() }).eq('id', d.id)
        setDisputes(prev => prev.filter(x => x.id !== d.id))
        addToast('success', `Refund of ${fmt(d.amount)} queued for ${d.client}.`)
      },
    })
  }

  const handleRequestEvidence = async (d: Dispute) => {
    const now = new Date().toISOString()
    await supabase.from('disputes').update({ evidence_requested: true, evidence_requested_at: now }).eq('id', d.id)
    await fetch('/api/send-evidence-request', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientEmail: d.client_email, clientName: d.client, orderTitle: d.project, orderAmount: fmt(d.amount), orderId: d.order_id ?? d.id }),
    }).catch(err => console.error('send-evidence-request:', err))
    setDisputes(prev => prev.map(x => x.id === d.id ? { ...x, evidence_requested: true, evidence_requested_at: now } : x))
    addToast('info', `Evidence request sent to ${d.client}.`)
  }

  // ── Tabs ──────────────────────────────────────────────────────
  const TABS = [
    { k: 'applications', l: `Applications${apps.length > 0 ? ` (${apps.length})` : ''}` },
    { k: 'designers',    l: 'Designers'                                                    },
    { k: 'disputes',     l: `Disputes${disputes.length > 0 ? ` (${disputes.length})` : ''}` },
    { k: 'orders',       l: 'Orders'                                                        },
    { k: 'featured',     l: 'Featured'                                                      },
  ]

  const handleTabChange = (k: string) => {
    setTab(k)
    if (k === 'featured'  && featuredDesigners.length === 0) loadFeaturedDesigners()
    if (k === 'orders'    && liveOrders.length === 0)        loadOrders()
    if (k === 'designers' && !designersLoaded)               loadLiveDesigners()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav
        scrolled={true} user={null}
        onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}}
        onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose}
        onLogin={() => {}} onSignOut={() => {}}
      />

      {confirm && <AdminConfirmModal config={confirm} onCancel={() => setConfirm(null)} />}
      <AdminToast toasts={toasts} onDismiss={dismissToast} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Lbl style={{ marginBottom: 8 }}>Platform Administration</Lbl>
            <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300 }}>Admin Panel</Hl>
          </div>
          <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 1, background: S.borderFaint, marginBottom: 28 }}>
          <StatCard label="Pending Applications" value={`${apps.length}`} sub="Awaiting review" color={apps.length > 0 ? S.gold : S.text} />
          <StatCard label="Completed Revenue" value={revenueTotal === null ? '…' : fmt(revenueTotal)} color={S.gold} sub="From completed orders" />
          <StatCard label="Active Orders" value={orderStats === null ? '…' : `${orderStats.active}`} sub={orderStats ? `${orderStats.total} total` : ''} />
          <StatCard label="Open Disputes" value={`${disputes.filter(d => d.status === 'open').length}`} color={disputes.some(d => d.status === 'open') ? S.danger : S.text} sub="Requires action" />
        </div>

        {/* ── Portfolio review modal ── */}
        {reviewingDesigner && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.92)', overflowY: 'auto', padding: isMobile ? '20px 12px' : 40 }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <Lbl style={{ marginBottom: 6 }}>Portfolio Review</Lbl>
                  <Hl style={{ fontSize: isMobile ? 22 : 32, fontWeight: 300 }}>{reviewingDesigner.name}</Hl>
                  <Body style={{ fontSize: 12, marginTop: 4 }}>
                    {reviewingDesigner.category} · {reviewingDesigner.location} · {reviewingDesigner.email} · Applied {reviewingDesigner.appliedAt}
                  </Body>
                </div>
                <Btn variant="ghost" onClick={closeReviewModal}>✕ Close</Btn>
              </div>

              {/* Portfolio grid */}
              {reviewingDesigner.portfolioUrls.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
                  {reviewingDesigner.portfolioUrls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '4/5', background: S.surface, overflow: 'hidden', border: `1px solid ${S.border}` }}>
                      <img src={url} alt={`Sample ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ background: S.surface, border: `1px dashed ${S.border}`, padding: 32, textAlign: 'center', marginBottom: 24 }}>
                  <Body style={{ fontSize: 12, color: S.textFaint }}>No portfolio samples uploaded yet.</Body>
                </div>
              )}

              {/* ID document */}
              <div style={{ marginBottom: 24 }}>
                <Lbl style={{ marginBottom: 10 }}>Identity Document</Lbl>
                {reviewingDesigner.idUrl && !reviewingIdSignedUrl && (
                  <Body style={{ fontSize: 12, color: S.textMuted }}>Generating secure link…</Body>
                )}
                {reviewingIdSignedUrl ? (
                  <a href={reviewingIdSignedUrl} target="_blank" rel="noreferrer">
                    <img src={reviewingIdSignedUrl} alt="ID document" style={{ maxWidth: 360, width: '100%', border: `1px solid ${S.border}` }} />
                  </a>
                ) : !reviewingDesigner.idUrl ? (
                  <div style={{ background: 'rgba(220,85,85,0.07)', border: '1px solid rgba(220,85,85,0.25)', padding: '12px 16px' }}>
                    <Body style={{ fontSize: 12, color: S.danger }}>⚠ No ID document uploaded.</Body>
                  </div>
                ) : null}
              </div>

              {/* Decision area */}
              <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 20 }}>

                {/* Reject flow: show note field */}
                {reviewAction === 'reject' && (
                  <div style={{ marginBottom: 16 }}>
                    <Lbl style={{ marginBottom: 8 }}>Rejection reason (required)</Lbl>
                    <textarea
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                      placeholder="E.g. Portfolio samples are too low resolution. Please resubmit with higher quality work."
                      rows={3}
                      style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(220,85,85,0.35)`, borderRadius: 8, color: S.text, fontFamily: S.body, fontSize: 13, padding: '12px 14px', resize: 'vertical', outline: 'none' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {reviewAction === null && (
                    <>
                      <Btn variant="success" onClick={() => setReviewAction('approve')}>✓ Approve Designer</Btn>
                      <Btn variant="danger"  onClick={() => setReviewAction('reject')}>✕ Reject Application</Btn>
                    </>
                  )}
                  {reviewAction === 'approve' && (
                    <>
                      <Btn variant="success" onClick={() => { approveDesigner(reviewingDesigner.id); closeReviewModal() }}>
                        Confirm Approval
                      </Btn>
                      <Btn variant="ghost" onClick={() => setReviewAction(null)}>Back</Btn>
                    </>
                  )}
                  {reviewAction === 'reject' && (
                    <>
                      <Btn
                        variant="danger"
                        onClick={() => {
                          if (!rejectionNote.trim()) { addToast('error', 'Please enter a rejection reason.'); return }
                          rejectDesigner(reviewingDesigner.id, rejectionNote)
                          closeReviewModal()
                        }}
                      >
                        Confirm Rejection
                      </Btn>
                      <Btn variant="ghost" onClick={() => setReviewAction(null)}>Back</Btn>
                    </>
                  )}
                  <Btn variant="ghost" onClick={closeReviewModal}>Cancel</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, background: S.borderFaint, marginBottom: 24, overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button key={t.k} onClick={() => handleTabChange(t.k)} style={{ flex: 1, background: tab === t.k ? S.goldDim : S.surface, border: 'none', color: tab === t.k ? S.gold : S.textMuted, padding: '12px 8px', fontFamily: S.headline, fontSize: isMobile ? 8 : 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── APPLICATIONS ── */}
        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apps.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <Body style={{ fontSize: 13, color: S.textMuted }}>No pending applications</Body>
              </div>
            )}
            {apps.map((a) => (
              <div key={a.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '14px' : '16px 20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 14, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2a2a2a', border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {(a.name || 'NA').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Hl style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</Hl>
                  <Body style={{ fontSize: 11, marginBottom: 4 }}>{a.email} · {a.category} · Applied {a.appliedAt}</Body>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: a.idVerified ? S.success : S.danger, fontSize: 10, fontFamily: S.body }}>
                      ● {a.idVerified ? 'ID uploaded' : 'No ID'}
                    </span>
                    <span style={{ color: a.portfolioCount >= 3 ? S.success : S.textFaint, fontSize: 10, fontFamily: S.body }}>
                      📁 {a.portfolioCount} samples{a.portfolioCount < 3 ? ' (min 3)' : ''}
                    </span>
                    <span style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body }}>📍 {a.location}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn variant="gold" size="sm" onClick={() => openReviewModal(a)}>Review →</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DESIGNERS (approved) ── */}
        {tab === 'designers' && (
          <div>
            <div style={{ background: S.goldDim, border: `1px solid ${S.borderFaint}`, padding: '10px 16px', marginBottom: 16 }}>
              <Body style={{ fontSize: 11, color: S.textFaint }}>
                Manage all approved designers. Changing badge to <strong style={{ color: S.danger }}>suspended</strong> immediately hides the designer from the marketplace.
              </Body>
            </div>
            {!designersLoaded && <Body style={{ padding: '20px 0', fontSize: 12 }}>Loading designers…</Body>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveDesigners.map((d) => {
                const name    = d.profiles?.full_name || 'Unknown'
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const badgeColor = BADGE_COLORS[d.badge] || S.textFaint
                return (
                  <div key={d.id} style={{ background: S.surface, border: `1px solid ${d.public_visible ? S.border : 'rgba(239,68,68,0.3)'}`, padding: isMobile ? '12px' : '14px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2a1a', border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <Hl style={{ fontSize: 14, fontWeight: 600 }}>{name}</Hl>
                        <span style={{ fontSize: 9, fontFamily: S.body, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: badgeColor, background: `${badgeColor}18`, border: `1px solid ${badgeColor}35`, padding: '2px 8px', borderRadius: 4 }}>
                          {d.badge}
                        </span>
                        {!d.public_visible && (
                          <span style={{ fontSize: 9, fontFamily: S.body, color: S.danger, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: 4 }}>
                            Hidden
                          </span>
                        )}
                      </div>
                      <Body style={{ fontSize: 11 }}>{d.profiles?.email || '—'} · {d.category || 'Uncategorised'}</Body>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        value={d.badge}
                        onChange={e => updateDesignerBadge(d.id, e.target.value)}
                        style={{ background: S.bgLow, border: `1px solid ${S.border}`, color: S.text, fontFamily: S.body, fontSize: 11, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                )
              })}
              {designersLoaded && liveDesigners.length === 0 && (
                <Body style={{ textAlign: 'center', padding: '48px 0', fontSize: 12 }}>No approved designers yet.</Body>
              )}
            </div>
          </div>
        )}

        {/* ── DISPUTES ── */}
        {tab === 'disputes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {disputes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <Body style={{ fontSize: 13, color: S.textMuted }}>No open disputes</Body>
              </div>
            )}
            {disputes.map((d) => (
              <div key={d.id} style={{ background: S.surface, border: '1px solid rgba(255,180,171,0.2)', padding: isMobile ? '16px' : '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Hl style={{ fontSize: 16, fontWeight: 600 }}>{d.project}</Hl>
                    {d.evidence_requested && !d.new_response && (
                      <span style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24', fontSize: 9, fontFamily: S.body, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>
                        ⏳ Awaiting Evidence
                      </span>
                    )}
                    {d.new_response && (
                      <span onClick={() => setDisputes(prev => prev.map(x => x.id === d.id ? { ...x, new_response: false } : x))}
                        style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.35)', color: '#4ade80', fontSize: 9, fontFamily: S.body, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}>
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
                  <Btn variant="ghost" size="sm"
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

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveOrders.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <Btn variant="ghost" size="sm" onClick={() => exportOrdersCSV(liveOrders)}>↓ Export CSV</Btn>
              </div>
            )}
            {liveOrders.length === 0 && (
              <Body style={{ textAlign: 'center', padding: '60px 0', fontSize: 12 }}>No orders yet.</Body>
            )}
            {liveOrders.map((o) => {
              const statusColor = (STATUS_COLORS as any)[o.status] || S.gold
              return (
                <div key={o.id} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '12px' : '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <Hl style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{o.project}</Hl>
                    <Body style={{ fontSize: 11 }}>
                      {o.client} → {o.designer}
                      {o.rush && <span style={{ color: '#fcd34d' }}> · ⚡ Rush</span>}
                      {' · '}Revisions: {o.revisions.used}/{o.revisions.total}
                    </Body>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(o.amount)}</Hl>
                      <Body style={{ fontSize: 10 }}>Commission: {fmt(o.commission)}</Body>
                    </div>
                    <div style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40`, fontSize: 9, padding: '4px 10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: S.body, fontWeight: 700, borderRadius: 4 }}>
                      {(STATUS_LABELS as any)[o.status] || o.status}
                    </div>
                  </div>
                </div>
              )
            })}
            {liveOrders.length > 0 && (
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '12px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Body style={{ fontSize: 12 }}>Total platform commissions (last 50 orders)</Body>
                <Hl style={{ color: S.gold, fontSize: 20 }}>{fmt(liveOrders.reduce((s: number, o: any) => s + o.commission, 0))}</Hl>
              </div>
            )}
          </div>
        )}

        {/* ── FEATURED ── */}
        {tab === 'featured' && (
          <div>
            <div style={{ background: S.goldDim, border: `1px solid ${S.borderFaint}`, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Body style={{ fontSize: 11, color: S.textFaint }}>Featured designers appear at the top of the marketplace. Max 3 featured slots.</Body>
              <Body style={{ fontSize: 11, color: S.gold }}>{featuredDesigners.filter(d => d.featured).length} / 3 slots used</Body>
            </div>
            {featuredLoading && <Body style={{ padding: '20px 0', fontSize: 12 }}>Loading designers…</Body>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {featuredDesigners.map((d) => {
                const name    = d.profiles?.full_name || 'Unknown'
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div key={d.id} style={{ background: S.surface, border: `1px solid ${d.featured ? S.gold : S.border}`, padding: isMobile ? '12px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2a1a', border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 11, fontWeight: 700 }}>{initials}</div>
                      <div>
                        <Hl style={{ fontSize: 14, fontWeight: 600 }}>{name}</Hl>
                        <Body style={{ fontSize: 11 }}>{d.category || 'Uncategorised'}</Body>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      {d.featured && <Body style={{ fontSize: 11, color: S.gold }}>★ Featured</Body>}
                      <Btn variant={d.featured ? 'ghost' : 'outline'} size="sm" onClick={() => {
                        const count = featuredDesigners.filter(x => x.featured).length
                        if (!d.featured && count >= 3) { addToast('error', 'Max 3 featured slots. Remove one first.'); return }
                        toggleFeatured(d.id, d.featured)
                      }}>
                        {d.featured ? 'Remove' : '+ Feature'}
                      </Btn>
                    </div>
                  </div>
                )
              })}
              {!featuredLoading && featuredDesigners.length === 0 && (
                <Body style={{ textAlign: 'center', padding: '32px 0', fontSize: 12 }}>No approved designers yet.</Body>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: `1px solid ${S.borderFaint}`, textAlign: 'center' }}>
          <Body style={{ fontSize: 11, color: S.textFaint }}>
            Need technical support?{' '}
            <a href="mailto:hello@accracreativeshub.com" style={{ color: S.gold, textDecoration: 'none' }}>
              hello@accracreativeshub.com
            </a>
          </Body>
        </div>

      </div>
    </div>
  )
}
