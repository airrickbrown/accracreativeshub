// ── src/components/BriefBuilder.tsx ──
// Fixed:
// - Mobile text sizing — all fields readable on small screens
// - Project category has placeholder + only platform-relevant categories
// - All dropdowns have clear visual indicator (▾)
// - Short, precise placeholder text — no walls of text
// - Loading spinner on submit
// - Designer notified via email (Resend) when brief submitted
// - Brief data saved to Supabase orders table

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, GoldLine } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

// ── Platform categories only ──
const CATEGORIES = [
  'Logo Design',
  'Business Branding',
  'Flyer Design',
  'Social Media Design',
  'UI/UX Design',
  'Motion Graphics',
]

const BUDGETS = [
  'GH₵ 200 – 500',
  'GH₵ 500 – 1,000',
  'GH₵ 1,000 – 2,500',
  'GH₵ 2,500 – 5,000',
  'GH₵ 5,000+',
]

const TIMELINES = [
  '1–3 days (Rush)',
  '3–7 days',
  '1–2 weeks',
  '2–4 weeks',
  'Flexible',
]

const REVISION_OPTIONS = ['1 revision', '2 revisions', '3 revisions (recommended)', 'Unlimited']

// @ts-ignore
const RESEND_KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''
const FROM = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'

async function notifyDesigner(designer: any, clientName: string, project: string) {
  const key = RESEND_KEY()
  if (!key || !designer?.email) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM,
        to:      designer.email,
        subject: `New brief from ${clientName} — ${project}`,
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
<tr><td style="padding:28px 36px 20px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.1);">
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:18px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:32px 36px;">
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:20px;margin:0 0 12px;">
    You have a new project brief, ${designer.name?.split(' ')[0] || 'there'}.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
    <strong style="color:#f5f5f5;">${clientName}</strong> has submitted a brief for your services.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:0 0 20px;">
    <p style="color:#aaa;font-size:13px;margin:0 0 6px;"><strong style="color:#f5f5f5;">Project:</strong> ${project}</p>
  </div>
  <a href="https://accracreativeshub.com"
     style="display:inline-block;background:#c9a84c;color:#131313;font-family:Arial;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:13px 28px;border-radius:8px;">
    View Brief & Respond →
  </a>
  <p style="color:#666;font-size:12px;margin:20px 0 0;line-height:1.6;">
    Log in to your dashboard to review the full brief and respond to the client.<br/>
    Responding quickly improves your visibility on the platform.
  </p>
</td></tr>
<tr><td style="background:#0d0d0d;padding:18px 36px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }),
    })
  } catch (e) {
    console.warn('Designer notification failed (non-fatal):', e)
  }
}

interface Props {
  designer:       any
  onClose:        () => void
  onOrderCreated: (order: any) => void
}

// Shared field label style
const FL: React.CSSProperties = {
  fontFamily:     S.headline,
  color:          S.textFaint,
  fontSize:       'clamp(9px, 2.5vw, 11px)',
  letterSpacing:  '0.18em',
  textTransform:  'uppercase',
  marginBottom:   8,
  display:        'block',
}

// Shared input/select/textarea base style
const fieldBase = (focused: boolean): React.CSSProperties => ({
  width:         '100%',
  boxSizing:     'border-box' as const,
  background:    focused ? 'rgba(201,168,76,0.03)' : 'rgba(255,255,255,0.04)',
  border:        `1px solid ${focused ? S.gold : 'rgba(255,255,255,0.09)'}`,
  color:         S.text,
  fontFamily:    S.body,
  fontSize:      16,   // 16px minimum prevents iOS zoom
  padding:       'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 16px)',
  outline:       'none',
  borderRadius:  8,
  minHeight:     'clamp(48px, 10vw, 54px)',
  transition:    'all 0.18s ease',
  boxShadow:     focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
})

// Select with dropdown arrow indicator
const SelectField = ({ label, value, onChange, options, placeholder }: {
  label:       string
  value:       string
  onChange:    (v: string) => void
  options:     string[]
  placeholder: string
}) => {
  const [f, setF] = useState(false)
  return (
    <div>
      <span style={FL}>{label}</span>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{
            ...fieldBase(f),
            appearance: 'none',
            cursor: 'pointer',
            paddingRight: 40,
            color: value ? S.text : S.textFaint,
          }}
        >
          <option value="" disabled style={{ color: S.textFaint }}>{placeholder}</option>
          {options.map(o => (
            <option key={o} value={o} style={{ background: S.bgLow, color: S.text }}>{o}</option>
          ))}
        </select>
        {/* Dropdown arrow — makes it clear this is a dropdown */}
        <span style={{
          position: 'absolute', right: 14, top: '50%',
          transform: `translateY(-50%) rotate(${f ? '180deg' : '0deg'})`,
          color: f ? S.gold : S.textFaint,
          fontSize: 12, pointerEvents: 'none',
          transition: 'transform 0.18s, color 0.18s',
        }}>▾</span>
      </div>
    </div>
  )
}

