// ── src/components/BriefBuilder.tsx ──

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

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

const REVISION_OPTIONS = [
  '1 revision',
  '2 revisions',
  '3 revisions (recommended)',
  'Unlimited',
]

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
        from: FROM,
        to:   designer.email,
        subject: `New brief from ${clientName} — ${project}`,
        html: `<div style="font-family:Arial;background:#131313;color:#f5f5f5;padding:32px;max-width:560px;">
          <h2 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;">You have a new project brief.</h2>
          <p style="color:#999;">${clientName} submitted a brief for <strong style="color:#f5f5f5;">${project}</strong>.</p>
          <a href="https://accracreativeshub.com"
             style="display:inline-block;background:#c9a84c;color:#131313;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;margin-top:16px;">
            View Brief →
          </a>
        </div>`,
      }),
    })
  } catch (e) { console.warn('Designer email failed:', e) }
}

interface Props {
  designer:       any
  onClose:        () => void
  onOrderCreated: (order: any) => void
}

const FL: React.CSSProperties = {
  fontFamily: S.headline, color: S.textFaint,
  fontSize: 'clamp(9px, 2.5vw, 11px)',
  letterSpacing: '0.18em', textTransform: 'uppercase',
  marginBottom: 8, display: 'block',
}

const fieldBase = (focused: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as const,
  background: focused ? 'rgba(201,168,76,0.03)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${focused ? S.gold : 'rgba(255,255,255,0.09)'}`,
  color: S.text, fontFamily: S.body, fontSize: 16,
  padding: 'clamp(12px,3vw,14px) clamp(14px,3vw,16px)',
  outline: 'none', borderRadius: 8,
  minHeight: 'clamp(48px,10vw,54px)',
  transition: 'all 0.18s ease',
  boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
})

