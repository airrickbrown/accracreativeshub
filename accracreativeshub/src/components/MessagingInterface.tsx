// ── src/components/MessagingInterface.tsx ──

import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { S, pct, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Txt } from './UI'
import { ORDERS, MESSAGES_DATA, DESIGNERS } from '../data/mockData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import PresenceIndicator from './PresenceIndicator'
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '../lib/orderStatus'


interface Props { onClose: () => void; initialOrder?: any }

interface InputProps {
  value:        string
  uploading:    boolean
  view:         string
  onChange:     (v: string) => void
  onSend:       () => void
  onFileClick:  () => void
  fileRef:      React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isMobile:     boolean
}

const MessageInput = memo(({
  value, uploading, view, onChange, onSend, onFileClick, fileRef, onFileChange, isMobile,
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }, [onSend])

  const quickReplies = view === 'client'
    ? ['When will it be ready?', 'Looks great!', 'Can we revise the colours?']
    : ['Working on it now', 'File incoming', 'Revision received']

  return (
    <div style={{ background: S.bg, padding: isMobile ? '10px 12px' : '14px 24px', borderTop: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.zip"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onFileClick}
          disabled={uploading}
          title="Attach file"
          style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: uploading ? S.textFaint : S.textMuted, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'not-allowed' : 'pointer', borderRadius: 6, flexShrink: 0, fontSize: 16 }}
        >
          {uploading ? '⏳' : '📎'}
        </button>
        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={uploading ? 'Uploading…' : 'Type a message…'}
          disabled={uploading}
          autoComplete="off"
          autoCorrect="off"
          style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, color: S.text, padding: '11px 14px', fontFamily: S.body, fontSize: 16, outline: 'none', borderRadius: 6, minHeight: 40 }}
        />
        <Btn variant="gold" onClick={onSend} disabled={uploading || !value.trim()}>Send</Btn>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {quickReplies.map(r => (
          <button key={r} onClick={() => onChange(r)}
            style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textFaint, padding: '4px 10px', fontSize: 10, fontFamily: S.body, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}
          >{r}</button>
        ))}
      </div>
    </div>
  )
})

interface ListProps {
  orders: any[]; activeOrder: any; loading: boolean
  isMobile: boolean; onSelect: (o: any) => void
}