const TextField = ({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string
}) => {
  const [f, setF] = useState(false)
  return (
    <div>
      <span style={FL}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={fieldBase(f)}
      />
    </div>
  )
}

const TextAreaField = ({ label, value, onChange, placeholder, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; rows?: number
}) => {
  const [f, setF] = useState(false)
  return (
    <div>
      <span style={FL}>{label}</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{ ...fieldBase(f), resize: 'vertical', minHeight: 100, lineHeight: 1.7 }}
      />
    </div>
  )
}

export default function BriefBuilder({ designer, onClose, onOrderCreated }: Props) {
  const { user } = useAuth()

  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState({
    category:   '',
    projectName: '',
    description: '',
    budget:      '',
    timeline:    '',
    revisions:   '',
    references:  '',
    rush:        false,
  })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const step1Valid = form.category && form.projectName && form.description
  const step2Valid = form.budget && form.timeline && form.revisions
  const allValid   = step1Valid && step2Valid

  const handleSubmit = async () => {
    if (!user) { setError('Please log in to submit a brief.'); return }
    if (!allValid)    { setError('Please complete all required fields.'); return }

    setSubmitting(true); setError('')

    try {
      // Save order to Supabase
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          client_id:    user.id,
          designer_id:  designer.id,
          project_name: form.projectName,
          category:     form.category,
          brief:        form.description,
          amount:       parseBudgetMin(form.budget),
          status:       'pending',
          deadline:     form.timeline,
          revisions_total: parseRevisions(form.revisions),
          rush:         form.rush,
          references:   form.references,
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Notify designer via email (works even when offline)
      const clientName = user.user_metadata?.full_name || user.email || 'A client'
      await notifyDesigner(
        { email: designer.email, name: designer.name },
        clientName,
        form.projectName
      )

      onOrderCreated(order)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit brief. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const parseBudgetMin = (b: string): number => {
    const match = b.match(/[\d,]+/)
    return match ? parseInt(match[0].replace(',', '')) : 0
  }

  const parseRevisions = (r: string): number => {
    if (r.includes('Unlimited')) return 99
    const n = r.match(/\d/)
    return n ? parseInt(n[0]) : 3
  }

  const STEPS = [
    { n: 1, label: 'Project' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Review'  },
  ]

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 290, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 300,
        background: '#111114',
        border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '96dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -24px 64px rgba(0,0,0,0.7)',
        // Desktop: centered modal
        ...(window.innerWidth >= 640 ? {
          bottom: 'auto', top: '50%', left: '50%', right: 'auto',
          transform: 'translate(-50%, -50%)',
          borderRadius: 16, width: '100%', maxWidth: 560,
          maxHeight: '90vh',
        } : {}),
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: 'clamp(14px,4vw,20px) clamp(20px,5vw,28px) 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Lbl style={{ marginBottom: 6, fontSize: 9 }}>New Brief</Lbl>
              <Hl style={{ fontSize: 'clamp(16px,4vw,20px)', fontWeight: 600 }}>
                {designer?.name}
              </Hl>
              <Body style={{ fontSize: 'clamp(11px,2.5vw,13px)', marginTop: 2 }}>
                {designer?.category}
              </Body>
            </div>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: S.textFaint, fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}
            >×</button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 99, marginBottom: 4,
                  background: step >= s.n ? S.gold : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.25s',
                }} />
                <span style={{
                  fontFamily: S.headline,
                  fontSize: 9, letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: step >= s.n ? S.gold : S.textFaint,
                  transition: 'color 0.25s',
                }}>
                  {s.n}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px clamp(20px,5vw,28px)', WebkitOverflowScrolling: 'touch' as any }}>

          {/* ── Step 1: Project ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SelectField
                label="Service Category *"
                value={form.category}
                onChange={v => f('category', v)}
                options={CATEGORIES}
                placeholder="Select a category ▾"
              />
              <TextField
                label="Project Name *"
                value={form.projectName}
                onChange={v => f('projectName', v)}
                placeholder="e.g. Brand identity for my startup"
              />
              <TextAreaField
                label="Project Description *"
                value={form.description}
                onChange={v => f('description', v)}
                placeholder="Describe what you need. Include goals, audience, and any style references."
                rows={5}
              />
              <TextField
                label="Reference Links"
                value={form.references}
                onChange={v => f('references', v)}
                placeholder="Paste links to designs you like (optional)"
              />
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SelectField
                label="Budget Range *"
                value={form.budget}
                onChange={v => f('budget', v)}
                options={BUDGETS}
                placeholder="Select your budget ▾"
              />
              <SelectField
                label="Timeline *"
                value={form.timeline}
                onChange={v => f('timeline', v)}
                options={TIMELINES}
                placeholder="Select a timeline ▾"
              />
              <SelectField
                label="Revision Rounds *"
                value={form.revisions}
                onChange={v => f('revisions', v)}
                options={REVISION_OPTIONS}
                placeholder="How many revisions? ▾"
              />

              {/* Rush toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: form.rush ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.rush ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, padding: 'clamp(12px,3vw,16px)',
                cursor: 'pointer', transition: 'all 0.18s',
              }} onClick={() => f('rush', !form.rush)}>
                <div>
                  <span style={{ fontFamily: S.headline, fontSize: 'clamp(12px,3vw,14px)', color: S.text, display: 'block', marginBottom: 3 }}>
                    Rush Delivery
                  </span>
                  <span style={{ fontFamily: S.body, fontSize: 'clamp(11px,2.5vw,12px)', color: S.textMuted }}>
                    Faster turnaround — may affect price
                  </span>
                </div>
                <div style={{
                  width: 44, height: 24, borderRadius: 99,
                  background: form.rush ? S.gold : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: form.rush ? 23 : 3,
                    width: 18, height: 18,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Body style={{ fontSize: 'clamp(13px,3vw,14px)', marginBottom: 4 }}>
                Review your brief before submitting.
              </Body>

              {[
                { label: 'Designer',     value: designer?.name           },
                { label: 'Category',     value: form.category            },
                { label: 'Project',      value: form.projectName         },
                { label: 'Budget',       value: form.budget              },
                { label: 'Timeline',     value: form.timeline            },
                { label: 'Revisions',    value: form.revisions           },
                { label: 'Rush',         value: form.rush ? 'Yes' : 'No' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: 'clamp(10px,2.5vw,13px) 0',
                  borderBottom: `1px solid ${S.borderFaint}`,
                  gap: 12,
                }}>
                  <Lbl style={{ fontSize: 9, marginBottom: 0, flexShrink: 0 }}>{row.label}</Lbl>
                  <span style={{
                    fontFamily: S.body, color: S.text,
                    fontSize: 'clamp(12px,3vw,14px)',
                    textAlign: 'right', lineHeight: 1.4,
                  }}>
                    {row.value || '—'}
                  </span>
                </div>
              ))}

              {form.description && (
                <div style={{ marginTop: 4 }}>
                  <Lbl style={{ fontSize: 9, marginBottom: 6 }}>Description</Lbl>
                  <p style={{
                    fontFamily: S.body, color: S.textMuted,
                    fontSize: 'clamp(12px,3vw,14px)',
                    lineHeight: 1.7, margin: 0,
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12, borderRadius: 8,
                  }}>
                    {form.description}
                  </p>
                </div>
              )}

              {/* Security note */}
              <div style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 8,
                padding: 'clamp(12px,3vw,14px)',
                marginTop: 4,
              }}>
                <p style={{ fontFamily: S.body, color: S.textMuted, fontSize: 'clamp(11px,2.5vw,13px)', margin: 0, lineHeight: 1.7 }}>
                  🔒 Your payment is held in <strong style={{ color: S.text }}>escrow</strong> until you approve the final delivery. The designer will be notified immediately by email.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 8, padding: 12, marginTop: 12 }}>
              <p style={{ fontFamily: S.body, color: S.danger, fontSize: 'clamp(12px,3vw,13px)', margin: 0 }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: 'clamp(14px,4vw,20px) clamp(20px,5vw,28px)',
          borderTop: `1px solid ${S.borderFaint}`,
          display: 'flex', gap: 10, flexShrink: 0,
          background: '#111114',
        }}>
          {step > 1 && (
            <Btn variant="ghost" onClick={() => setStep(s => (s - 1) as any)} full>← Back</Btn>
          )}
          {step === 1 && (
            <Btn variant="ghost" onClick={onClose} full>Cancel</Btn>
          )}

          {step < 3 ? (
            <Btn
              variant="gold"
              onClick={() => {
                if (step === 1 && !step1Valid) { setError('Fill in all required fields.'); return }
                setError('')
                setStep(s => (s + 1) as any)
              }}
              full
            >
              Next: {step === 1 ? 'Project Details' : 'Review Brief'} →
            </Btn>
          ) : (
            <Btn variant="gold" onClick={handleSubmit} disabled={submitting} full>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#131313', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Submitting…
                </span>
              ) : 'Submit Brief →'}
            </Btn>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  )
}