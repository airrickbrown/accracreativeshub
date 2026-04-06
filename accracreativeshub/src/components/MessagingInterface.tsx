// ── src/components/MessagingInterface.tsx ──
//
// KEYBOARD BUG FIX:
// Root cause: MessageInput was defined as a function INSIDE MessagingInterface.
// Every time any state changed (even typing a character), React saw a new
// component type, unmounted the old input, mounted a new one = keyboard closes.
//
// Fix: MessageInput is defined OUTSIDE the main component with React.memo()
// and all callbacks are stable via useCallback().
//
// REAL-TIME: Yes — uses Supabase Realtime (postgres_changes subscription).
// Messages appear instantly for both client and designer without refresh.

import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { S, pct, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Txt } from './UI'
import { ORDERS, MESSAGES_DATA, DESIGNERS } from '../data/mockData'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface Props { onClose: () => void; initialOrder?: any }

// ─────────────────────────────────────────────────────────────
// MessageInput — MUST be defined outside MessagingInterface
// so React never treats it as a new component type on re-renders
// ─────────────────────────────────────────────────────────────
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

  // Stable keydown handler
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

        {/* 
          KEY: value + onChange only.
          No onBlur that could trigger state changes → no re-render → no keyboard close.
          16px font-size prevents iOS auto-zoom.
        */}
        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={uploading ? 'Uploading…' : 'Type a message…'}
          disabled={uploading}
          autoComplete="off"
          autoCorrect="off"
          style={{
            flex: 1,
            background: S.surface,
            border: `1px solid ${S.border}`,
            color: S.text,
            padding: '11px 14px',
            fontFamily: S.body,
            fontSize: 16,
            outline: 'none',
            borderRadius: 6,
            minHeight: 40,
          }}
        />
        <Btn variant="gold" onClick={onSend} disabled={uploading || !value.trim()}>Send</Btn>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {quickReplies.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textFaint, padding: '4px 10px', fontSize: 10, fontFamily: S.body, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}
          >{r}</button>
        ))}
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────
// ConversationList — also outside to prevent remount
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function MessagingInterface({ onClose, initialOrder }: Props) {
  const { user, isDesigner } = useAuth()
  // view is derived from role — NOT a toggle — so it never changes on re-render
  const view = isDesigner ? 'designer' : 'client'

  const [orders, setOrders]         = useState<any[]>(ORDERS)
  const [ordersLoading, setOL]      = useState(true)
  const [activeOrder, setActiveOrder] = useState<any>(ORDERS[0])
  const [msgs, setMsgs]             = useState<any[]>(MESSAGES_DATA[ORDERS[0]?.id] || [])
  const [input, setInput]           = useState('')
  const [ord, setOrd]               = useState<any>({ ...ORDERS[0] })
  const [uploading, setUploading]   = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [reviewRating, setReviewRating]   = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const bottomRef  = useRef<HTMLDivElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

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
      id: o.id,
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
    id:   m.id,
    from: m.sender_id === user?.id ? view : (view === 'client' ? 'designer' : 'client'),
    text: m.content,
    time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    type: m.message_type || 'text',
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
    if (!user) { alert('Please log in to send messages'); return }
    const { error } = await supabase.from('messages').insert({ order_id: orderId, sender_id: user.id, content, message_type: type, file_url: fileUrl || null, file_name: fileName || null })
    if (error) { console.error('Send error:', error); alert('Failed to send') }
  }, [user?.id])

  // Stable send — won't cause input to lose focus
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    setInput('')   // clear first, then send — no async delay causes focus loss
    await sendMessage(text, activeOrder?.id)
  }, [input, activeOrder?.id, sendMessage])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const path = `messages/${activeOrder.id}/${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('message-attachments').upload(path, file)
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploading(false); return }
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
    if (!user || isDesigner) { alert('Only the client can approve and release funds.'); return }
    const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', activeOrder.id).eq('client_id', user.id)
    if (error) { alert(error.message); return }
    setOrd((o: any) => ({ ...o, status: 'completed' }))
    setOrders(prev => prev.map((o: any) => o.id === activeOrder.id ? { ...o, status: 'completed' } : o))
    setMsgs(m => [...m, { from: 'system', text: 'Payment released. Order completed.' }])
    setShowReview(true)
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

    // Real-time subscription — messages appear instantly
    const channel = supabase.channel(`msgs-${activeOrder.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${activeOrder.id}` },
        payload => setMsgs(prev => [...prev, mapMsg(payload.new as any)])
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeOrder?.id, user?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const renderMessages = () => (
    <>
      <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '12px 16px', marginBottom: 8 }}>
        <Lbl style={{ marginBottom: 6 }}>Brief</Lbl>
        <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief || 'No brief provided.'}</Body>
      </div>

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

  const renderActionBar = () => (
    <div style={{ background: S.surface, padding: isMobile ? '10px 12px' : '12px 24px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0, overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', minWidth: isMobile ? 'max-content' : 'auto' }}>
        <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Project</Lbl><Hl style={{ fontSize: 12 }}>{ord.project}</Hl></div>
        <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Amount</Lbl><Hl style={{ color: S.gold, fontSize: 15 }}>{fmt(ord.amount)}</Hl></div>
        <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Status</Lbl><Hl style={{ color: ['delivered','completed'].includes(ord.status) ? S.success : S.gold, fontSize: 11, textTransform: 'capitalize' }}>{String(ord.status).replace('_', ' ')}</Hl></div>
        <div><Lbl style={{ marginBottom: 2, fontSize: 8 }}>Deadline</Lbl><Hl style={{ fontSize: 11 }}>{ord.deadline}</Hl></div>

        {/* Action buttons — role-gated */}
        {view === 'client' && ord.status === 'in_progress' && (
          <Btn variant="outline" size="sm" disabled={revLeft === 0} onClick={() => {
            setOrd((o: any) => ({ ...o, revisions: { ...o.revisions, used: o.revisions.used + 1 } }))
            setMsgs(m => [...m, { from: 'system', text: `Revision ${ord.revisions.used + 1} of ${ord.revisions.total} requested` }])
          }}>Revision ({revLeft} left)</Btn>
        )}
        {view === 'client' && ord.status === 'delivered' && (
          <Btn variant="success" size="sm" onClick={approveAndRelease}>Approve & Release</Btn>
        )}
        {view === 'designer' && ord.status === 'in_progress' && (
          <Btn variant="gold" size="sm" onClick={() => {
            setOrd((o: any) => ({ ...o, status: 'delivered' }))
            setOrders(prev => prev.map((o: any) => o.id === activeOrder.id ? { ...o, status: 'delivered' } : o))
            setMsgs(m => [...m, { from: 'system', text: 'Project delivered. Client has 48 hours to approve.' }])
          }}>Mark Delivered</Btn>
        )}
        {view === 'client' && ord.status === 'in_progress' && (
          <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, display: 'flex', flexDirection: 'column' }}>

      {/* Review modal */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, width: '100%', maxWidth: 480, padding: 32 }}>
            <Hl style={{ fontSize: 22, marginBottom: 16 }}>Leave a Review</Hl>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: s <= reviewRating ? S.gold : S.textFaint }}>★</button>)}
            </div>
            <Txt placeholder="Write a short review…" value={reviewComment} onChange={setReviewComment} rows={3} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setShowReview(false)} full>Skip</Btn>
              <Btn variant="gold" onClick={async () => {
                if (!reviewRating) { alert('Please select a rating'); return }
                setSubmitting(true)
                await supabase.from('reviews').insert({ order_id: activeOrder.id, client_id: user?.id, designer_id: activeOrder.designer_id, rating: reviewRating, comment: reviewComment })
                setShowReview(false); setSubmitting(false); alert('Review submitted!')
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
          {/* Sidebar */}
          <div style={{ width: 280, borderRight: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <ConversationList orders={orders} activeOrder={activeOrder} loading={ordersLoading} isMobile={isMobile} onSelect={selectOrder} />
          </div>

          {/* Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${S.gold}40` }}>
                <img src={activeOrder?.designerObj?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
              </div>
              <div>
                <Hl style={{ fontSize: 15, fontWeight: 600 }}>{activeOrder?.designer}</Hl>
                <Lbl style={{ marginBottom: 0, fontSize: 8 }}>{activeOrder?.designerObj?.category}</Lbl>
              </div>
              {/* Role indicator */}
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