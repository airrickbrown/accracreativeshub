// ── src/components/ContactPage.tsx ──
// Contact form connected to Resend.
// Sends: 1) notification to hello@accracreativeshub.com  2) confirmation to user.
// Fully mobile responsive.

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'

// @ts-ignore
const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM_ADDR = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const TO_ADDR   = 'hello@accracreativeshub.com'

interface ContactPageProps { onClose: () => void }
type Status = 'idle' | 'sending' | 'sent' | 'error'

const SUBJECTS = [
  'General Enquiry', 'Hiring a Designer', 'Designer Application',
  'Payment / Billing', 'Dispute', 'Partnership', 'Other',
]

export default function ContactPage({ onClose }: ContactPageProps) {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [focused, setFocused] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const inp = (isActive: boolean): React.CSSProperties => ({
    display: 'block', width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${isActive ? S.gold : 'rgba(255,255,255,0.09)'}`,
    color: S.text, padding: '13px 16px', fontFamily: S.body,
    fontSize: 16, outline: 'none', borderRadius: 8,
    minHeight: 50, transition: 'border-color 0.2s',
  })

  const handleSubmit = async () => {
    if (!form.name.trim())    { setErrMsg('Please enter your name.'); return }
    if (!form.email.trim())   { setErrMsg('Please enter your email.'); return }
    if (!form.subject)        { setErrMsg('Please select a subject.'); return }
    if (!form.message.trim()) { setErrMsg('Please enter your message.'); return }

    setStatus('sending'); setErrMsg('')

    const key = RESEND_KEY()
    if (!key) {
      setErrMsg('Email service unavailable. Please email us directly at hello@accracreativeshub.com')
      setStatus('error')
      return
    }

    const year      = new Date().getFullYear()
    const firstName = form.name.split(' ')[0]
    const preview   = form.message.slice(0, 220) + (form.message.length > 220 ? '…' : '')
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Accra', dateStyle: 'medium', timeStyle: 'short' })

    try {
      // 1. Notify your inbox
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     FROM_ADDR,
          to:       TO_ADDR,
          reply_to: form.email,
          subject:  `[Contact] ${form.subject} — ${form.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;background:#f5f5f5;padding:32px;">
            <h2 style="color:#131313;margin:0 0 24px;font-size:20px;">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;width:110px;font-weight:600;">Name</td><td style="padding:12px 16px;font-size:13px;">${form.name}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Email</td><td style="padding:12px 16px;font-size:13px;"><a href="mailto:${form.email}" style="color:#c9a84c;">${form.email}</a></td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;">Subject</td><td style="padding:12px 16px;font-size:13px;">${form.subject}</td></tr>
              <tr><td style="padding:12px 16px;background:#f9f9f9;color:#666;font-size:13px;font-weight:600;vertical-align:top;">Message</td><td style="padding:12px 16px;font-size:13px;line-height:1.7;white-space:pre-wrap;">${form.message}</td></tr>
            </table>
            <p style="color:#999;font-size:11px;margin:16px 0 0;">Sent ${timestamp} WAT · accracreativeshub.com</p>
          </div>`,
        }),
      })
      if (!r.ok) throw new Error(await r.text())

      // 2. Confirmation to user
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    FROM_ADDR,
          to:      form.email,
          subject: 'We received your message — Accra Creatives Hub',
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:36px 40px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">
    Message received, ${firstName}.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">
    Thank you for reaching out about <strong style="color:#f5f5f5;">${form.subject}</strong>.
    We will get back to you within <strong style="color:#f5f5f5;">1–2 business days</strong>.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:16px 0;">
    <p style="color:#888;font-size:12px;margin:0 0 6px;font-weight:600;">Your message:</p>
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;white-space:pre-wrap;">${preview}</p>
  </div>
  <p style="color:#666;font-size:13px;margin:20px 0 0;">
    For urgent matters, email us directly:<br/>
    <a href="mailto:hello@accracreativeshub.com" style="color:#c9a84c;">hello@accracreativeshub.com</a>
  </p>
</td></tr>
<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">
    © ${year} Accra Creatives Hub · Accra, Ghana &nbsp;·&nbsp;
    <a href="https://accracreativeshub.com" style="color:#c9a84c;text-decoration:none;">accracreativeshub.com</a>
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`,
        }),
      })

      setStatus('sent')
    } catch (err: any) {
      console.error('Contact form error:', err)
      setErrMsg('Failed to send. Please email us directly at hello@accracreativeshub.com')
      setStatus('error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: S.bgDeep, overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '80px 16px 60px' : '100px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Lbl style={{ marginBottom: 12 }}>Get in Touch</Lbl>
          <Hl style={{ fontSize: 'clamp(28px,7vw,48px)', fontWeight: 300, marginBottom: 16, lineHeight: 1.1 }}>
            We&apos;d love to<br /><em style={{ fontStyle: 'italic', color: S.gold }}>hear from you.</em>
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 14, lineHeight: 1.9, maxWidth: 480 }}>
            Questions, partnerships, or support — we respond within 1–2 business days.
          </Body>
        </div>

        {/* Email contacts */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 1, background: S.borderFaint, marginBottom: 36, borderRadius: 6, overflow: 'hidden' }}>
          {[
            { l: 'General',   e: 'hello@accracreativeshub.com'     },
            { l: 'Designers', e: 'designers@accracreativeshub.com' },
            { l: 'Clients',   e: 'clients@accracreativeshub.com'   },
            { l: 'Disputes',  e: 'disputes@accracreativeshub.com'  },
          ].map(c => (
            <div key={c.l} style={{ background: S.bgLow, padding: '14px 14px' }}>
              <Lbl style={{ marginBottom: 6, fontSize: 8 }}>{c.l}</Lbl>
              <a href={`mailto:${c.e}`} style={{ color: S.gold, fontSize: isMobile ? 9 : 10, fontFamily: S.body, textDecoration: 'none', wordBreak: 'break-all', display: 'block', lineHeight: 1.4 }}>{c.e}</a>
            </div>
          ))}
        </div>

        {/* Success state */}
        {status === 'sent' ? (
          <div style={{ background: 'rgba(74,154,74,0.08)', border: '1px solid rgba(74,154,74,0.25)', borderRadius: 12, padding: isMobile ? '32px 20px' : '40px 32px', textAlign: 'center' }}>
            <div style={{ color: '#4ade80', fontSize: 48, marginBottom: 16 }}>✓</div>
            <Hl style={{ fontSize: 24, marginBottom: 12 }}>Message sent.</Hl>
            <Body style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
              We've received your message. A confirmation was sent to{' '}
              <strong style={{ color: S.text }}>{form.email}</strong>.<br />
              We'll reply within 1–2 business days.
            </Body>
            <Btn variant="gold" onClick={onClose}>Back to Platform →</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
              <div>
                <Lbl style={{ marginBottom: 8 }}>Full Name</Lbl>
                <input
                  value={form.name}
                  onChange={e => f('name', e.target.value)}
                  placeholder="e.g. Kofi Mensah"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  style={inp(focused === 'name')}
                />
              </div>
              <div>
                <Lbl style={{ marginBottom: 8 }}>Email Address</Lbl>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => f('email', e.target.value)}
                  placeholder="your@email.com"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  style={inp(focused === 'email')}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <Lbl style={{ marginBottom: 8 }}>Subject</Lbl>
              <select
                value={form.subject}
                onChange={e => f('subject', e.target.value)}
                onFocus={() => setFocused('subject')}
                onBlur={() => setFocused('')}
                style={{ ...inp(focused === 'subject'), color: form.subject ? S.text : S.textFaint, cursor: 'pointer' }}
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Message */}
            <div>
              <Lbl style={{ marginBottom: 8 }}>Message</Lbl>
              <textarea
                value={form.message}
                onChange={e => f('message', e.target.value)}
                placeholder="Tell us how we can help…"
                rows={isMobile ? 5 : 7}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused('')}
                style={{ ...inp(focused === 'message'), resize: 'vertical', lineHeight: 1.7, minHeight: 120 }}
              />
            </div>

            {/* Info notice */}
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 8, padding: '12px 16px' }}>
              <Body style={{ fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                📬 A confirmation email will be sent to you immediately. We aim to reply within <strong style={{ color: S.text }}>1–2 business days</strong>.
              </Body>
            </div>

            {/* Error */}
            {errMsg && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 8, padding: '12px 16px' }}>
                <Body style={{ color: S.danger, fontSize: 13, margin: 0 }}>{errMsg}</Body>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <Btn variant="ghost" onClick={onClose} full={isMobile}>Cancel</Btn>
              <Btn variant="gold" onClick={handleSubmit} disabled={status === 'sending'} full>
                {status === 'sending' ? 'Sending…' : 'Send Message →'}
              </Btn>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}