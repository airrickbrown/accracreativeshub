// ── src/components/DesignerAgreementModal.tsx ──
// Shown to verified designers on first login after approval.
// Blocks all dashboard access until scrolled to bottom + checkbox ticked + Supabase updated.

import React, { useState, useEffect, useRef } from 'react'
import { S } from '../styles/tokens'
import { Hl, Body, Lbl } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface Props {
  onAccept: () => void
}

const CLAUSES = [
  {
    n: '01',
    title: 'Independent Contractor Status',
    body: 'You agree that you are an independent contractor and not an employee, agent, or partner of Accra Creatives Hub. You are solely responsible for your own tax obligations, national insurance, and compliance with Ghana Revenue Authority requirements. Accra Creatives Hub does not withhold taxes on your behalf.',
  },
  {
    n: '02',
    title: 'Platform Role',
    body: 'Accra Creatives Hub is a marketplace only. We facilitate connections between you and clients. We are not a party to any design contract between you and a client. All creative decisions, deliverables, and timelines are agreed directly between you and the client.',
  },
  {
    n: '03',
    title: 'Commission & Payments',
    body: 'Accra Creatives Hub charges a 10% commission on all completed orders. Funds are held in escrow by Paystack until the client approves the final delivery. Your payout (90% of the agreed amount) is released within 3–5 business days of client approval. You will not receive payment for work that is disputed and ruled against you.',
  },
  {
    n: '04',
    title: 'Quality Standards',
    body: 'You agree to deliver work that matches the agreed brief. You must communicate professionally and respond to client messages within 24 hours. Repeated poor reviews or late deliveries may result in suspension from the platform.',
  },
  {
    n: '05',
    title: 'Intellectual Property',
    body: 'Upon full payment and project completion, all intellectual property rights for commissioned work transfer to the client. You retain the right to display the work in your portfolio unless the client explicitly requests confidentiality in the brief.',
  },
  {
    n: '06',
    title: 'Revisions',
    body: 'You must complete the number of revision rounds agreed in the brief. Additional revisions beyond the agreed amount may be charged at your discretion, but must be communicated to the client before proceeding.',
  },
  {
    n: '07',
    title: 'Disputes',
    body: "If a client raises a dispute, you must respond with evidence within 48 hours of being notified. Our dispute resolution team will review the brief, your submission, and all platform communications. The team's decision is final. Failure to respond to a dispute within 48 hours may result in an automatic refund to the client.",
  },
  {
    n: '08',
    title: 'Platform Conduct',
    body: "You agree not to: contact clients outside the platform for work initiated here, solicit clients to pay outside Accra Creatives Hub's payment system, submit false or misleading portfolio work, or engage in any behaviour that damages the reputation of the platform or other users. Violation of this clause results in immediate removal from the platform.",
  },
  {
    n: '09',
    title: 'Data & Privacy',
    body: 'By joining the platform you consent to Accra Creatives Hub collecting and processing your name, email, portfolio work, and transaction data in accordance with the Data Protection Act, 2012 (Act 843) of Ghana and our Privacy Policy.',
  },
  {
    n: '10',
    title: 'Governing Law',
    body: 'This agreement is governed by the laws of the Republic of Ghana. Any disputes arising from this agreement shall be resolved under Ghanaian jurisdiction.',
  },
]

