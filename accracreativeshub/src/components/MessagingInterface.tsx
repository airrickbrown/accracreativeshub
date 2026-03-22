// ── MESSAGING / CHAT COMPONENT ──
// Full messaging interface between client and designer.
// Features: conversation list, revision tracker, file delivery,
// dispute button, approve & release funds.

import React, { useState, useRef, useEffect } from 'react'
import { S, pct, fmt } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Txt } from './UI'
import { ORDERS, MESSAGES_DATA } from '../data/mockData'

interface MessagingInterfaceProps {
  onClose: () => void
}

export default function MessagingInterface({ onClose }: MessagingInterfaceProps) {
  const [activeOrder, setActiveOrder]   = useState(ORDERS[0])
  const [msgs, setMsgs]                 = useState(MESSAGES_DATA[ORDERS[0].id] || [])
  const [input, setInput]               = useState('')
  const [view, setView]                 = useState('client')   // 'client' or 'designer'
  const [showDispute, setShowDispute]   = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [ord, setOrd]                   = useState({ ...ORDERS[0] })
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    setMsgs((m: any) => [...m, { from: view, text: input.trim(), time: 'Just now' }])
    setInput('')
  }

  const revLeft = ord.revisions.total - ord.revisions.used

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, display: 'flex', flexDirection: 'column' }}>

      {/* ── Dispute modal ── */}
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
              <Btn variant="ghost"  onClick={() => setShowDispute(false)} full>Cancel</Btn>
              <Btn variant="danger" onClick={() => { setMsgs((m: any) => [...m, { from: 'system', text: `Dispute raised: "${disputeReason}". Funds frozen.` }]); setShowDispute(false) }} full>Submit</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ background: S.bg, padding: '14px 24px', borderBottom: `1px solid ${S.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Hl style={{ fontSize: 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em' }}>ACCRA CREATIVES HUB</Hl>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ color: S.gold, fontSize: 11, fontFamily: S.headline, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${S.gold}`, paddingBottom: 2 }}>Messages</span>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕ Close</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Left sidebar — conversation list ── */}
        <div style={{ width: 300, borderRight: `1px solid ${S.borderFaint}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.borderFaint}` }}>
            <Hl style={{ fontSize: 18 }}>Conversations</Hl>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {ORDERS.map(o => (
              <div key={o.id}
                onClick={() => { setActiveOrder(o); setMsgs(MESSAGES_DATA[o.id] || []); setOrd({ ...o }) }}
                style={{ cursor: 'pointer', background: activeOrder.id === o.id ? S.surface : 'none', borderBottom: `1px solid ${S.borderFaint}`, borderLeft: activeOrder.id === o.id ? `3px solid ${S.gold}` : '3px solid transparent', transition: 'background 0.2s' }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: 160 }}>
                  <img src={o.designerObj.portrait} alt={o.designer} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(80%)', opacity: 0.7 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.95),rgba(19,19,19,0.2))' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Hl style={{ fontSize: 13, fontWeight: 600 }}>{o.designer}</Hl>
                      <Body style={{ fontSize: 9 }}>{o.status === 'delivered' ? 'YESTERDAY' : 'TODAY'}</Body>
                    </div>
                    <Body style={{ fontSize: 11, marginBottom: 4 }}>{o.project}</Body>
                    <div style={{ color: o.status === 'delivered' ? S.success : S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{o.status.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Designer header */}
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
              {/* Toggle between client and designer view */}
              <div style={{ display: 'flex', gap: 1, background: S.borderFaint }}>
                {['client', 'designer'].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ background: view === v ? S.goldDim : 'transparent', border: 'none', color: view === v ? S.gold : S.textMuted, padding: '6px 12px', cursor: 'pointer', fontFamily: S.headline, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {v}
                  </button>
                ))}
              </div>
              {view === 'client' && ord.status === 'in_progress' && (
                <Btn variant="danger" size="sm" onClick={() => setShowDispute(true)}>Dispute</Btn>
              )}
            </div>
          </div>

          {/* Order details bar */}
          <div style={{ background: S.surface, padding: '12px 24px', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Project</Lbl><Hl style={{ fontSize: 13, fontWeight: 600 }}>{ord.project}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Amount</Lbl><Hl style={{ color: S.gold, fontSize: 18 }}>{fmt(ord.amount)}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Status</Lbl><Hl style={{ color: ord.status === 'delivered' ? S.success : S.gold, fontSize: 12, textTransform: 'capitalize' }}>{ord.status.replace('_', ' ')}</Hl></div>
              <div><Lbl style={{ marginBottom: 4, fontSize: 8 }}>Deadline</Lbl><Hl style={{ fontSize: 12 }}>{ord.deadline}</Hl></div>

              {/* Rush badge */}
              {ord.rush && <div style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)', padding: '3px 10px' }}><span style={{ color: '#fcd34d', fontSize: 9, fontFamily: S.body, fontWeight: 700, letterSpacing: '0.1em' }}>⚡ RUSH</span></div>}

              {/* Revision tracker */}
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

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {view === 'client'   && ord.status === 'in_progress' && <Btn variant="outline" size="sm" onClick={() => { if (revLeft === 0) { alert('No revisions remaining.'); return } setOrd((o: any) => ({ ...o, revisions: { ...o.revisions, used: o.revisions.used + 1 } })); setMsgs((m: any) => [...m, { from: 'system', text: `Revision ${ord.revisions.used + 1} of ${ord.revisions.total} requested` }]) }} disabled={revLeft === 0}>Request Revision</Btn>}
                {view === 'client'   && ord.status === 'delivered'   && <Btn variant="success" size="sm" onClick={() => { setOrd((o: any) => ({ ...o, status: 'completed' })); setMsgs((m: any) => [...m, { from: 'system', text: 'Payment released. Thank you!' }]); alert('Funds released!') }}>Approve & Release Funds</Btn>}
                {view === 'designer' && ord.status === 'in_progress' && <Btn variant="gold"    size="sm" onClick={() => { setOrd((o: any) => ({ ...o, status: 'delivered' })); setMsgs((m: any) => [...m, { from: 'system', text: 'Project delivered. Client has 48 hours to approve.' }]) }}>Mark Delivered</Btn>}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Brief summary card */}
            <div style={{ background: S.surface, borderLeft: `3px solid ${S.gold}`, padding: '14px 18px', marginBottom: 8 }}>
              <Lbl style={{ marginBottom: 6 }}>Project Brief</Lbl>
              <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{ord.brief}</Body>
            </div>

            {msgs.map((m: any, i: number) => {
              const isMe = m.from === view
              if (m.from === 'system') return (
                <div key={i} style={{ textAlign: 'center', color: S.textFaint, fontSize: 9, fontFamily: S.body, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 0', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>{m.text}</div>
              )
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: isMe ? S.goldDim : S.surface, border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : S.borderFaint}`, padding: '12px 16px', maxWidth: '70%', color: S.text, fontSize: 13, fontFamily: S.body, lineHeight: 1.6 }}>
                    {m.text}
                    {/* File attachment */}
                    {m.file && (
                      <div style={{ background: S.bgLow, border: `1px solid ${S.border}`, padding: '10px 12px', marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => alert('Opening file...')}>
                        <div style={{ width: 32, height: 32, background: S.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.gold, fontSize: 9, fontWeight: 700, fontFamily: S.body, flexShrink: 0 }}>{m.file.type}</div>
                        <div>
                          <Hl style={{ fontSize: 12, fontWeight: 600 }}>{m.file.name}</Hl>
                          <Body style={{ fontSize: 10 }}>{m.file.size}</Body>
                        </div>
                      </div>
                    )}
                  </div>
                  <Body style={{ fontSize: 9, marginTop: 3, color: S.textFaint }}>{m.time}</Body>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <div style={{ background: S.bg, padding: '14px 24px', borderTop: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {view === 'designer' && (
                <Btn variant="dark" size="sm" onClick={() => setMsgs((m: any) => [...m, { from: 'designer', text: 'Here is the latest version:', time: 'Just now', file: { name: `Design_v${Date.now() % 10 + 1}.pdf`, size: '2.1 MB', type: 'PDF' } }])}>+ File</Btn>
              )}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, color: S.text, padding: '11px 16px', fontFamily: S.body, fontSize: 13, outline: 'none' }}
              />
              <Btn variant="gold" onClick={send}>Send</Btn>
            </div>
            {/* Quick reply suggestions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {(view === 'client' ? ['When will it be ready?', 'Looks great!', 'Can we revise the colours?'] : ['Working on it now', 'File incoming', 'Revision received']).map(r => (
                <button key={r} onClick={() => setInput(r)} style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textFaint, padding: '4px 10px', fontSize: 10, fontFamily: S.body, cursor: 'pointer' }}>{r}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar — project details ── */}
        <div style={{ width: 240, borderLeft: `1px solid ${S.borderFaint}`, background: S.bg, padding: '20px', overflowY: 'auto', flexShrink: 0 }}>
          <Lbl style={{ marginBottom: 20 }}>Project Details</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { l: 'Service',          v: activeOrder.designerObj.category },
              { l: 'Designer',         v: activeOrder.designer },
              { l: 'Budget',           v: fmt(activeOrder.amount) },
              { l: 'Revision Tracker', v: `${activeOrder.revisions.used} of ${activeOrder.revisions.total}` },
              { l: 'Due Date',         v: activeOrder.deadline },
            ].map(item => (
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
