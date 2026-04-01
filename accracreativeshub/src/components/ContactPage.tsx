import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Txt, Hl, Body, Lbl, GoldLine } from './UI'
import Nav from './Nav'

interface ContactPageProps { onClose: () => void }

// ── Send email via Resend API ──
// Requires VITE_RESEND_API_KEY in your Vercel environment variables.
// See EMAIL_SETUP.md for setup instructions.
const sendEmail = async ({
  to, subject, html,
}: { to: string; subject: string; html: string }) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY
  if (!apiKey) {
    console.warn('VITE_RESEND_API_KEY not set — email not sent')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Accra Creatives Hub <noreply@accracreativeshub.com>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Email send failed')
  }
}

export default function ContactPage({ onClose }: ContactPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [userType, setUserType] = useState<'Client' | 'Designer' | 'Other'>('Client')
  const [form, setForm]         = useState({ name: '', email: '', message: '' })
  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  // Auto-generate subject based on user type — updates when type changes
  const subject = `${userType} Enquiry — Accra Creatives Hub`

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSend = async () => {
    if (!form.name)    { setError('Please enter your name.'); return }
    if (!form.email)   { setError('Please enter your email address.'); return }
    if (!form.message) { setError('Please write a message.'); return }
    setError('')
    setLoading(true)

    try {
      // 1. Send notification to YOU (the platform owner)
      await sendEmail({
        to: 'hello@accracreativeshub.com',
        subject: `[Contact Form] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#131313;padding:24px;text-align:center;">
              <h2 style="color:#c9a84c;font-family:Georgia,serif;margin:0;">Accra Creatives Hub</h2>
              <p style="color:#888;font-size:12px;margin:4px 0 0;">New contact form submission</p>
            </div>
            <div style="background:#f9f9f9;padding:28px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#666;font-size:13px;width:120px;"><strong>From:</strong></td><td style="padding:8px 0;font-size:13px;">${form.name}</td></tr>
                <tr><td style="padding:8px 0;color:#666;font-size:13px;"><strong>Email:</strong></td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${form.email}">${form.email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#666;font-size:13px;"><strong>Type:</strong></td><td style="padding:8px 0;font-size:13px;">${userType}</td></tr>
                <tr><td style="padding:8px 0;color:#666;font-size:13px;"><strong>Subject:</strong></td><td style="padding:8px 0;font-size:13px;">${subject}</td></tr>
              </table>
              <div style="margin-top:20px;padding:16px;background:#fff;border-left:3px solid #c9a84c;">
                <p style="font-size:13px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap;">${form.message}</p>
              </div>
            </div>
            <div style="background:#131313;padding:16px;text-align:center;">
              <p style="color:#666;font-size:11px;margin:0;">Reply directly to this email to respond to ${form.name}</p>
            </div>
          </div>
        `,
      })

      // 2. Send confirmation email to the person who contacted you
      await sendEmail({
        to: form.email,
        subject: 'We received your message — Accra Creatives Hub',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#131313;padding:32px;text-align:center;">
              <h2 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:28px;">Accra Creatives Hub</h2>
              <p style="color:#888;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:8px 0 0;">Ghana's Premier Design Marketplace</p>
            </div>
            <div style="background:#fff;padding:36px;">
              <p style="font-size:15px;color:#333;margin:0 0 16px;">Hi ${form.name},</p>
              <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 16px;">
                Thank you for reaching out to Accra Creatives Hub. We've received your message and our team will get back to you within <strong>24 business hours</strong>.
              </p>
              <div style="background:#f9f9f9;border-left:3px solid #c9a84c;padding:16px;margin:24px 0;">
                <p style="font-size:12px;color:#999;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Your message</p>
                <p style="font-size:13px;color:#444;line-height:1.7;margin:0;white-space:pre-wrap;">${form.message}</p>
              </div>
              <p style="font-size:13px;color:#777;line-height:1.8;margin:0 0 8px;">
                While you wait, feel free to explore our designers at
                <a href="https://accracreativeshub.com" style="color:#c9a84c;">accracreativeshub.com</a>
              </p>
              <p style="font-size:13px;color:#777;margin:0;">
                Warm regards,<br />
                <strong style="color:#333;">The Accra Creatives Hub Team</strong>
              </p>
            </div>
            <div style="background:#131313;padding:20px;text-align:center;">
              <p style="color:#666;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana<br />
                <a href="https://accracreativeshub.com" style="color:#c9a84c;text-decoration:none;">accracreativeshub.com</a>
              </p>
            </div>
          </div>
        `,
      })

      setSent(true)
    } catch (err: any) {
      console.error('Email error:', err)
      // Still show success to user — log error for debugging
      // In production you'd want a fallback (e.g. store in Supabase)
      setError('Message could not be sent right now. Please email us directly at hello@accracreativeshub.com')
    }

    setLoading(false)
  }

  const contacts = [
    { label: 'General',          value: 'hello@accracreativeshub.com',    icon: '✉' },
    { label: 'Designer Support', value: 'designers@accracreativeshub.com', icon: '◈' },
    { label: 'Client Support',   value: 'clients@accracreativeshub.com',   icon: '◉' },
    { label: 'Disputes',         value: 'disputes@accracreativeshub.com',  icon: '◐' },
    { label: 'WhatsApp',         value: '+233 XX XXX XXXX',               icon: '◑' },
    { label: 'Location',         value: 'Accra, Ghana',                   icon: '📍' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav scrolled={true} user={null} onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}} onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose} onLogin={() => {}} onSignOut={() => {}} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 80px' }}>
        <Lbl style={{ marginBottom: 12, color: S.gold }}>Get in Touch</Lbl>
        <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, marginBottom: 8, lineHeight: 1.1 }}>Contact Us</Hl>
        <GoldLine />
        <Body style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.9, marginBottom: 40 }}>
          Whether you're a designer looking to join, a client with questions, or need help — we're here.
        </Body>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 32 : 2, background: isMobile ? 'transparent' : S.borderFaint }}>

          {/* ── Form ── */}
          <div style={{ background: S.bgLow, padding: isMobile ? '0' : '40px 36px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ color: S.gold, fontSize: 48, marginBottom: 20 }}>◉</div>
                <Hl style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>Message Sent!</Hl>
                <Body style={{ fontSize: 14, marginBottom: 8, lineHeight: 1.9 }}>
                  Thank you, {form.name}. We've sent a confirmation to <strong style={{ color: S.text }}>{form.email}</strong>.
                </Body>
                <Body style={{ fontSize: 13, marginBottom: 28, color: S.textMuted }}>
                  Our team will respond within 24 business hours. Check your spam folder if you don't see the confirmation.
                </Body>
                <Btn variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}>
                  Send Another Message
                </Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Hl style={{ fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Send a Message</Hl>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <Inp label="Full Name *"     placeholder="Kofi Mensah"    value={form.name}  onChange={(v: string) => f('name', v)} />
                  <Inp label="Email Address *" placeholder="your@email.com" value={form.email} onChange={(v: string) => f('email', v)} />
                </div>

                {/* User type — FIX: subject auto-updates when you switch */}
                <div>
                  <Lbl style={{ marginBottom: 10 }}>I am a</Lbl>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['Client', 'Designer', 'Other'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setUserType(r)}
                        style={{
                          flex: 1,
                          background: userType === r ? 'rgba(201,168,76,0.1)' : S.surface,
                          border: `1px solid ${userType === r ? S.gold : S.borderFaint}`,
                          color: userType === r ? S.gold : S.textMuted,
                          padding: '10px 8px', fontFamily: S.headline, fontSize: 10,
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          cursor: 'pointer', borderRadius: 6, transition: 'all 0.2s',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {/* Show generated subject */}
                  <div style={{ marginTop: 8, padding: '8px 12px', background: S.surface, border: `1px solid ${S.borderFaint}`, borderRadius: 6 }}>
                    <Body style={{ fontSize: 11, margin: 0, color: S.textFaint }}>
                      Subject: <span style={{ color: S.textMuted }}>{subject}</span>
                    </Body>
                  </div>
                </div>

                <Txt
                  label="Message *"
                  placeholder="Tell us how we can help you..."
                  value={form.message}
                  onChange={(v: string) => f('message', v)}
                  rows={5}
                />

                {error && (
                  <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', padding: '12px 14px', borderRadius: S.radiusSm }}>
                    <Body style={{ color: S.danger, fontSize: 12, margin: 0 }}>{error}</Body>
                  </div>
                )}

                <Btn variant="gold" full onClick={handleSend} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </Btn>

                <Body style={{ fontSize: 11, textAlign: 'center', color: S.textFaint }}>
                  You'll receive a confirmation email. We respond within 24 hours.
                </Body>
              </div>
            )}
          </div>

          {/* ── Contact info ── */}
          <div style={{ background: S.surface, padding: isMobile ? '32px 0' : '40px 28px' }}>
            <Hl style={{ fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Contact Information</Hl>
            {contacts.map((c) => (
              <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: `1px solid ${S.borderFaint}` }}>
                <span style={{ color: S.gold, fontSize: 16, flexShrink: 0, marginTop: 2 }}>{c.icon}</span>
                <div>
                  <Lbl style={{ margin: 0, marginBottom: 3, fontSize: 8 }}>{c.label}</Lbl>
                  <Body style={{ fontSize: 12, margin: 0, color: S.text }}>{c.value}</Body>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <Lbl style={{ marginBottom: 10, color: S.gold }}>Support Hours</Lbl>
              {[
                { day: 'Mon – Fri', hours: '8:00 AM – 6:00 PM GMT' },
                { day: 'Saturday',  hours: '9:00 AM – 2:00 PM GMT' },
                { day: 'Sunday',    hours: 'Closed'                  },
              ].map((h) => (
                <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Body style={{ fontSize: 12, margin: 0 }}>{h.day}</Body>
                  <Body style={{ fontSize: 12, margin: 0, color: h.hours === 'Closed' ? S.danger : S.gold }}>{h.hours}</Body>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 24px', cursor: 'pointer', borderRadius: 8 }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}