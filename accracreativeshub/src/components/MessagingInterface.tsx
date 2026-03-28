// ── MESSAGING / CHAT COMPONENT ──
// Full messaging interface between client and designer.
// Features: conversation list, revision tracker, dispute button,
// approve & release funds, review submission.

import React, { useState, useRef, useEffect } from 'react'
import { S, pct, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Txt } from './UI'
import { ORDERS, MESSAGES_DATA, DESIGNERS } from '../data/mockData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface MessagingInterfaceProps {
  onClose: () => void
  initialOrder?: any
}

export default function MessagingInterface({
  onClose,
  initialOrder,
}: MessagingInterfaceProps) {
  const { user } = useAuth()

  const [orders, setOrders] = useState<any[]>(ORDERS)
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [activeOrder, setActiveOrder] = useState<any>(ORDERS[0])
  const [msgs, setMsgs] = useState<any[]>(MESSAGES_DATA[ORDERS[0].id] || [])
  const [input, setInput] = useState('')
  const [view, setView] = useState('client')
  const [showDispute, setShowDispute] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [ord, setOrd] = useState<any>({ ...ORDERS[0] })

  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const revLeft = ord?.revisions?.total - ord?.revisions?.used || 0

  const fallbackDesignerFromId = (designerId: any) => {
    return (
      DESIGNERS.find((d: any) => String(d.id) === String(designerId)) || DESIGNERS[0]
    )
  }

  const normalizeOrder = (o: any) => {
    const fallbackDesigner = fallbackDesignerFromId(o.designer_id)

    return {
      id: o.id,
      client: o.profiles?.full_name || o.client || 'Client',
      designer: o.designers_profiles?.full_name || fallbackDesigner.name || 'Designer',
      designer_id: o.designer_id ?? o.designerObj?.id ?? o.designerId,
      designerObj: {
        id: o.designer_id ?? o.designerObj?.id ?? o.designerId,
        portrait: o.designerObj?.portrait || fallbackDesigner.portrait,
        category: o.designers?.category || o.designerObj?.category || fallbackDesigner.category,
        name: o.designers_profiles?.full_name || o.designerObj?.name || fallbackDesigner.name,
      },
      project: o.project_name || o.project || 'Design Project',
      amount: o.amount || 0,
      commission: o.commission ?? Math.round((o.amount || 0) * 0.1),
      status: o.status || 'pending',
      revisions: {
        used: o.revisions_used ?? o.revisions?.used ?? 0,
        total: o.revisions_total ?? o.revisions?.total ?? 3,
      },
      brief: o.brief || '',
      rush: !!o.rush,
      deadline: o.deadline || 'Not set',
    }
  }

  const loadOrders = async () => {
    if (!user) {
      setOrders(ORDERS)
      setActiveOrder(ORDERS[0])
      setOrd({ ...ORDERS[0] })
      setOrdersLoading(false)
      return
    }

    setOrdersLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:client_id (
          full_name
        ),
        designers:designer_id (
          category
        )
      `)
      .or(`client_id.eq.${user.id},designer_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
      setOrders(ORDERS)
      setActiveOrder(ORDERS[0])
      setOrd({ ...ORDERS[0] })
      setOrdersLoading(false)
      return
    }

    if (data && data.length > 0) {
      const mapped = data.map((o: any) => normalizeOrder(o))
      setOrders(mapped)

      if (!initialOrder) {
        setActiveOrder(mapped[0])
        setOrd(mapped[0])
      }
    } else {
      setOrders(ORDERS)

      if (!initialOrder) {
        setActiveOrder(ORDERS[0])
        setOrd({ ...ORDERS[0] })
      }
    }

    setOrdersLoading(false)
  }

  useEffect(() => {
    if (!initialOrder) return

    const normalized = normalizeOrder(initialOrder)
    setActiveOrder(normalized)
    setOrd(normalized)
  }, [initialOrder])

  const mapDbMessage = (m: any) => {
    const from =
      m.sender_id === user?.id
        ? view
        : view === 'client'
          ? 'designer'
          : 'client'

    return {
      id: m.id,
      from,
      text: m.content,
      time: m.created_at
        ? new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Just now',
    }
  }

  const loadMessages = async (orderId: string | number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      setMsgs(MESSAGES_DATA[Number(orderId)] || [])
      return
    }

    if (data && data.length > 0) {
      setMsgs(data.map(mapDbMessage))
    } else {
      setMsgs(MESSAGES_DATA[Number(orderId)] || [])
    }
  }

  const sendMessage = async (content: string, orderId: string | number) => {
    if (!user) {
      alert('Please log in to send a message')
      return
    }

    const clean = content.trim()
    if (!clean) return

    const { error } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: user.id,
      content: clean,
    })

    if (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  const send = async () => {
    if (!input.trim()) return
    await sendMessage(input, activeOrder.id)
    setInput('')
  }

  const submitReview = async (
    orderId: string | number,
    designerId: string | number,
    rating: number,
    comment: string
  ) => {
    if (!user) {
      alert('Please log in to submit a review')
      return
    }

    if (!rating) {
      alert('Please select a rating')
      return
    }

    setSubmittingReview(true)

    const { error: insertError } = await supabase.from('reviews').insert({
      order_id: orderId,
      client_id: user.id,
      designer_id: designerId,
      rating,
      comment,
    })

    if (insertError) {
      console.error('Review insert error:', insertError)
      alert(insertError.message || 'Failed to submit review')
      setSubmittingReview(false)
      return
    }

    const { data, error: ratingsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('designer_id', designerId)

    if (ratingsError) {
      console.error('Ratings fetch error:', ratingsError)
      alert('Review saved, but rating summary update failed')
      setSubmittingReview(false)
      return
    }

    if (data && data.length > 0) {
      const avg =
        data.reduce((sum: number, row: any) => sum + row.rating, 0) / data.length

      const { error: updateError } = await supabase
        .from('designers')
        .update({
          rating_average: Number(avg.toFixed(2)),
          rating_count: data.length,
        })
        .eq('id', designerId)

      if (updateError) {
        console.error('Designer rating update error:', updateError)
      }
    }

    setMsgs((m: any) => [
      ...m,
      {
        from: 'system',
        text: `Review submitted: ${rating}/5`,
      },
    ])

    setShowReview(false)
    setReviewRating(0)
    setReviewComment('')
    setSubmittingReview(false)

    alert('Review submitted successfully!')
  }

  const approveAndReleaseFunds = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
      })
      .eq('id', activeOrder.id)
      .eq('client_id', user.id)

    if (error) {
      console.error('Approve flow error:', error)
      alert(error.message || 'Failed to complete order. Please try again.')
      return
    }

    setOrd((o: any) => ({ ...o, status: 'completed' }))
    setOrders((prev: any[]) =>
      prev.map((o: any) =>
        o.id === activeOrder.id ? { ...o, status: 'completed' } : o
      )
    )
    setMsgs((m: any) => [
      ...m,
      {
        from: 'system',
        text: 'Payment released. Order marked as completed.',
      },
    ])

    setShowReview(true)
  }

  useEffect(() => {
    loadOrders()
  }, [user?.id, initialOrder])

  useEffect(() => {
    if (!activeOrder?.id) return

    loadMessages(activeOrder.id)

    const channel = supabase
      .channel(`order-${activeOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${activeOrder.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any
          setMsgs((prev) => [...prev, mapDbMessage(newMsg)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeOrder?.id, user?.id, view])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, display: 'flex', flexDirection: 'column' }}>
      {showReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 320,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              width: '100%',
              maxWidth: 520,
              padding: 36,
            }}
          >
            <Lbl style={{ marginBottom: 12 }}>Leave a Review</Lbl>
            <Hl style={{ fontSize: 24, marginBottom: 16 }}>
              How was your experience?
            </Hl>

            <Body style={{ fontSize: 12, marginBottom: 16 }}>
              Your feedback helps build trust on the platform.
            </Body>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 28,
                    color: star <= reviewRating ? S.gold : S.textFaint,
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <Txt
              placeholder="Write a short review..."
              value={reviewComment}
              onChange={setReviewComment}
              rows={4}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Btn variant="ghost" onClick={() => setShowReview(false)} full>
                Skip for now
              </Btn>
              <Btn
                variant="gold"
                onClick={() =>
                  submitReview(
                    activeOrder.id,
                    activeOrder.designer_id,
                    reviewRating,
                    reviewComment
                  )
                }
                full
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showDispute && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: '1px solid rgba(255,180,171,0.3)', width: '100%', maxWidth: 460, padding: 36 }}>
            <Lbl style={{ color: S.danger, marginBottom: 12 }}>Raise a Dispute</Lbl>
            <Hl style={{ fontSize: 22, marginBottom: 20 }}>What went wrong?</Hl>
            <Txt placeholder="Describe the issue clearly..." value={disputeReason} onChange={setDisputeReason} rows={4} />
            <div style={{ background: S.dangerDim, border: `1px solid ${S.dangerDim}`, padding: '10px 14px', margin: '14px 0' }}>
              <Body style={{ fontSize: 11 }}>Funds will be frozen and our team will review within 24 hours.</Body>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowDispute(false)} full>Cancel</Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  setMsgs((m: any) => [...m, { from: 'system', text: `Dispute raised: "${disputeReason}". Funds frozen.` }])
                  setShowDispute(false)
                }}
                full
              >
                Submit
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Hl style={{ fontSize: 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em' }}>ACCRA CREATIVES HUB</Hl>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ color: S.gold, fontSize: 11, fontFamily: S.headline, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${S.gold}`, paddingBottom: 2 }}>Messages</span>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕ Close</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: 300, borderRight: `1px solid ${S.borderFaint}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.borderFaint}` }}>
            <Hl style={{ fontSize: 18 }}>Conversations</Hl>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {ordersLoading && (
              <Body style={{ padding: '20px', fontSize: 12 }}>Loading conversations...</Body>
            )}

            {!ordersLoading && orders.map((o: any) => (
              <div
                key={o.id}
                onClick={() => {
                  setActiveOrder(o)
                  setOrd({ ...o })
                }}
                style={{
                  cursor: 'pointer',
                  background: activeOrder.id === o.id ? S.surface : 'none',
                  borderBottom: `1px solid ${S.borderFaint}`,
                  borderLeft: activeOrder.id === o.id ? `3px solid ${S.gold}` : '3px solid transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', height: 160 }}>
                  <img src={o.designerObj.portrait} alt={o.designer} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(80%)', opacity: 0.7 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.95),rgba(19,19,19,0.2))' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Hl style={{ fontSize: 13, fontWeight: 600 }}>{o.designer}</Hl>
                      <Body style={{ fontSize: 9 }}>{o.status === 'delivered' ? 'YESTERDAY' : 'TODAY'}</Body>
                    </div>
                    <Body style={{ fontSize: 11, marginBottom: 4 }}>{o.project}</Body>
                    <div style={{ color: o.status === 'delivered' || o.status === 'completed' ? S.success : S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {String(o.status).replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${S.gold}40` }}>
                <img src={activeOrder.designerObj.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
              </div>
              <div>
                <Hl style={{ fontSize: 15, fontWeight: 600 }}>{activeOrder.designer}</Hl>
                <Lbl style={{ marginBottom: 0, fontSize: 8 }}>{activeOrder.designerObj.category}</Lbl>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 1, background: S.borderFaint }}>
                {['client', 'designer'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      background: view === v ? S.goldDim : 'transparent',
                      border: 'none',
                      color: view === v ? S.gold : S.textMuted,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontFamily: S.headline,
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {view === 'client' && ord.status === 'in_progress' && (
                <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
              )}
            </div>
          </div>

          <div style={{ background: S.surface, padding: '12px 24px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Project</Lbl><Hl style={{ fontSize: 13, fontWeight: 600 }}>{ord.project}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Amount</Lbl><Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(ord.amount)}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Status</Lbl><Hl style={{ color: ord.status === 'delivered' || ord.status === 'completed' ? S.success : S.gold, fontSize: 12, textTransform: 'capitalize' }}>{String(ord.status).replace('_', ' ')}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Deadline</Lbl><Hl style={{ fontSize: 12 }}>{ord.deadline}</Hl></div>

              {ord.rush && (
                <div style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)', padding: '3px 10px' }}>
                  <span style={{ color: '#fcd34d', fontSize: 9, fontFamily: S.body, fontWeight: 700, letterSpacing: '0.1em' }}>⚡ RUSH</span>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Lbl style={{ margin: 0, fontSize: 8 }}>Revisions</Lbl>
                  <Body style={{ fontSize: 9 }}>{ord.revisions.used}/{ord.revisions.total}</Body>
                </div>
                <div style={{ height: 2, background: S.borderFaint }}>
                  <div style={{ height: '100%', width: `${pct(ord.revisions.used, ord.revisions.total)}%`, background: revLeft === 0 ? S.danger : S.gold, transition: 'width 0.4s' }} />
                </div>
                {revLeft === 0 && <Body style={{ color: S.danger, fontSize: 9, marginTop: 2 }}>No revisions remaining · {fmt(Math.round(ord.amount * 0.15))} per additional</Body>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {view === 'client' && ord.status === 'in_progress' && (
                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (revLeft === 0) {
                        alert('No revisions remaining.')
                        return
                      }
                      setOrd((o: any) => ({ ...o, revisions: { ...o.revisions, used: o.revisions.used + 1 } }))
                      setMsgs((m: any) => [...m, { from: 'system', text: `Revision ${ord.revisions.used + 1} of ${ord.revisions.total} requested` }])
                    }}
                    disabled={revLeft === 0}
                  >
                    Request Revision
                  </Btn>
                )}

                {view === 'client' && ord.status === 'delivered' && (
                  <Btn variant="success" size="sm" onClick={approveAndReleaseFunds}>
                    Approve & Release Funds
                  </Btn>
                )}

                {view === 'designer' && ord.status === 'in_progress' && (
                  <Btn
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setOrd((o: any) => ({ ...o, status: 'delivered' }))
                      setOrders((prev: any[]) =>
                        prev.map((orderItem: any) =>
                          orderItem.id === activeOrder.id
                            ? { ...orderItem, status: 'delivered' }
                            : orderItem
                        )
                      )
                      setMsgs((m: any) => [...m, { from: 'system', text: 'Project delivered. Client has 48 hours to approve.' }])
                    }}
                  >
                    Mark Delivered
                  </Btn>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '14px 18px', marginBottom: 8 }}>
              <Lbl style={{ marginBottom: 6 }}>Project Brief</Lbl>
              <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief}</Body>
            </div>

            {msgs.map((m: any, i: number) => {
              const isMe = m.from === view

              if (m.from === 'system') {
                return (
                  <div
                    key={m.id || i}
                    style={{
                      textAlign: 'center',
                      color: S.textFaint,
                      fontSize: 9,
                      fontFamily: S.body,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '8px 0',
                      borderTop: `1px solid ${S.borderFaint}`,
                      borderBottom: `1px solid ${S.borderFaint}`,
                    }}
                  >
                    {m.text}
                  </div>
                )
              }

              return (
                <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      background: isMe ? S.goldDim : S.surface,
                      border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : S.borderFaint}`,
                      padding: '12px 16px',
                      maxWidth: '70%',
                      color: S.text,
                      fontSize: 13,
                      fontFamily: S.body,
                      lineHeight: 1.6,
                    }}
                  >
                    {m.text}
                  </div>
                  <Body style={{ fontSize: 9, marginTop: 3, color: S.textFaint }}>{m.time}</Body>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ background: S.bg, padding: '14px 24px', borderTop: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, color: S.text, padding: '11px 16px', fontFamily: S.body, fontSize: 13, outline: 'none' }}
              />
              <Btn variant="gold" onClick={send}>Send</Btn>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {(view === 'client'
                ? ['When will it be ready?', 'Looks great!', 'Can we revise the colours?']
                : ['Working on it now', 'File incoming', 'Revision received']
              ).map((r) => (
                <button
                  key={r}
                  onClick={() => setInput(r)}
                  style={{
                    background: 'none',
                    border: `1px solid ${S.borderFaint}`,
                    color: S.textFaint,
                    padding: '4px 10px',
                    fontSize: 10,
                    fontFamily: S.body,
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: 240, borderLeft: `1px solid ${S.borderFaint}`, background: S.bg, padding: '20px', overflowY: 'auto', flexShrink: 0 }}>
          <Lbl style={{ marginBottom: 20 }}>Project Details</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { l: 'Service', v: activeOrder.designerObj.category },
              { l: 'Designer', v: activeOrder.designer },
              { l: 'Budget', v: fmt(activeOrder.amount) },
              { l: 'Revision Tracker', v: `${activeOrder.revisions.used} of ${activeOrder.revisions.total}` },
              { l: 'Due Date', v: activeOrder.deadline },
            ].map((item) => (
              <div key={item.l}>
                <Lbl style={{ marginBottom: 4, fontSize: 8 }}>{item.l}</Lbl>
                <Hl style={{ fontSize: 12 }}>{item.v}</Hl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}