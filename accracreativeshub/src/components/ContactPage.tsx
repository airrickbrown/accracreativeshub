// ── CONTACT PAGE ──
// Replaces the old "Contact Us → opens messages" bug.
// Shows a proper contact form + contact info.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Txt, Hl, Body, Lbl, GoldLine } from './UI'
import Nav from './Nav'

interface ContactPageProps {
  onClose: () => void
}

export default function ContactPage({ onClose }: ContactPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) {
      alert('Please fill in your name, email, and message.')
      return
    }
    setLoading(true)
    // Simulate send — wire up to your email service / Supabase edge function
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  const contacts = [
    { label: 'General Enquiries',  value: 'hello@accracreativeshub.com',    icon: '✉' },
    { label: 'Designer Support',   value: 'designers@accracreativeshub.com', icon: '◈' },
    { label: 'Client Support',     value: 'clients@accracreativeshub.com',   icon: '◉' },
    { label: 'Disputes & Legal',   value: 'disputes@accracreativeshub.com',  icon: '◐' },
    { label: 'WhatsApp',           value: '+233 XX XXX XXXX',               icon: '◑' },
    { label: 'Location',           value: 'Accra, Ghana',                   icon: '📍' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>
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

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Get in Touch</Lbl>
          <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, marginBottom: 8, lineHeight: 1.1 }}>
            Contact Us
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.9 }}>
            Whether you're a designer looking to join, a client with questions, or need help
            with a project — we're here to help.
          </Body>
        </div>

        {/* Two columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
            gap: isMobile ? 32 : 2,
            background: isMobile ? 'transparent' : S.borderFaint,
          }}
        >

          {/* ── Form ── */}
          <div style={{ background: S.bgLow, padding: isMobile ? '0' : '40px 36px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ color: S.gold, fontSize: 48, marginBottom: 20 }}>◉</div>
                <Hl style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>Message Sent</Hl>
                <Body style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.9 }}>
                  Thank you for reaching out. Our team will respond within 24 hours.
                </Body>
                <Btn variant="gold" onClick={() => setSent(false)}>Send Another Message</Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Hl style={{ fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Send a Message</Hl>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <Inp label="Full Name"     placeholder="Kofi Mensah"            value={form.name}    onChange={(v: string) => f('name', v)} />
                  <Inp label="Email Address" placeholder="your@email.com"          value={form.email}   onChange={(v: string) => f('email', v)} />
                </div>

                <Inp label="Subject" placeholder="e.g. Question about Designer Signup" value={form.subject} onChange={(v: string) => f('subject', v)} />

                {/* Category selector */}
                <div>
                  <Lbl style={{ marginBottom: 10 }}>I am a</Lbl>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Client', 'Designer', 'Other'].map((r) => (
                      <button
                        key={r}
                        onClick={() => f('subject', form.subject || `Enquiry from a ${r}`)}
                        style={{
                          background: S.surface,
                          border: `1px solid ${S.borderFaint}`,
                          color: S.textMuted,
                          padding: '8px 16px',
                          fontFamily: S.headline,
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e: any) => { e.target.style.borderColor = S.gold; e.target.style.color = S.gold }}
                        onMouseLeave={(e: any) => { e.target.style.borderColor = S.borderFaint; e.target.style.color = S.textMuted }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <Txt
                  label="Message"
                  placeholder="Tell us how we can help you..."
                  value={form.message}
                  onChange={(v: string) => f('message', v)}
                  rows={5}
                />

                <Btn variant="gold" full onClick={handleSend} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </Btn>

                <Body style={{ fontSize: 11, textAlign: 'center' }}>
                  We typically respond within 24 business hours.
                </Body>
              </div>
            )}
          </div>

          {/* ── Contact info sidebar ── */}
          <div style={{ background: S.surface, padding: isMobile ? '32px 0' : '40px 28px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Hl style={{ fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Contact Information</Hl>

            {contacts.map((c) => (
              <div
                key={c.label}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '14px 0',
                  borderBottom: `1px solid ${S.borderFaint}`,
                }}
              >
                <span style={{ color: S.gold, fontSize: 16, flexShrink: 0, marginTop: 2 }}>{c.icon}</span>
                <div>
                  <Lbl style={{ margin: 0, marginBottom: 3, fontSize: 8 }}>{c.label}</Lbl>
                  <Body style={{ fontSize: 12, margin: 0, color: S.text }}>{c.value}</Body>
                </div>
              </div>
            ))}

            {/* Office hours */}
            <div style={{ marginTop: 20 }}>
              <Lbl style={{ marginBottom: 10, color: S.gold }}>Support Hours</Lbl>
              {[
                { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM GMT' },
                { day: 'Saturday',        hours: '9:00 AM – 2:00 PM GMT' },
                { day: 'Sunday',          hours: 'Closed' },
              ].map((h) => (
                <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Body style={{ fontSize: 12, margin: 0 }}>{h.day}</Body>
                  <Body style={{ fontSize: 12, margin: 0, color: h.hours === 'Closed' ? S.danger : S.gold }}>{h.hours}</Body>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${S.borderFaint}`,
              color: S.textMuted,
              fontFamily: S.headline,
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '10px 24px',
              cursor: 'pointer',
              borderRadius: 8,
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}