const SelectField = ({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; placeholder: string
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
            appearance: 'none', cursor: 'pointer',
            paddingRight: 40,
            color: value ? S.text : S.textFaint,
          }}
        >
          <option value="" disabled style={{ color: S.textFaint }}>{placeholder}</option>
          {options.map(o => (
            <option key={o} value={o} style={{ background: S.bgLow, color: S.text }}>{o}</option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: 14, top: '50%',
          transform: `translateY(-50%) rotate(${f ? '180deg' : '0deg'})`,
          color: f ? S.gold : S.textFaint, fontSize: 12,
          pointerEvents: 'none', transition: 'transform 0.18s, color 0.18s',
        }}>▾</span>
      </div>

      {/* ── Rush note — only shows when Rush timeline selected ── */}
      {label.toLowerCase().includes('timeline') && value === '1–3 days (Rush)' && (
        <div style={{
          marginTop: 8,
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.18)',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚡</span>
          <p style={{
            fontFamily: S.body, margin: 0,
            fontSize: 'clamp(11px, 2.5vw, 13px)',
            color: '#fbbf24',
            lineHeight: 1.6,
          }}>
            Rush timelines may affect the designer's rate.
            Confirm final pricing with your designer in the chat before work begins.
          </p>
        </div>
      )}
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
        type={type} value={value}
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

  const [step, setStep]             = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const [form, setForm] = useState({
    category: '', projectName: '', description: '',
    budget: '', timeline: '', revisions: '', references: '',
  })

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const step1Valid = !!(form.category && form.projectName && form.description)
  const step2Valid = !!(form.budget && form.timeline && form.revisions)
  const isRush     = form.timeline === '1–3 days (Rush)'

  const parseBudgetMin = (b: string): number => {
    const match = b.match(/[\d,]+/)
    return match ? parseInt(match[0].replace(/,/g, '')) : 0
  }

  const parseRevisions = (r: string): number => {
    if (r.includes('Unlimited')) return 99
    const n = r.match(/\d/)
    return n ? parseInt(n[0]) : 3
  }

  const handleSubmit = async () => {
    if (!user)                    { setError('Please log in first.'); return }
    if (!step1Valid || !step2Valid) { setError('Please complete all required fields.'); return }

    setSubmitting(true)
    setError('')

    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          client_id:       user.id,
          designer_id:     designer.id,
          project_name:    form.projectName,
          category:        form.category,
          brief:           form.description,
          amount:          parseBudgetMin(form.budget),
          status:          'pending',
          deadline:        form.timeline,
          revisions_total: parseRevisions(form.revisions),
          rush:            isRush,
          references:      form.references || null,
        })
        .select()
        .single()

      if (orderErr) console.warn('Order insert issue:', orderErr)

      const clientName = user.user_metadata?.full_name || user.email || 'A client'
      await notifyDesigner({ email: designer.email, name: designer.name }, clientName, form.projectName)

      const finalOrder = order || {
        id:           `temp-${Date.now()}`,
        client_id:    user.id,
        designer_id:  designer.id,
        project_name: form.projectName,
        project:      form.projectName,
        category:     form.category,
        brief:        form.description,
        amount:       parseBudgetMin(form.budget),
        status:       'pending',
        deadline:     form.timeline,
        rush:         isRush,
        revisions:    { used: 0, total: parseRevisions(form.revisions) },
        designer:     designer.name,
        designerObj:  designer,
      }

      onOrderCreated(finalOrder)

    } catch (err: any) {
      console.error('Submit error:', err)
      setError('Failed to submit. Check your connection and try again.')
      setSubmitting(false)
    }
  }

  const STEPS = [
    { n: 1, label: 'Project' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Review'  },
  ]

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 290, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
        background: '#111114',
        border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '96dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -24px 64px rgba(0,0,0,0.7)',
        ...(window.innerWidth >= 640 ? {
          bottom: 'auto', top: '50%', left: '50%', right: 'auto',
          transform: 'translate(-50%, -50%)',
          borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh',
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
              <Hl style={{ fontSize: 'clamp(16px,4vw,20px)', fontWeight: 600 }}>{designer?.name}</Hl>
              <Body style={{ fontSize: 'clamp(11px,2.5vw,13px)', marginTop: 2 }}>{designer?.category}</Body>
            </div>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: S.textFaint, fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}
            >×</button>
          </div>

          {/* Step progress */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 99, marginBottom: 4,
                  background: step >= s.n ? S.gold : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.25s',
                }} />
                <span style={{
                  fontFamily: S.headline, fontSize: 9,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: step >= s.n ? S.gold : S.textFaint,
                }}>
                  {s.n}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px clamp(20px,5vw,28px)',
          WebkitOverflowScrolling: 'touch' as any,
        }}>

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
                placeholder="Describe your project, goals, audience, and style."
                rows={5}
              />
              <TextField
                label="Reference Links"
                value={form.references}
                onChange={v => f('references', v)}
                placeholder="Links to designs you like (optional)"
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

              {/* Timeline — rush note appears automatically inside SelectField */}
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
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Body style={{ fontSize: 'clamp(13px,3vw,14px)', marginBottom: 4 }}>
                Review your brief before submitting.
              </Body>

              {[
                { label: 'Designer',  value: designer?.name  },
                { label: 'Category',  value: form.category   },
                { label: 'Project',   value: form.projectName },
                { label: 'Budget',    value: form.budget     },
                { label: 'Timeline',  value: form.timeline   },
                { label: 'Revisions', value: form.revisions  },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: 'clamp(10px,2.5vw,13px) 0',
                  borderBottom: `1px solid ${S.borderFaint}`,
                  gap: 12,
                }}>
                  <Lbl style={{ fontSize: 9, marginBottom: 0, flexShrink: 0 }}>{row.label}</Lbl>
                  <span style={{
                    fontFamily: S.body,
                    color: row.label === 'Timeline' && isRush ? '#fbbf24' : S.text,
                    fontSize: 'clamp(12px,3vw,14px)',
                    textAlign: 'right', lineHeight: 1.4,
                  }}>
                    {row.value || '—'}
                    {row.label === 'Timeline' && isRush && (
                      <span style={{ marginLeft: 6, fontSize: 12 }}>⚡</span>
                    )}
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

              {/* Rush reminder on review screen */}
              {isRush && (
                <div style={{
                  background: 'rgba(251,191,36,0.06)',
                  border: '1px solid rgba(251,191,36,0.18)',
                  borderRadius: 8,
                  padding: 'clamp(12px,3vw,14px)',
                  display: 'flex', gap: 8,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>⚡</span>
                  <p style={{
                    fontFamily: S.body, color: '#fbbf24',
                    fontSize: 'clamp(11px,2.5vw,13px)',
                    margin: 0, lineHeight: 1.6,
                  }}>
                    Rush timeline selected. Confirm final pricing with your designer in the chat before work begins.
                  </p>
                </div>
              )}

              <div style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 8,
                padding: 'clamp(12px,3vw,14px)',
              }}>
                <p style={{
                  fontFamily: S.body, color: S.textMuted,
                  fontSize: 'clamp(11px,2.5vw,13px)',
                  margin: 0, lineHeight: 1.7,
                }}>
                  🔒 Your payment is held in <strong style={{ color: S.text }}>escrow</strong> until you approve the delivery. The designer will be notified immediately by email.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 8, padding: 12, marginTop: 12,
            }}>
              <p style={{ fontFamily: S.body, color: S.danger, fontSize: 'clamp(12px,3vw,13px)', margin: 0 }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'clamp(14px,4vw,20px) clamp(20px,5vw,28px)',
          borderTop: `1px solid ${S.borderFaint}`,
          display: 'flex', gap: 10, flexShrink: 0,
          background: '#111114',
        }}>
          {step > 1
            ? <Btn variant="ghost" onClick={() => { setError(''); setStep(s => (s - 1) as any) }} full>← Back</Btn>
            : <Btn variant="ghost" onClick={onClose} full>Cancel</Btn>
          }

          {step < 3 ? (
            <Btn variant="gold" onClick={() => {
              if (step === 1 && !step1Valid) { setError('Please fill in all required fields.'); return }
              if (step === 2 && !step2Valid) { setError('Please fill in all required fields.'); return }
              setError('')
              setStep(s => (s + 1) as any)
            }} full>
              Next: {step === 1 ? 'Project Details' : 'Review Brief'} →
            </Btn>
          ) : (
            <Btn variant="gold" onClick={handleSubmit} disabled={submitting} full>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#131313',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Submitting…
                </span>
              ) : 'Submit Brief →'}
            </Btn>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </>
  )
}