const ConversationList = memo(({ orders, activeOrder, loading, isMobile, onSelect }: ListProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
      <Hl style={{ fontSize: 18 }}>Conversations</Hl>
    </div>
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {loading && <Body style={{ padding: 20, fontSize: 12 }}>Loading…</Body>}
      {!loading && orders.map((o: any) => (
        <div
          key={o.id}
          onClick={() => onSelect(o)}
          style={{
            cursor: 'pointer',
            background: activeOrder?.id === o.id ? S.surface : 'none',
            borderBottom: `1px solid ${S.borderFaint}`,
            borderLeft: activeOrder?.id === o.id ? `3px solid ${S.gold}` : '3px solid transparent',
          }}
        >
          <div style={{ position: 'relative', overflow: 'hidden', height: isMobile ? 90 : 130 }}>
            <img src={o.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(70%)', opacity: 0.75 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.95),rgba(19,19,19,0.1))' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Hl style={{ fontSize: 13, fontWeight: 600 }}>{o.designer}</Hl>
              </div>
              <Body style={{ fontSize: 11, marginBottom: 2 }}>{o.project}</Body>
              <div style={{ color: ['delivered','completed'].includes(o.status) ? S.success : S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {String(o.status).replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

export default function MessagingInterface({ onClose, initialOrder }: Props) {
  const { user, isDesigner } = useAuth()
  const view = isDesigner ? 'designer' : 'client'

  const [orders, setOrders]               = useState<any[]>(ORDERS)
  const [ordersLoading, setOL]            = useState(true)
  const [activeOrder, setActiveOrder]     = useState<any>(ORDERS[0])
  const [msgs, setMsgs]                   = useState<any[]>(MESSAGES_DATA[ORDERS[0]?.id] || [])
  const [input, setInput]                 = useState('')
  const [ord, setOrd]                     = useState<any>({ ...ORDERS[0] })
  const [uploading, setUploading]         = useState(false)
  const [showReview, setShowReview]       = useState(false)
  const [showDispute, setShowDispute]     = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [reviewRating, setReviewRating]   = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [isMobile, setIsMobile]           = useState(false)
  const [mobileView, setMobileView]       = useState<'list' | 'chat'>('list')
  const [actionError, setActionError]     = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const revLeft = (ord?.revisions?.total ?? 3) - (ord?.revisions?.used ?? 0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fbDesigner = (id: any) => DESIGNERS.find((d: any) => String(d.id) === String(id)) || DESIGNERS[0]

  const normalizeOrder = useCallback((o: any) => {
    const fb = fbDesigner(o.designer_id)
    return {
      id:          o.id,
      client:      o.profiles?.full_name || o.client || 'Client',
      designer:    o.designers_profiles?.full_name || fb.name,
      designer_id: o.designer_id ?? o.designerObj?.id,
      designerObj: { id: o.designer_id, portrait: o.designerObj?.portrait || fb.portrait, category: o.designers?.category || fb.category, name: o.designers_profiles?.full_name || fb.name },
      project:     o.project_name || o.project || 'Design Project',
      amount:      o.amount || 0,
      commission:  o.commission ?? Math.round((o.amount || 0) * 0.1),
      status:      o.status || 'pending',
      revisions:   { used: o.revisions_used ?? o.revisions?.used ?? 0, total: o.revisions_total ?? o.revisions?.total ?? 3 },
      brief:       o.brief || '',
      rush:        !!o.rush,
      deadline:    o.deadline || 'Not set',
    }
  }, [])

  const mapMsg = useCallback((m: any) => ({
    id:       m.id,
    from:     m.sender_id === user?.id ? view : (view === 'client' ? 'designer' : 'client'),
    text:     m.content,
    time:     m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    type:     m.message_type || 'text',
    fileUrl:  m.file_url  || null,
    fileName: m.file_name || null,
  }), [user?.id, view])

  const loadOrders = useCallback(async () => {
    if (!user) { setOrders(ORDERS); setActiveOrder(ORDERS[0]); setOrd({ ...ORDERS[0] }); setOL(false); return }
    setOL(true)
    const { data, error } = await supabase.from('orders')
      .select('*, profiles:client_id(full_name), designers:designer_id(category)')
      .or(`client_id.eq.${user.id},designer_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error || !data?.length) {
      setOrders(ORDERS); setActiveOrder(ORDERS[0]); setOrd({ ...ORDERS[0] })
    } else {
      const mapped = data.map(normalizeOrder)
      setOrders(mapped)
      if (!initialOrder) { setActiveOrder(mapped[0]); setOrd(mapped[0]) }
    }
    setOL(false)
  }, [user?.id, normalizeOrder])

  const loadMessages = useCallback(async (orderId: any) => {
    const { data, error } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
    if (error || !data?.length) { setMsgs(MESSAGES_DATA[Number(orderId)] || []); return }
    setMsgs(data.map(mapMsg))
  }, [mapMsg])

  const sendMessage = useCallback(async (content: string, orderId: any, type = 'text', fileUrl?: string, fileName?: string) => {
    if (!user) { setActionError('Please log in to send messages.'); return }
    const { error } = await supabase.from('messages').insert({ order_id: orderId, sender_id: user.id, content, message_type: type, file_url: fileUrl || null, file_name: fileName || null })
    if (error) { console.error('Send error:', error); setActionError('Message failed to send. Check your connection.') }
  }, [user?.id])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendMessage(text, activeOrder?.id)
  }, [input, activeOrder?.id, sendMessage])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const path = `messages/${activeOrder.id}/${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('message-attachments').upload(path, file)
    if (uploadError) { setActionError('File upload failed: ' + uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('message-attachments').getPublicUrl(path)
    await sendMessage(file.type.startsWith('image/') ? `[Image: ${file.name}]` : `[File: ${file.name}]`, activeOrder.id, file.type.startsWith('image/') ? 'image' : 'file', urlData?.publicUrl, file.name)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }, [activeOrder?.id, user?.id, sendMessage])

  const selectOrder = useCallback((o: any) => {
    setActiveOrder(o); setOrd({ ...o })
    if (isMobile) setMobileView('chat')
  }, [isMobile])

  const approveAndRelease = useCallback(async () => {
    if (!user || isDesigner) { setActionError('Only the client can approve and release funds.'); return }
    const now = new Date().toISOString()
    const { error } = await supabase.from('orders')
      .update({ status: ORDER_STATUS.COMPLETED, approved_at: now, payout_status: 'pending_transfer' })
      .eq('id', activeOrder.id)
      .eq('client_id', user.id)
    if (error) { setActionError(error.message); return }
    setOrd((o: any) => ({ ...o, status: ORDER_STATUS.COMPLETED }))
    setOrders(prev => prev.map((o: any) =>
      o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.COMPLETED } : o
    ))
    setMsgs(m => [...m, {
      id: `sys-${Date.now()}`, from: 'system',
      text: 'Client approved the project. Payment has been queued for release to the designer.',
    }])
    setShowReview(true)
    setActionSuccess('Project approved. The designer will receive payment shortly.')
  }, [user?.id, isDesigner, activeOrder?.id])

  useEffect(() => { loadOrders() }, [user?.id])

  useEffect(() => {
    if (initialOrder) {
      const n = normalizeOrder(initialOrder)
      setActiveOrder(n); setOrd(n)
      if (isMobile) setMobileView('chat')
    }
  }, [initialOrder])

  useEffect(() => {
    if (!activeOrder?.id) return
    loadMessages(activeOrder.id)

    // ── FIX: typed payload parameter to remove implicit 'any' error ──
    const channel = supabase.channel(`msgs-${activeOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${activeOrder.id}` },
        (payload: { new: Record<string, unknown> }) =>
          setMsgs(prev => [...prev, mapMsg(payload.new)])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeOrder?.id, user?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const renderMessages = () => (
    <>
      {/* Brief summary */}
      <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '12px 16px', marginBottom: 8 }}>
        <Lbl style={{ marginBottom: 6 }}>Brief</Lbl>
        <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief || 'No brief provided.'}</Body>
      </div>

      {/* ── Designer: pending acceptance banner ── */}
      {view === 'designer' && ord.status === ORDER_STATUS.PENDING && (
        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 8, padding: '14px 16px', marginBottom: 8 }}>
          <Lbl style={{ marginBottom: 6, color: S.gold }}>New Brief Received</Lbl>
          <Body style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
            Review the project brief above and accept or decline. Only accept if you can deliver within the requested timeline.
          </Body>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="gold" size="sm" onClick={handleAcceptBrief} disabled={submitting}>✓ Accept Brief</Btn>
            <Btn variant="ghost" size="sm" onClick={handleDeclineBrief} disabled={submitting}
              style={{ borderColor: 'rgba(220,85,85,0.35)', color: S.danger }}>Decline</Btn>
          </div>
        </div>
      )}

      {/* ── Client: delivered — approval prompt ── */}
      {view === 'client' && ord.status === ORDER_STATUS.DELIVERED && (
        <div style={{ background: 'rgba(74,154,74,0.06)', border: '1px solid rgba(74,154,74,0.22)', borderRadius: 8, padding: '14px 16px', marginBottom: 8 }}>
          <Lbl style={{ marginBottom: 6, color: S.success }}>Project Delivered</Lbl>
          <Body style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
            The designer has marked this project as complete. Review the files in the chat and approve to release payment, or request a revision.
          </Body>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="success" size="sm" onClick={approveAndRelease} disabled={submitting}>✓ Approve & Release</Btn>
            <Btn variant="outline" size="sm" onClick={handleRequestRevision} disabled={revLeft === 0 || submitting}>Request Revision ({revLeft} left)</Btn>
          </div>
        </div>
      )}
      {msgs.map((m: any, i: number) => {
        const isMe = m.from === view
        if (m.from === 'system') return (
          <div key={m.id || i} style={{ textAlign: 'center', color: S.textFaint, fontSize: 9, fontFamily: S.body, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 0', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>{m.text}</div>
        )
        return (
          <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: isMe ? S.goldDim : S.surface, border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : S.borderFaint}`, padding: '10px 14px', maxWidth: isMobile ? '85%' : '70%', color: S.text, fontSize: 13, fontFamily: S.body, lineHeight: 1.6, wordBreak: 'break-word' }}>
              {m.type === 'image' && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer"><img src={m.fileUrl} alt="" style={{ maxWidth: '100%', maxHeight: 180, display: 'block' }} /></a>}
              {m.type === 'file'  && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: S.gold, textDecoration: 'none' }}>📎 {m.fileName}</a>}
              {m.type === 'text' && m.text}
            </div>
            <Body style={{ fontSize: 9, marginTop: 2, color: S.textFaint }}>{m.time}</Body>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </>
  )

  // ── Accept brief (designer flow, Upwork-style) ───────────────────────────
  const handleAcceptBrief = useCallback(async () => {
    setSubmitting(true)
    const { error } = await supabase.from('orders')
      .update({ status: ORDER_STATUS.IN_PROGRESS })
      .eq('id', activeOrder.id)
    if (error) { setActionError(error.message); setSubmitting(false); return }
    setOrd((o: any) => ({ ...o, status: ORDER_STATUS.IN_PROGRESS }))
    setOrders(prev => prev.map((o: any) =>
      o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.IN_PROGRESS } : o
    ))
    setMsgs(m => [...m, {
      id: `sys-${Date.now()}`, from: 'system',
      text: 'Brief accepted. Work has begun. The client has been notified.',
    }])
    setSubmitting(false)
  }, [activeOrder?.id])

  const handleDeclineBrief = useCallback(async () => {
    setSubmitting(true)
    const { error } = await supabase.from('orders')
      .update({ status: ORDER_STATUS.DECLINED })
      .eq('id', activeOrder.id)
    if (error) { setActionError(error.message); setSubmitting(false); return }
    setOrd((o: any) => ({ ...o, status: ORDER_STATUS.DECLINED }))
    setOrders(prev => prev.map((o: any) =>
      o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.DECLINED } : o
    ))
    setMsgs(m => [...m, {
      id: `sys-${Date.now()}`, from: 'system',
      text: 'Brief declined. The client has been notified and a refund will be processed.',
    }])
    setSubmitting(false)
  }, [activeOrder?.id])

  // ── Mark delivered (designer flow) ───────────────────────────────────────
  const handleMarkDelivered = useCallback(async () => {
    setSubmitting(true)
    const now = new Date().toISOString()
    const { error } = await supabase.from('orders')
      .update({ status: ORDER_STATUS.DELIVERED, delivered_at: now })
      .eq('id', activeOrder.id)
    if (error) { setActionError(error.message); setSubmitting(false); return }
    setOrd((o: any) => ({ ...o, status: ORDER_STATUS.DELIVERED }))
    setOrders(prev => prev.map((o: any) =>
      o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.DELIVERED } : o
    ))
    setMsgs(m => [...m, {
      id: `sys-${Date.now()}`, from: 'system',
      text: 'Project delivered. The client has 72 hours to approve or request revisions.',
    }])
    setSubmitting(false)
  }, [activeOrder?.id])

  // ── Request revision (client flow) ───────────────────────────────────────
  const handleRequestRevision = useCallback(async () => {
    if (revLeft <= 0) return
    setSubmitting(true)
    const newUsed = (ord.revisions?.used || 0) + 1
    const { error } = await supabase.from('orders')
      .update({ status: ORDER_STATUS.IN_PROGRESS, revisions_used: newUsed })
      .eq('id', activeOrder.id)
    if (error) { setActionError(error.message); setSubmitting(false); return }
    setOrd((o: any) => ({ ...o, status: ORDER_STATUS.IN_PROGRESS, revisions: { ...o.revisions, used: newUsed } }))
    setOrders(prev => prev.map((o: any) =>
      o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.IN_PROGRESS } : o
    ))
    setMsgs(m => [...m, {
      id: `sys-${Date.now()}`, from: 'system',
      text: `Revision ${newUsed} of ${ord.revisions?.total || 3} requested. Designer has been notified.`,
    }])
    setSubmitting(false)
  }, [activeOrder?.id, ord?.revisions, revLeft])

  const renderActionBar = () => {
    const statusColor = (STATUS_COLORS as any)[ord.status] || S.gold
    const statusLabel = (STATUS_LABELS as any)[ord.status] || ord.status

    return (
      <div style={{ background: S.surface, padding: isMobile ? '10px 12px' : '12px 24px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0, overflowX: 'auto' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', minWidth: isMobile ? 'max-content' : 'auto' }}>
          <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Project</Lbl><Hl style={{ fontSize: 12 }}>{ord.project}</Hl></div>
          <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Amount</Lbl><Hl style={{ color: S.gold, fontSize: 15 }}>{fmt(ord.amount)}</Hl></div>
          <div>
            <Lbl style={{ marginBottom: 2, fontSize: 8 }}>Status</Lbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
              <Hl style={{ color: statusColor, fontSize: 11 }}>{statusLabel}</Hl>
            </div>
          </div>
          <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Deadline</Lbl><Hl style={{ fontSize: 11 }}>{ord.deadline}</Hl></div>

          {/* ── Designer: Accept / Decline pending brief ── */}
          {view === 'designer' && ord.status === ORDER_STATUS.PENDING && (
            <>
              <Btn variant="gold" size="sm" onClick={handleAcceptBrief} disabled={submitting}>
                ✓ Accept Brief
              </Btn>
              <Btn variant="ghost" size="sm" onClick={handleDeclineBrief} disabled={submitting}
                style={{ borderColor: 'rgba(220,85,85,0.4)', color: S.danger }}>
                Decline
              </Btn>
            </>
          )}

          {/* ── Client: Request revision ── */}
          {view === 'client' && (ord.status === ORDER_STATUS.IN_PROGRESS || ord.status === ORDER_STATUS.DELIVERED) && (
            <Btn
              variant="outline" size="sm"
              disabled={revLeft === 0 || submitting}
              onClick={handleRequestRevision}
            >
              Revision ({revLeft} left)
            </Btn>
          )}

          {/* ── Client: Approve & Release ── */}
          {view === 'client' && ord.status === ORDER_STATUS.DELIVERED && (
            <Btn variant="success" size="sm" onClick={approveAndRelease} disabled={submitting}>
              ✓ Approve & Release
            </Btn>
          )}

          {/* ── Designer: Mark Delivered ── */}
          {view === 'designer' && ord.status === ORDER_STATUS.IN_PROGRESS && (
            <Btn variant="gold" size="sm" onClick={handleMarkDelivered} disabled={submitting}>
              Mark Delivered
            </Btn>
          )}

          {/* ── Client: Raise dispute ── */}
          {view === 'client' && (ord.status === ORDER_STATUS.IN_PROGRESS || ord.status === ORDER_STATUS.DELIVERED) && (
            <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
          )}
        </div>

        {/* Inline action error / success banners */}
        {actionError && (
          <div style={{ marginTop: 8, background: 'rgba(220,85,85,0.08)', border: '1px solid rgba(220,85,85,0.2)', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Body style={{ fontSize: 12, color: S.danger, margin: 0 }}>{actionError}</Body>
            <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', color: S.textFaint, cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
          </div>
        )}
        {actionSuccess && (
          <div style={{ marginTop: 8, background: 'rgba(74,154,74,0.08)', border: '1px solid rgba(74,154,74,0.2)', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Body style={{ fontSize: 12, color: S.success, margin: 0 }}>{actionSuccess}</Body>
            <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', color: S.textFaint, cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, display: 'flex', flexDirection: 'column' }}>

      {/* Review modal */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, width: '100%', maxWidth: 480, padding: 32 }}>
            <Hl style={{ fontSize: 22, marginBottom: 16 }}>Leave a Review</Hl>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: s <= reviewRating ? S.gold : S.textFaint }}>★</button>
              ))}
            </div>
            <Txt placeholder="Write a short review…" value={reviewComment} onChange={setReviewComment} rows={3} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setShowReview(false)} full>Skip</Btn>
              <Btn variant="gold" onClick={async () => {
                if (!reviewRating) { setActionError('Please select a star rating.'); return }
                setSubmitting(true)
                try {
                  // Guard: prevent duplicate review for same order
                  const { data: existing } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('order_id', activeOrder.id)
                    .maybeSingle()
                  if (existing) {
                    setShowReview(false)
                    setActionError('You have already reviewed this order.')
                    return
                  }
                  // 1. Insert review
                  await supabase.from('reviews').insert({
                    order_id:    activeOrder.id,
                    client_id:   user?.id,
                    designer_id: activeOrder.designer_id,
                    rating:      reviewRating,
                    comment:     reviewComment.trim() || null,
                  })
                  // 2. Recalculate designer's average rating
                  const { data: allRatings } = await supabase
                    .from('reviews')
                    .select('rating')
                    .eq('designer_id', activeOrder.designer_id)
                  if (allRatings && allRatings.length > 0) {
                    const avg = allRatings.reduce((s: number, r: any) => s + r.rating, 0) / allRatings.length
                    await supabase.from('designers').update({
                      rating_average: Math.round(avg * 10) / 10,
                      rating_count:   allRatings.length,
                    }).eq('id', activeOrder.designer_id)
                  }
                  setShowReview(false)
                  setActionSuccess('Review submitted. Thank you for your feedback.')
                } catch (err: any) {
                  setActionError('Failed to submit review. Please try again.')
                } finally {
                  setSubmitting(false)
                }
              }} full disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Dispute modal */}
      {showDispute && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 310, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: '1px solid rgba(239,68,68,0.3)', width: '100%', maxWidth: 440, padding: 32 }}>
            <Lbl style={{ color: S.danger, marginBottom: 12 }}>Raise a Dispute</Lbl>
            <Hl style={{ fontSize: 20, marginBottom: 16 }}>What went wrong?</Hl>
            <Txt placeholder="Describe the issue clearly…" value={disputeReason} onChange={setDisputeReason} rows={4} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Btn variant="ghost" onClick={() => setShowDispute(false)} full>Cancel</Btn>
              <Btn variant="danger" onClick={async () => {
                if (!disputeReason.trim()) { return }
                setSubmitting(true)
                try {
                  // 1. Create dispute record
                  await supabase.from('disputes').insert({
                    order_id:     activeOrder.id,
                    client:       user?.user_metadata?.full_name || user?.email || 'Client',
                    client_email: user?.email || '',
                    designer:     activeOrder.designer || '',
                    project:      activeOrder.project  || '',
                    amount:       activeOrder.amount   || 0,
                    reason:       disputeReason.trim(),
                    status:       'open',
                    raised:       new Date().toLocaleDateString('en-GB'),
                  })
                  // 2. Update order status to disputed
                  await supabase.from('orders')
                    .update({ status: ORDER_STATUS.DISPUTED })
                    .eq('id', activeOrder.id)
                  // 3. Reflect in UI
                  setOrd((o: any) => ({ ...o, status: ORDER_STATUS.DISPUTED }))
                  setOrders(prev => prev.map((o: any) =>
                    o.id === activeOrder.id ? { ...o, status: ORDER_STATUS.DISPUTED } : o
                  ))
                  setMsgs(m => [...m, {
                    id: `sys-${Date.now()}`, from: 'system',
                    text: `Dispute raised. Funds are frozen pending admin review. Our team will respond within 24–48 hours.`,
                  }])
                  setShowDispute(false)
                  setDisputeReason('')
                  setActionSuccess('Dispute submitted. Our team will review it within 24–48 hours.')
                } catch (err: any) {
                  setActionError('Failed to submit dispute. Please try again.')
                } finally {
                  setSubmitting(false)
                }
              }} full disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Dispute'}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: S.bg, padding: isMobile ? '12px 16px' : '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Hl style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em' }}>ACCRA CREATIVES HUB</Hl>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: S.gold, fontSize: 11, fontFamily: S.headline, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${S.gold}`, paddingBottom: 2 }}>Messages</span>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕{!isMobile && ' Close'}</Btn>
        </div>
      </div>

      {/* Layout */}
      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {mobileView === 'list' ? (
            <ConversationList orders={orders} activeOrder={activeOrder} loading={ordersLoading} isMobile={isMobile} onSelect={selectOrder} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ background: S.bg, padding: '12px 16px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button onClick={() => setMobileView('list')} style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, padding: '6px 10px', cursor: 'pointer', borderRadius: 6, fontSize: 9 }}>←</button>
                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={activeOrder?.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                </div>
                <Hl style={{ fontSize: 14, fontWeight: 600 }}>{activeOrder?.designer}</Hl>
              </div>
              {renderActionBar()}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderMessages()}
              </div>
              <MessageInput value={input} uploading={uploading} view={view} onChange={setInput} onSend={send} onFileClick={() => fileRef.current?.click()} fileRef={fileRef} onFileChange={handleFileChange} isMobile={isMobile} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ width: 280, borderRight: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <ConversationList orders={orders} activeOrder={activeOrder} loading={ordersLoading} isMobile={isMobile} onSelect={selectOrder} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${S.gold}40` }}>
                <img src={activeOrder?.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
              </div>
              <div>
                <Hl style={{ fontSize: 15, fontWeight: 600 }}>{activeOrder?.designer}</Hl>
                <Lbl style={{ marginBottom: 0, fontSize: 8 }}>{activeOrder?.designerObj?.category}</Lbl>
                <PresenceIndicator userId={activeOrder?.designer_id} showLabel style={{ marginTop: 4 }} />
              </div>
              <div style={{ marginLeft: 'auto', padding: '4px 10px', background: view === 'designer' ? 'rgba(201,168,76,0.08)' : 'rgba(74,154,74,0.08)', border: `1px solid ${view === 'designer' ? 'rgba(201,168,76,0.2)' : 'rgba(74,154,74,0.2)'}`, borderRadius: 6 }}>
                <Lbl style={{ margin: 0, fontSize: 8, color: view === 'designer' ? S.gold : S.success }}>
                  {view === 'designer' ? '◈ Designer' : '◉ Client'}
                </Lbl>
              </div>
            </div>
            {renderActionBar()}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {renderMessages()}
            </div>
            <MessageInput value={input} uploading={uploading} view={view} onChange={setInput} onSend={send} onFileClick={() => fileRef.current?.click()} fileRef={fileRef} onFileChange={handleFileChange} isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  )
}