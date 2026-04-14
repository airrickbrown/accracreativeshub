// ── src/components/ContactPage.tsx ──
// Fully responsive contact form.
// Text scales fluidly from mobile to desktop using clamp().
// No fixed pixel sizes that break on small screens.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'

const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM_ADDR  = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const TO_ADDR    = 'hello@accracreativeshub.com'

interface ContactPageProps { onClose: () => void }
type Status = 'idle' | 'sending' | 'sent' | 'error'

const SUBJECTS = [
  'General Enquiry',
  'Hiring a Designer',
  'Designer Application',
  'Payment / Billing',
  'Dispute',
  'Partnership',
  'Other',
]

export default function ContactPage({ onClose }: ContactPageProps) {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [focused, setFocused] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  // Shared input style — readable on all sizes
  const inp = (active: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? S.gold : 'rgba(255,255,255,0.09)'}`,
    color: S.text,
    // 16px minimum prevents iOS from zooming in on focus
    fontSize: 16,
    fontFamily: S.body,
    padding: 'clamp(13px, 3.5vw, 16px) clamp(14px, 4vw, 18px)',
    outline: 'none',
    borderRadius: 8,
    minHeight: 'clamp(48px, 10vw, 56px)',
    transition: 'border-color 0.2s',
    lineHeight: 1.5,
  })

  const handleSubmit = async () => {
    if (!form.name.trim())    { setErrMsg('Please enter your name.'); return }
    if (!form.email.trim())   { setErrMsg('Please enter your email.'); return }
    if (!form.subject)        { setErrMsg('Please select a subject.'); return }
    if (!form.message.trim()) { setErrMsg('Please enter your message.'); return }

    setStatus('sending'); setErrMsg('')

    const key = RESEND_KEY()
    if (!key) {
      setErrMsg('Email service unavailable. Please email hello@accracreativeshub.com directly.')
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
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     FROM_ADDR,
          to:       TO_ADDR,
          reply_to: form.email,
          subject:  `[Contact] ${form.subject} — ${form.name}`,
          html: `<div style="font-family:Arial;max-width:600px;background:#f5f5f5;padding:32px;">
            <h2 style="color:#131313;margin:0 0 20px;">New Contact Submission</h2>
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
        method:  'POST',
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
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:36px 40px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">Message received, ${firstName}.</h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">Thank you for reaching out about <strong style="color:#f5f5f5;">${form.subject}</strong>. We will get back to you within <strong style="color:#f5f5f5;">1–2 business days</strong>.</p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:16px 0;">
    <p style="color:#888;font-size:12px;margin:0 0 6px;font-weight:600;">Your message:</p>
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;white-space:pre-wrap;">${preview}</p>
  </div>
  <p style="color:#666;font-size:13px;margin:20px 0 0;">For urgent matters: <a href="mailto:hello@accracreativeshub.com" style="color:#c9a84c;">hello@accracreativeshub.com</a></p>
</td></tr>
<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">© ${year} Accra Creatives Hub · Accra, Ghana</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
        }),
      })

      setStatus('sent')
    } catch (err: any) {
      setErrMsg('Failed to send. Please email hello@accracreativeshub.com directly.')
      setStatus('error')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: S.bgDeep, overflowY: 'auto',
      // Smooth scroll on iOS
      WebkitOverflowScrolling: 'touch' as any,
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        // Generous top padding so content clears the nav
        padding: isMobile ? '80px 20px 60px' : '110px 40px 80px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(28px, 6vw, 44px)' }}>
          <Lbl style={{ marginBottom: 'clamp(10px, 3vw, 16px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>
            Get in Touch
          </Lbl>
          <h1 style={{
            fontFamily: S.headline,
            fontWeight: 300,
            color: S.text,
            fontSize: 'clamp(30px, 8vw, 52px)',
            lineHeight: 1.1,
            margin: '0 0 clamp(12px, 3vw, 18px)',
          }}>
            We&apos;d love to
            <br />
            <em style={{ fontStyle: 'italic', color: S.gold }}>hear from you.</em>
          </h1>
          <GoldLine />
          <p style={{
            fontFamily: S.body,
            color: S.textMuted,
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            lineHeight: 1.8,
            margin: 0,
            maxWidth: 480,
          }}>
            Questions, partnerships, or support — we respond within 1–2 business days.
          </p>
        </div>

        {/* Email contacts grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 1,
          background: S.borderFaint,
          marginBottom: 'clamp(24px, 6vw, 40px)',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          {[
            { l: 'General',   e: 'hello@accracreativeshub.com'     },
            { l: 'Designers', e: 'designers@accracreativeshub.com' },
            { l: 'Clients',   e: 'clients@accracreativeshub.com'   },
            { l: 'Disputes',  e: 'disputes@accracreativeshub.com'  },
          ].map(c => (
            <div key={c.l} style={{ background: S.bgLow, padding: 'clamp(12px, 3vw, 16px)' }}>
              <div style={{
                fontFamily: S.headline,
                color: S.textFaint,
                fontSize: 'clamp(8px, 1.5vw, 9px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                {c.l}
              </div>
              <a
                href={`mailto:${c.e}`}
                style={{
                  color: S.gold,
                  // Readable on mobile — not tiny
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  fontFamily: S.body,
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                  display: 'block',
                  lineHeight: 1.5,
                }}
              >
                {c.e}
              </a>
            </div>
          ))}
        </div>

        {/* Success state */}
        {status === 'sent' ? (
          <div style={{
            background: 'rgba(74,154,74,0.08)',
            border: '1px solid rgba(74,154,74,0.25)',
            borderRadius: 12,
            padding: 'clamp(28px, 7vw, 44px) clamp(20px, 5vw, 36px)',
            textAlign: 'center',
          }}>
            <div style={{ color: '#4ade80', fontSize: 'clamp(40px, 10vw, 56px)', marginBottom: 16 }}>✓</div>
            <h2 style={{
              fontFamily: S.headline,
              color: S.text,
              fontWeight: 400,
              fontSize: 'clamp(20px, 5vw, 26px)',
              margin: '0 0 12px',
            }}>
              Message sent.
            </h2>
            <p style={{
              fontFamily: S.body,
              color: S.textMuted,
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              lineHeight: 1.8,
              margin: '0 0 24px',
            }}>
              A confirmation was sent to <strong style={{ color: S.text }}>{form.email}</strong>.<br />
              We'll reply within 1–2 business days.
            </p>
            <Btn variant="gold" onClick={onClose}>Back to Platform →</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 4vw, 20px)' }}>

            {/* Name + Email row — stacked on mobile, side by side on desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 'clamp(14px, 4vw, 18px)',
            }}>
              {[
                { k: 'name',  l: 'Full Name',     t: 'text',  p: 'e.g. Kofi Mensah'  },
                { k: 'email', l: 'Email Address',  t: 'email', p: 'your@email.com'    },
              ].map(fd => (
                <div key={fd.k}>
                  <div style={{
                    fontFamily: S.headline,
                    color: S.textFaint,
                    fontSize: 'clamp(9px, 2vw, 11px)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    {fd.l}
                  </div>
                  <input
                    type={fd.t}
                    value={(form as any)[fd.k]}
                    onChange={e => f(fd.k, e.target.value)}
                    placeholder={fd.p}
                    onFocus={() => setFocused(fd.k)}
                    onBlur={() => setFocused('')}
                    style={inp(focused === fd.k)}
                  />
                </div>
              ))}
            </div>

            {/* Subject */}
            <div>
              <div style={{
                fontFamily: S.headline,
                color: S.textFaint,
                fontSize: 'clamp(9px, 2vw, 11px)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Subject
              </div>
              <select
                value={form.subject}
                onChange={e => f('subject', e.target.value)}
                onFocus={() => setFocused('subject')}
                onBlur={() => setFocused('')}
                style={{
                  ...inp(focused === 'subject'),
                  color: form.subject ? S.text : S.textFaint,
                  cursor: 'pointer',
                  appearance: 'none' as any,
                }}
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map(s => (
                  <option key={s} value={s} style={{ background: S.bgLow, color: S.text }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <div style={{
                fontFamily: S.headline,
                color: S.textFaint,
                fontSize: 'clamp(9px, 2vw, 11px)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Message
              </div>
              <textarea
                value={form.message}
                onChange={e => f('message', e.target.value)}
                placeholder="Tell us how we can help…"
                rows={isMobile ? 5 : 7}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused('')}
                style={{
                  ...inp(focused === 'message'),
                  resize: 'vertical',
                  lineHeight: 1.7,
                  minHeight: 'clamp(120px, 25vw, 180px)',
                }}
              />
            </div>

            {/* Notice */}
            <div style={{
              background: 'rgba(201,168,76,0.05)',
              border: '1px solid rgba(201,168,76,0.12)',
              borderRadius: 8,
              padding: 'clamp(12px, 3vw, 16px)',
            }}>
              <p style={{
                fontFamily: S.body,
                color: S.textMuted,
                fontSize: 'clamp(13px, 3vw, 15px)',
                margin: 0,
                lineHeight: 1.7,
              }}>
                📬 A confirmation email will be sent to you immediately. We aim to reply within{' '}
                <strong style={{ color: S.text }}>1–2 business days</strong>.
              </p>
            </div>

            {/* Error */}
            {errMsg && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                borderRadius: 8,
                padding: 'clamp(12px, 3vw, 16px)',
              }}>
                <p style={{
                  fontFamily: S.body,
                  color: S.danger,
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {errMsg}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 'clamp(10px, 3vw, 14px)',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <Btn variant="ghost" onClick={onClose} full={isMobile}>Cancel</Btn>
              <Btn
                variant="gold"
                onClick={handleSubmit}
                disabled={status === 'sending'}
                full
              >
                {status === 'sending' ? 'Sending…' : 'Send Message →'}
              </Btn>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}