export default function DesignerAgreementModal({ onAccept }: Props) {
  const { user } = useAuth()
  const [isMobile, setIsMobile]               = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [agreed, setAgreed]                   = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    // 48px tolerance so it triggers just before the hard bottom
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 48) {
      setScrolledToBottom(true)
    }
  }

  const handleAccept = async () => {
    if (!agreed || !user || saving) return
    setSaving(true)
    setError('')
    try {
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({
          designer_agreement_accepted:    true,
          designer_agreement_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      if (dbErr) throw dbErr
      onAccept()
    } catch {
      setError('Failed to save your agreement. Please check your connection and try again.')
      setSaving(false)
    }
  }

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
        background: '#111114',
        border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '96dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -24px 64px rgba(0,0,0,0.85)',
      }
    : {
        position: 'fixed', top: '50%', left: '50%', zIndex: 500,
        transform: 'translate(-50%,-50%)',
        background: '#111114',
        border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: 16,
        width: '100%', maxWidth: 600, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
      }

  const ctaActive = agreed && !saving

  return (
    <>
      {/* Backdrop — intentionally non-dismissible */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 499,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(16px)',
      }} />

      <div style={modalStyle}>

        {/* Drag handle — mobile only */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
          </div>
        )}

        {/* Header */}
        <div style={{ padding: isMobile ? '14px 20px 0' : '24px 28px 0', flexShrink: 0 }}>
          <Lbl style={{ marginBottom: 8, color: S.gold, fontSize: 9 }}>Before You Start</Lbl>
          <Hl style={{ fontSize: isMobile ? 20 : 24, fontWeight: 500, marginBottom: 6 }}>
            Designer Agreement
          </Hl>
          <Body style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Read all 10 clauses carefully. Scroll to the bottom to unlock the checkbox.
          </Body>

          {/* Scroll progress bar */}
          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', marginBottom: 14, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: S.gold,
              width: scrolledToBottom ? '100%' : '0%',
              transition: 'width 0.5s ease',
            }} />
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto',
            padding: isMobile ? '16px 20px' : '16px 28px',
            WebkitOverflowScrolling: 'touch' as any,
          }}
        >
          {CLAUSES.map((c, i) => (
            <div
              key={c.n}
              style={{
                marginBottom: i < CLAUSES.length - 1 ? 22 : 10,
                paddingBottom: i < CLAUSES.length - 1 ? 22 : 10,
                borderBottom: i < CLAUSES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'baseline' }}>
                <span style={{
                  color: S.gold, fontFamily: S.headline,
                  fontSize: 10, letterSpacing: '0.1em', flexShrink: 0,
                }}>{c.n}</span>
                <Body style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: 0 }}>{c.title}</Body>
              </div>
              <Body style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 22 }}>{c.body}</Body>
            </div>
          ))}

          {/* End marker */}
          <div style={{
            textAlign: 'center',
            padding: '14px 0 6px',
            color: scrolledToBottom ? S.gold : S.textFaint,
            fontFamily: S.headline,
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            transition: 'color 0.3s',
          }}>
            {scrolledToBottom ? '✓  End of Agreement' : '↓  Keep Scrolling'}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? '14px 20px 28px' : '16px 28px 28px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          background: '#111114',
        }}>
          {/* Checkbox */}
          <label style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
            marginBottom: 14,
            opacity: scrolledToBottom ? 1 : 0.4,
            transition: 'opacity 0.3s',
          }}>
            <input
              type="checkbox"
              checked={agreed}
              disabled={!scrolledToBottom}
              onChange={e => setAgreed(e.target.checked)}
              style={{
                marginTop: 2, width: 16, height: 16, flexShrink: 0,
                accentColor: S.gold,
                cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
              }}
            />
            <Body style={{ fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              I have read and agree to the Accra Creatives Hub Designer Agreement. I understand
              I am an independent contractor and am responsible for my own tax obligations.
            </Body>
          </label>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            }}>
              <Body style={{ fontSize: 12, color: S.danger, margin: 0 }}>{error}</Body>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAccept}
            disabled={!ctaActive}
            style={{
              width: '100%',
              background: ctaActive ? S.gold : 'rgba(201,168,76,0.12)',
              border: `1px solid ${ctaActive ? S.gold : 'rgba(201,168,76,0.18)'}`,
              color: ctaActive ? '#131313' : S.textFaint,
              fontFamily: S.headline,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              fontWeight: 700,
              padding: '15px 0',
              borderRadius: 10,
              cursor: ctaActive ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={(e: any) => { if (ctaActive) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.opacity = '1' }}
          >
            {saving ? (
              <>
                <span style={{
                  width: 13, height: 13,
                  border: '2px solid rgba(0,0,0,0.2)',
                  borderTopColor: '#131313',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Saving…
              </>
            ) : 'I Agree — Enter Dashboard →'}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  )
}
