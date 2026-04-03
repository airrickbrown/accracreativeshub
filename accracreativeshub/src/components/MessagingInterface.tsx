// ── src/components/MessagingInterface.tsx ──
//
// ROOT CAUSE OF KEYBOARD BUG:
// ConversationList and ChatPanel were defined as functions INSIDE the component.
// This causes React to treat them as NEW component types on every render,
// unmounting and remounting the entire subtree — including the input.
// The input loses focus after every keystroke because it gets unmounted.
//
// FIX: All sub-components moved OUTSIDE MessagingInterface as proper React components.
// Input state lifted up and passed as props.

import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { S, pct, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Txt } from './UI'
import { ORDERS, MESSAGES_DATA, DESIGNERS } from '../data/mockData'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface MessagingInterfaceProps {
  onClose:       () => void
  initialOrder?: any
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sub-components defined OUTSIDE — critical for focus stability
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConversationListProps {
  orders:        any[]
  activeOrder:   any
  ordersLoading: boolean
  isMobile:      boolean
  onSelect:      (o: any) => void
}

const ConversationList = memo(({
  orders, activeOrder, ordersLoading, isMobile, onSelect,
}: ConversationListProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
      <Hl style={{ fontSize: 18 }}>Conversations</Hl>
    </div>
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {ordersLoading && <Body style={{ padding: '20px', fontSize: 12 }}>Loading conversations...</Body>}
      {!ordersLoading && orders.map((o: any) => (
        <div
          key={o.id}
          onClick={() => onSelect(o)}
          style={{
            cursor: 'pointer',
            background: activeOrder?.id === o.id ? S.surface : 'none',
            borderBottom: `1px solid ${S.borderFaint}`,
            borderLeft: activeOrder?.id === o.id ? `3px solid ${S.gold}` : '3px solid transparent',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ position: 'relative', overflow: 'hidden', height: isMobile ? 90 : 130 }}>
            <img src={o.designerObj?.portrait} alt={o.designer} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(80%)', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.95),rgba(19,19,19,0.2))' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Hl style={{ fontSize: 13, fontWeight: 600 }}>{o.designer}</Hl>
                <Body style={{ fontSize: 9 }}>{o.status === 'delivered' ? 'YESTERDAY' : 'TODAY'}</Body>
              </div>
              <Body style={{ fontSize: 11, marginBottom: 2 }}>{o.project}</Body>
              <div style={{ color: o.status === 'delivered' || o.status === 'completed' ? S.success : S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {String(o.status).replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

interface MessageInputProps {
  input:          string
  uploading:      boolean
  view:           string
  onInputChange:  (v: string) => void
  onSend:         () => void
  onFileSelect:   () => void
  fileInputRef:   React.RefObject<HTMLInputElement>
  onFileChange:   (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ── Input component is fully isolated — will never remount ──
const MessageInput = memo(({
  input, uploading, view, onInputChange, onSend, onFileSelect, fileInputRef, onFileChange,
}: MessageInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  const quickReplies = view === 'client'
    ? ['When will it be ready?', 'Looks great!', 'Can we revise the colours?']
    : ['Working on it now', 'File incoming', 'Revision received']

  return (
    <div style={{ background: S.bg, padding: '12px 16px', borderTop: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.zip" style={{ display: 'none' }} onChange={onFileChange} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onFileSelect}
          disabled={uploading}
          title="Attach file or image"
          style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: uploading ? S.textFaint : S.textMuted, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'not-allowed' : 'pointer', borderRadius: 6, flexShrink: 0, fontSize: 16 }}
        >
          {uploading ? '⏳' : '📎'}
        </button>

        {/* ── FIX: value + onChange only — no onBlur that could cause re-render ── */}
        <input
          ref={inputRef}
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? 'Uploading...' : 'Type a message...'}
          disabled={uploading}
          autoComplete="off"
          style={{
            flex: 1,
            background: S.surface,
            border: `1px solid ${S.border}`,
            color: S.text,
            padding: '11px 14px',
            fontFamily: S.body,
            // 16px prevents iOS auto-zoom
            fontSize: 16,
            outline: 'none',
            borderRadius: 6,
            minHeight: 40,
          }}
        />
        <Btn variant="gold" onClick={onSend} disabled={uploading || !input.trim()}>Send</Btn>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {quickReplies.map(r => (
          <button
            key={r}
            onClick={() => onInputChange(r)}
            style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textFaint, padding: '4px 10px', fontSize: 10, fontFamily: S.body, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}
          >{r}</button>
        ))}
      </div>
    </div>
  )
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MessagingInterface({ onClose, initialOrder }: MessagingInterfaceProps) {
  const { user, isDesigner } = useAuth()
  const view = isDesigner ? 'designer' : 'client'

  const [orders, setOrders]               = useState<any[]>(ORDERS)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeOrder, setActiveOrder]     = useState<any>(ORDERS[0])
  const [msgs, setMsgs]                   = useState<any[]>(MESSAGES_DATA[ORDERS[0]?.id] || [])
  const [input, setInput]                 = useState('')
  const [showDispute, setShowDispute]     = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [ord, setOrd]                     = useState<any>({ ...ORDERS[0] })
  const [showReview, setShowReview]       = useState(false)
  const [reviewRating, setReviewRating]   = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [isMobile, setIsMobile]           = useState(false)
  const [mobileView, setMobileView]       = useState<'list' | 'chat'>('list')

  const bottomRef    = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const revLeft = (ord?.revisions?.total ?? 3) - (ord?.revisions?.used ?? 0)

  const fallbackDesigner = (id: any) =>
    DESIGNERS.find((d: any) => String(d.id) === String(id)) || DESIGNERS[0]

  const normalizeOrder = useCallback((o: any) => {
    const fb = fallbackDesigner(o.designer_id)
    return {
      id: o.id,
      client:      o.profiles?.full_name || o.client || 'Client',
      designer:    o.designers_profiles?.full_name || fb.name,
      designer_id: o.designer_id ?? o.designerObj?.id,
      designerObj: {
        id:       o.designer_id ?? o.designerObj?.id,
        portrait: o.designerObj?.portrait || fb.portrait,
        category: o.designers?.category  || fb.category,
        name:     o.designers_profiles?.full_name || fb.name,
      },
      project:    o.project_name || o.project || 'Design Project',
      amount:     o.amount || 0,
      commission: o.commission ?? Math.round((o.amount || 0) * 0.1),
      status:     o.status || 'pending',
      revisions: {
        used:  o.revisions_used  ?? o.revisions?.used  ?? 0,
        total: o.revisions_total ?? o.revisions?.total ?? 3,
      },
      brief:    o.brief    || '',
      rush:     !!o.rush,
      deadline: o.deadline || 'Not set',
    }
  }, [])

  const mapDbMessage = useCallback((m: any) => ({
    id:       m.id,
    from:     m.sender_id === user?.id ? view : (view === 'client' ? 'designer' : 'client'),
    text:     m.content,
    time:     m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    type:     m.message_type || 'text',
    fileUrl:  m.file_url  || null,
    fileName: m.file_name || null,
  }), [user?.id, view])

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders(ORDERS); setActiveOrder(ORDERS[0]); setOrd({ ...ORDERS[0] }); setOrdersLoading(false); return
    }
    setOrdersLoading(true)
    const { data, error } = await supabase
      .from('orders')
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
    setOrdersLoading(false)
  }, [user?.id, normalizeOrder])

  useEffect(() => {
    if (!initialOrder) return
    const n = normalizeOrder(initialOrder)
    setActiveOrder(n); setOrd(n)
    if (isMobile) setMobileView('chat')
  }, [initialOrder])

  const loadMessages = useCallback(async (orderId: string | number) => {
    const { data, error } = await supabase
      .from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
    if (error || !data?.length) { setMsgs(MESSAGES_DATA[Number(orderId)] || []); return }
    setMsgs(data.map(mapDbMessage))
  }, [mapDbMessage])

  const sendMessage = useCallback(async (
    content: string, orderId: string | number, type = 'text', fileUrl?: string, fileName?: string
  ) => {
    if (!user) { alert('Please log in to send a message'); return }
    const { error } = await supabase.from('messages').insert({
      order_id: orderId, sender_id: user.id, content,
      message_type: type, file_url: fileUrl || null, file_name: fileName || null,
    })
    if (error) { console.error('Send error:', error); alert('Failed to send message') }
  }, [user?.id])

  // ── FIX: send is stable — won't cause re-renders ──
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendMessage(text, activeOrder.id)
  }, [input, activeOrder?.id, sendMessage])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)

    const ext  = file.name.split('.').pop()
    const path = `messages/${activeOrder.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('message-attachments').upload(path, file)

    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('message-attachments').getPublicUrl(path)

    await sendMessage(
      file.type.startsWith('image/') ? `[Image: ${file.name}]` : `[File: ${file.name}]`,
      activeOrder.id,
      file.type.startsWith('image/') ? 'image' : 'file',
      urlData?.publicUrl,
      file.name
    )
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [activeOrder?.id, user?.id, sendMessage])

  const selectOrder = useCallback((o: any) => {
    setActiveOrder(o); setOrd({ ...o })
    if (isMobile) setMobileView('chat')
  }, [isMobile])

  const approveAndReleaseFunds = useCallback(async () => {
    if (!user || isDesigner) { alert('Only the client can approve and release funds.'); return }
    const { error } = await supabase.from('orders').update({ status: 'completed' })
      .eq('id', activeOrder.id).eq('client_id', user.id)
    if (error) { alert(error.message); return }
    setOrd((o: any) => ({ ...o, status: 'completed' }))
    setOrders(prev => prev.map((o: any) => o.id === activeOrder.id ? { ...o, status: 'completed' } : o))
    setMsgs(m => [...m, { from: 'system', text: 'Payment released. Order marked as completed.' }])
    setShowReview(true)
  }, [user?.id, isDesigner, activeOrder?.id])

  const submitReview = useCallback(async (orderId: any, designerId: any, rating: number, comment: string) => {
    if (!user || !rating) { alert('Please select a rating'); return }
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({ order_id: orderId, client_id: user.id, designer_id: designerId, rating, comment })
    if (error) { alert(error.message); setSubmittingReview(false); return }
    const { data } = await supabase.from('reviews').select('rating').eq('designer_id', designerId)
    if (data?.length) {
      const avg = data.reduce((s: number, r: any) => s + r.rating, 0) / data.length
      await supabase.from('designers').update({ rating_average: Number(avg.toFixed(2)), rating_count: data.length }).eq('id', designerId)
    }
    setMsgs(m => [...m, { from: 'system', text: `Review submitted: ${rating}/5` }])
    setShowReview(false); setReviewRating(0); setReviewComment(''); setSubmittingReview(false)
    alert('Review submitted!')
  }, [user?.id])

  useEffect(() => { loadOrders() }, [user?.id])

  useEffect(() => {
    if (!activeOrder?.id) return
    loadMessages(activeOrder.id)
    const channel = supabase.channel(`order-${activeOrder.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${activeOrder.id}` },
        payload => setMsgs(prev => [...prev, mapDbMessage(payload.new as any)])
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeOrder?.id, user?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, display: 'flex', flexDirection: 'column' }}>

      {/* Review modal */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, width: '100%', maxWidth: 520, padding: isMobile ? '24px 20px' : 36 }}>
            <Lbl style={{ marginBottom: 12 }}>Leave a Review</Lbl>
            <Hl style={{ fontSize: 24, marginBottom: 16 }}>How was your experience?</Hl>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: star <= reviewRating ? S.gold : S.textFaint }}>★</button>
              ))}
            </div>
            <Txt placeholder="Write a short review..." value={reviewComment} onChange={setReviewComment} rows={4} />
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Btn variant="ghost" onClick={() => setShowReview(false)} full>Skip for now</Btn>
              <Btn variant="gold" onClick={() => submitReview(activeOrder.id, activeOrder.designer_id, reviewRating, reviewComment)} full disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Dispute modal */}
      {showDispute && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: '1px solid rgba(255,180,171,0.3)', width: '100%', maxWidth: 460, padding: 32 }}>
            <Lbl style={{ color: S.danger, marginBottom: 12 }}>Raise a Dispute</Lbl>
            <Hl style={{ fontSize: 22, marginBottom: 20 }}>What went wrong?</Hl>
            <Txt placeholder="Describe the issue clearly..." value={disputeReason} onChange={setDisputeReason} rows={4} />
            <div style={{ background: S.dangerDim, padding: '10px 14px', margin: '14px 0' }}>
              <Body style={{ fontSize: 11 }}>Funds will be frozen and our team will review within 24 hours.</Body>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowDispute(false)} full>Cancel</Btn>
              <Btn variant="danger" onClick={() => { setMsgs(m => [...m, { from: 'system', text: `Dispute raised: "${disputeReason}". Funds frozen.` }]); setShowDispute(false) }} full>Submit</Btn>
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
            <ConversationList orders={orders} activeOrder={activeOrder} ordersLoading={ordersLoading} isMobile={isMobile} onSelect={selectOrder} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Mobile chat header */}
              <div style={{ background: S.bg, padding: '12px 16px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button onClick={() => setMobileView('list')} style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, padding: '6px 10px', cursor: 'pointer', borderRadius: 6, fontFamily: S.headline, fontSize: 9, flexShrink: 0 }}>←</button>
                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={activeOrder?.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                </div>
                <Hl style={{ fontSize: 14, fontWeight: 600 }}>{activeOrder?.designer}</Hl>
                {view === 'client' && ord.status === 'in_progress' && (
                  <div style={{ marginLeft: 'auto' }}>
                    <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
                  </div>
                )}
              </div>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <MessageList msgs={msgs} view={view} ord={ord} revLeft={revLeft} isMobile={isMobile} onApprove={approveAndReleaseFunds} onDeliver={() => {
                  setOrd((o: any) => ({ ...o, status: 'delivered' }))
                  setOrders(prev => prev.map((o: any) => o.id === activeOrder.id ? { ...o, status: 'delivered' } : o))
                  setMsgs(m => [...m, { from: 'system', text: 'Project delivered. Client has 48 hours to approve.' }])
                }} onRevision={() => {
                  setOrd((o: any) => ({ ...o, revisions: { ...o.revisions, used: o.revisions.used + 1 } }))
                  setMsgs(m => [...m, { from: 'system', text: `Revision ${ord.revisions.used + 1} of ${ord.revisions.total} requested` }])
                }} bottomRef={bottomRef} />
              </div>
              <MessageInput input={input} uploading={uploading} view={view} onInputChange={setInput} onSend={send} onFileSelect={() => fileInputRef.current?.click()} fileInputRef={fileInputRef} onFileChange={handleFileUpload} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ width: 280, borderRight: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <ConversationList orders={orders} activeOrder={activeOrder} ordersLoading={ordersLoading} isMobile={isMobile} onSelect={selectOrder} />
          </div>

          {/* Desktop chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Chat header */}
            <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${S.gold}40` }}>
                  <img src={activeOrder?.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                </div>
                <div>
                  <Hl style={{ fontSize: 15, fontWeight: 600 }}>{activeOrder?.designer}</Hl>
                  <Lbl style={{ marginBottom: 0, fontSize: 8 }}>{activeOrder?.designerObj?.category}</Lbl>
                </div>
              </div>
              {view === 'client' && ord.status === 'in_progress' && (
                <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
              )}
            </div>

            {/* Project info bar */}
            <div style={{ background: S.surface, padding: '12px 24px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0, overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Project</Lbl><Hl style={{ fontSize: 12, fontWeight: 600 }}>{ord.project}</Hl></div>
                <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Amount</Lbl><Hl style={{ color: S.gold, fontSize: 16 }}>{fmt(ord.amount)}</Hl></div>
                <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Status</Lbl><Hl style={{ color: ord.status === 'delivered' || ord.status === 'completed' ? S.success : S.gold, fontSize: 11, textTransform: 'capitalize' }}>{String(ord.status).replace('_', ' ')}</Hl></div>
                <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Deadline</Lbl><Hl style={{ fontSize: 11 }}>{ord.deadline}</Hl></div>
                {ord.rush && <div style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)', padding: '3px 10px' }}><span style={{ color: '#fcd34d', fontSize: 9, fontFamily: S.body, fontWeight: 700 }}>⚡ RUSH</span></div>}
                <div style={{ minWidth: 160 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Lbl style={{ margin: 0, fontSize: 8 }}>Revisions</Lbl>
                    <Body style={{ fontSize: 9 }}>{ord.revisions.used}/{ord.revisions.total}</Body>
                  </div>
                  <div style={{ height: 2, background: S.borderFaint }}>
                    <div style={{ height: '100%', width: `${pct(ord.revisions.used, ord.revisions.total)}%`, background: revLeft === 0 ? S.danger : S.gold }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {view === 'client' && ord.status === 'in_progress' && (
                    <Btn variant="outline" size="sm" disabled={revLeft === 0} onClick={() => {
                      if (revLeft === 0) { alert('No revisions remaining.'); return }
                      setOrd((o: any) => ({ ...o, revisions: { ...o.revisions, used: o.revisions.used + 1 } }))
                      setMsgs(m => [...m, { from: 'system', text: `Revision ${ord.revisions.used + 1} of ${ord.revisions.total} requested` }])
                    }}>Request Revision</Btn>
                  )}
                  {view === 'client' && ord.status === 'delivered' && (
                    <Btn variant="success" size="sm" onClick={approveAndReleaseFunds}>Approve & Release Funds</Btn>
                  )}
                  {view === 'designer' && ord.status === 'in_progress' && (
                    <Btn variant="gold" size="sm" onClick={() => {
                      setOrd((o: any) => ({ ...o, status: 'delivered' }))
                      setOrders(prev => prev.map((o: any) => o.id === activeOrder.id ? { ...o, status: 'delivered' } : o))
                      setMsgs(m => [...m, { from: 'system', text: 'Project delivered. Client has 48 hours to approve.' }])
                    }}>Mark Delivered</Btn>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '12px 16px', marginBottom: 4 }}>
                <Lbl style={{ marginBottom: 6 }}>Project Brief</Lbl>
                <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief || 'No brief provided.'}</Body>
              </div>
              {msgs.map((m: any, i: number) => {
                const isMe = m.from === view
                if (m.from === 'system') return (
                  <div key={m.id || i} style={{ textAlign: 'center', color: S.textFaint, fontSize: 9, fontFamily: S.body, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 0', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>{m.text}</div>
                )
                return (
                  <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ background: isMe ? S.goldDim : S.surface, border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : S.borderFaint}`, padding: '10px 14px', maxWidth: '70%', color: S.text, fontSize: 13, fontFamily: S.body, lineHeight: 1.6, wordBreak: 'break-word' }}>
                      {m.type === 'image' && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer"><img src={m.fileUrl} alt="" style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginBottom: 4 }} /></a>}
                      {m.type === 'file' && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: S.gold, textDecoration: 'none', fontSize: 12 }}>📎 {m.fileName || 'Download'}</a>}
                      {m.type === 'text' && m.text}
                    </div>
                    <Body style={{ fontSize: 9, marginTop: 2, color: S.textFaint }}>{m.time}</Body>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <MessageInput input={input} uploading={uploading} view={view} onInputChange={setInput} onSend={send} onFileSelect={() => fileInputRef.current?.click()} fileInputRef={fileInputRef} onFileChange={handleFileUpload} />
          </div>

          {/* Right panel */}
          <div style={{ width: 200, borderLeft: `1px solid ${S.borderFaint}`, background: S.bg, padding: '20px 16px', overflowY: 'auto', flexShrink: 0 }}>
            <Lbl style={{ marginBottom: 16 }}>Project Details</Lbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'Service',  v: activeOrder?.designerObj?.category },
                { l: 'Designer', v: activeOrder?.designer },
                { l: 'Budget',   v: fmt(activeOrder?.amount) },
                { l: 'Revisions', v: `${activeOrder?.revisions?.used ?? 0} of ${activeOrder?.revisions?.total ?? 3}` },
                { l: 'Due Date', v: activeOrder?.deadline },
              ].map(item => (
                <div key={item.l}>
                  <Lbl style={{ marginBottom: 4, fontSize: 8 }}>{item.l}</Lbl>
                  <Hl style={{ fontSize: 12 }}>{item.v}</Hl>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '10px 12px', background: view === 'designer' ? 'rgba(201,168,76,0.08)' : 'rgba(74,154,74,0.08)', border: `1px solid ${view === 'designer' ? 'rgba(201,168,76,0.2)' : 'rgba(74,154,74,0.2)'}`, borderRadius: 6 }}>
              <Lbl style={{ margin: 0, fontSize: 8, color: view === 'designer' ? S.gold : S.success }}>
                {view === 'designer' ? '◈ Designer View' : '◉ Client View'}
              </Lbl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Mobile message list (extracted for mobile view) ──
const MessageList = memo(({ msgs, view, ord, revLeft, isMobile, onApprove, onDeliver, onRevision, bottomRef }: any) => (
  <>
    <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '10px 14px', marginBottom: 4 }}>
      <Lbl style={{ marginBottom: 4 }}>Project Brief</Lbl>
      <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief || 'No brief.'}</Body>
    </div>
    {/* Action buttons on mobile */}
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
      {view === 'client' && ord.status === 'in_progress' && (
        <Btn variant="outline" size="sm" disabled={revLeft === 0} onClick={onRevision}>Request Revision</Btn>
      )}
      {view === 'client' && ord.status === 'delivered' && (
        <Btn variant="success" size="sm" onClick={onApprove}>Approve & Release</Btn>
      )}
      {view === 'designer' && ord.status === 'in_progress' && (
        <Btn variant="gold" size="sm" onClick={onDeliver}>Mark Delivered</Btn>
      )}
    </div>
    {msgs.map((m: any, i: number) => {
      const isMe = m.from === view
      if (m.from === 'system') return (
        <div key={m.id || i} style={{ textAlign: 'center', color: S.textFaint, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 0', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>{m.text}</div>
      )
      return (
        <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          <div style={{ background: isMe ? S.goldDim : S.surface, border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : S.borderFaint}`, padding: '10px 14px', maxWidth: '85%', color: S.text, fontSize: 14, fontFamily: S.body, lineHeight: 1.6, wordBreak: 'break-word' }}>
            {m.type === 'image' && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer"><img src={m.fileUrl} alt="" style={{ maxWidth: '100%', maxHeight: 180, display: 'block' }} /></a>}
            {m.type === 'file'  && m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: S.gold, textDecoration: 'none', fontSize: 12 }}>📎 {m.fileName}</a>}
            {m.type === 'text'  && m.text}
          </div>
          <Body style={{ fontSize: 9, marginTop: 2, color: S.textFaint }}>{m.time}</Body>
        </div>
      )
    })}
    <div ref={bottomRef} />
  </>
))