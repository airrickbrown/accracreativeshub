// ── src/components/BriefBuilder.tsx ──
// Hire Designer flow with:
// ✅ Step validation — blocks progression if required fields empty
// ✅ Proper placeholders on all fields
// ✅ Save Draft — persists to localStorage with recovery prompt
// ✅ Draft recovery modal on open
// ✅ Confirmation before closing/abandoning

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Sel, Txt, Hl, Body, Lbl, GoldLine } from './UI'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface BriefBuilderProps {
  designer:        any
  onClose:         () => void
  onOrderCreated:  (order: any) => void
}

// ── Required fields per step ──
const REQUIRED: Record<number, { key: string; label: string }[]> = {
  1: [
    { key: 'category',    label: 'Project Category'  },
    { key: 'title',       label: 'Project Title'      },
    { key: 'description', label: 'Project Description' },
  ],
  2: [
    { key: 'industry',  label: 'Industry'  },
    { key: 'audience',  label: 'Target Audience' },
    { key: 'tone',      label: 'Brand Tone' },
  ],
  3: [
    { key: 'budget',   label: 'Budget'   },
    { key: 'deadline', label: 'Deadline' },
  ],
}

const DRAFT_KEY = (designerId: any) => `brief_draft_${designerId}`

const EMPTY_FORM = {
  category:    '',
  title:       '',
  description: '',
  industry:    '',
  audience:    '',
  tone:        '',
  colours:     '',
  references:  '',
  budget:      '',
  deadline:    '',
  rush:        false,
  notes:       '',
}

export default function BriefBuilder({ designer, onClose, onOrderCreated }: BriefBuilderProps) {
  const { user } = useAuth()
  const [step, setStep]               = useState(1)
  const [form, setForm]               = useState({ ...EMPTY_FORM })
  const [stepError, setStepError]     = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [savedDraft, setSavedDraft]   = useState<any>(null)
  const [isMobile, setIsMobile]       = useState(false)

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Check for saved draft on open ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY(designer?.id))
      if (raw) {
        const draft = JSON.parse(raw)
        // Only show draft prompt if it has content
        if (draft.form && Object.values(draft.form).some((v: any) => v !== '' && v !== false)) {
          setSavedDraft(draft)
          setShowDraftModal(true)
        }
      }
    } catch { /* ignore */ }
  }, [designer?.id])

  // ── Validation ──
  const validate = (s: number): string | null => {
    const required = REQUIRED[s] || []
    for (const field of required) {
      const val = (form as any)[field.key]
      if (!val || (typeof val === 'string' && !val.trim())) {
        return `${field.label} is required.`
      }
    }
    return null
  }

  const handleContinue = () => {
    const err = validate(step)
    if (err) { setStepError(err); return }
    setStepError(null)
    setStep(s => s + 1)
  }

  // ── Save Draft ──
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY(designer?.id), JSON.stringify({ form, step, savedAt: new Date().toISOString() }))
      setStepError(null)
      alert('Draft saved! You can resume this brief next time you open it.')
    } catch {
      alert('Could not save draft.')
    }
  }

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY(designer?.id)) } catch { /* ignore */ }
  }

  const resumeDraft = () => {
    if (!savedDraft) return
    setForm(savedDraft.form || EMPTY_FORM)
    setStep(savedDraft.step || 1)
    setShowDraftModal(false)
  }

  const startFresh = () => {
    clearDraft()
    setForm({ ...EMPTY_FORM })
    setStep(1)
    setShowDraftModal(false)
  }

  // ── Handle close with confirmation ──
  const handleClose = () => {
    const hasContent = Object.values(form).some((v: any) => v !== '' && v !== false)
    if (hasContent) {
      setShowAbandonModal(true)
    } else {
      clearDraft()
      onClose()
    }
  }

  // ── Submit ──
  const handleSubmit = async () => {
    const err = validate(3)
    if (err) { setStepError(err); return }
    if (!user) { alert('Please log in to submit a brief.'); return }

    setSubmitting(true)
    try {
      const brief = `Category: ${form.category}\n\nProject: ${form.title}\n\nDescription: ${form.description}\n\nIndustry: ${form.industry}\nAudience: ${form.audience}\nTone: ${form.tone}\n\nColours: ${form.colours || 'Not specified'}\nReferences: ${form.references || 'None'}\n\nNotes: ${form.notes || 'None'}`

      const { data, error } = await supabase.from('orders').insert([{
        client_id:    user.id,
        designer_id:  designer.id,
        project_name: form.title,
        brief,
        amount:       Number(form.budget) || 0,
        rush:         form.rush,
        deadline:     form.deadline,
        status:       'pending',
        revisions_used:  0,
        revisions_total: 3,
      }]).select().single()

      if (error) { alert(error.message); setSubmitting(false); return }

      clearDraft()
      onOrderCreated(data)
    } catch (err: any) {
      alert(err?.message || 'Failed to submit brief. Please try again.')
    }
    setSubmitting(false)
  }

  const STEPS = ['Project Details', 'Brand & Audience', 'Budget & Timeline', 'Review']

  const CATEGORY_OPTIONS = [
    '',
    'Logo Design',
    'Business Branding',
    'Flyer Design',
    'Social Media Design',
    'UI/UX Design',
    'Motion Graphics',
    'Print Design',
    'Packaging Design',
  ]

  const TONE_OPTIONS = [
    '',
    'Professional & Corporate',
    'Bold & Energetic',
    'Elegant & Luxury',
    'Friendly & Approachable',
    'Minimalist & Clean',
    'Playful & Creative',
    'Traditional & Cultural',
  ]

  const BUDGET_OPTIONS = [
    '',
    'GH₵50 – GH₵150',
    'GH₵150 – GH₵300',
    'GH₵300 – GH₵600',
    'GH₵600 – GH₵1,000',
    'GH₵1,000 – GH₵2,000',
    'GH₵2,000+',
    'Open to discussion',
  ]

  const DEADLINE_OPTIONS = [
    '',
    '24 hours (Rush)',
    '2–3 days',
    '1 week',
    '2 weeks',
    '1 month',
    'Flexible',
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: S.bgDeep, overflowY: 'auto' }}>

      {/* ── Draft recovery modal ── */}
      {showDraftModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.gold}30`, padding: isMobile ? '24px 20px' : '32px 36px', maxWidth: 440, width: '100%', borderRadius: S.radiusLg }}>
            <Lbl style={{ marginBottom: 10, color: S.gold }}>Draft Found</Lbl>
            <Hl style={{ fontSize: 20, marginBottom: 10 }}>Continue your brief?</Hl>
            {savedDraft?.savedAt && (
              <Body style={{ fontSize: 12, marginBottom: 16 }}>
                Saved {new Date(savedDraft.savedAt).toLocaleString()}
              </Body>
            )}
            <Body style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.8 }}>
              You have a saved draft for <strong style={{ color: S.text }}>{designer?.name}</strong>. Would you like to continue where you left off?
            </Body>
            <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
              <Btn variant="ghost" full onClick={startFresh}>Start Fresh</Btn>
              <Btn variant="gold"  full onClick={resumeDraft}>Continue Draft →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Abandon confirmation ── */}
      {showAbandonModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '24px 20px' : '32px 36px', maxWidth: 400, width: '100%', borderRadius: S.radiusLg }}>
            <Hl style={{ fontSize: 20, marginBottom: 10 }}>Leave without saving?</Hl>
            <Body style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.8 }}>Your brief progress will be lost unless you save a draft first.</Body>
            <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
              <Btn variant="ghost"   full onClick={() => setShowAbandonModal(false)}>Keep Editing</Btn>
              <Btn variant="outline" full onClick={() => { saveDraft(); setShowAbandonModal(false); onClose() }}>Save Draft & Exit</Btn>
              <Btn variant="danger"  full onClick={() => { clearDraft(); onClose() }}>Discard & Exit</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '48px 40px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Lbl style={{ marginBottom: 10, color: S.gold }}>Hiring {designer?.name}</Lbl>
            <Hl style={{ fontSize: isMobile ? 28 : 40, fontWeight: 300, lineHeight: 1.1 }}>
              Build Your Brief
            </Hl>
            <GoldLine />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn variant="ghost" size="sm" onClick={saveDraft}>Save Draft</Btn>
            <Btn variant="ghost" size="sm" onClick={handleClose}>✕ Close</Btn>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36, background: S.borderFaint }}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const active = n === step
            const done   = n < step
            return (
              <div
                key={n}
                onClick={() => done ? setStep(n) : undefined}
                style={{
                  flex: 1, padding: isMobile ? '10px 4px' : '14px 8px', textAlign: 'center',
                  background: active ? S.goldDim : done ? 'rgba(201,168,76,0.06)' : S.bgLow,
                  borderRight: i < 3 ? `1px solid ${S.borderFaint}` : 'none',
                  cursor: done ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ color: active ? S.gold : done ? S.gold : S.textFaint, fontSize: isMobile ? 9 : 10, fontFamily: S.headline, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {done ? '✓ ' : `${n}. `}{!isMobile && label}
                </div>
                {isMobile && <div style={{ color: active ? S.gold : S.textFaint, fontSize: 7, marginTop: 2, fontFamily: S.headline }}>{label}</div>}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Project Details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>Project Details</Hl>
            <Body style={{ fontSize: 13, color: S.textMuted }}>Tell your designer what you need. Be as specific as possible.</Body>

            <Sel
              label="Project Category *"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(v: string) => f('category', v)}
            />

            <Inp
              label="Project Title *"
              placeholder="e.g. Logo for my fashion brand Kente & Co."
              value={form.title}
              onChange={(v: string) => f('title', v)}
            />

            <Txt
              label="Project Description *"
              placeholder="Describe what you need in detail. Include what the design will be used for, any specific requirements, what you like or dislike about similar designs, and what makes your brand unique..."
              value={form.description}
              onChange={(v: string) => f('description', v)}
              rows={5}
            />

            <Txt
              label="Reference Links or Inspiration"
              placeholder="Links to logos, websites, or designs you like (e.g. Behance links, Instagram posts, competitor brands)..."
              value={form.references}
              onChange={(v: string) => f('references', v)}
              rows={3}
            />
          </div>
        )}

        {/* ── STEP 2: Brand & Audience ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>Brand & Audience</Hl>
            <Body style={{ fontSize: 13, color: S.textMuted }}>Help your designer understand your world.</Body>

            <Inp
              label="Industry / Sector *"
              placeholder="e.g. Fashion, Real Estate, Food & Beverage, Tech Startup, Healthcare..."
              value={form.industry}
              onChange={(v: string) => f('industry', v)}
            />

            <Inp
              label="Target Audience *"
              placeholder="e.g. Young professionals aged 25–35 in Accra, luxury shoppers, students..."
              value={form.audience}
              onChange={(v: string) => f('audience', v)}
            />

            <Sel
              label="Brand Tone / Personality *"
              options={TONE_OPTIONS}
              value={form.tone}
              onChange={(v: string) => f('tone', v)}
            />

            <Inp
              label="Preferred Colours"
              placeholder="e.g. Gold and black, earthy tones, our brand colours are #C9A84C and #131313..."
              value={form.colours}
              onChange={(v: string) => f('colours', v)}
            />
          </div>
        )}

        {/* ── STEP 3: Budget & Timeline ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>Budget & Timeline</Hl>
            <Body style={{ fontSize: 13, color: S.textMuted }}>Be realistic — quality takes time and investment.</Body>

            <Sel
              label="Budget Range *"
              options={BUDGET_OPTIONS}
              value={form.budget}
              onChange={(v: string) => f('budget', v)}
            />

            <Sel
              label="Deadline *"
              options={DEADLINE_OPTIONS}
              value={form.deadline}
              onChange={(v: string) => f('deadline', v)}
            />

            {/* Rush toggle */}
            <div
              onClick={() => f('rush', !form.rush)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: form.rush ? 'rgba(252,211,77,0.08)' : S.surface,
                border: `1px solid ${form.rush ? 'rgba(252,211,77,0.3)' : S.borderFaint}`,
                padding: '16px 20px', cursor: 'pointer', borderRadius: S.radiusSm,
                transition: 'all 0.2s',
              }}
            >
              <div>
                <Hl style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>⚡ Rush Order</Hl>
                <Body style={{ fontSize: 12, margin: 0 }}>Needed within 24–48 hours. May incur a rush fee.</Body>
              </div>
              <div style={{ width: 44, height: 24, background: form.rush ? S.gold : S.borderFaint, borderRadius: 12, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.rush ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
              </div>
            </div>

            <Txt
              label="Additional Notes"
              placeholder="Anything else your designer should know. Files you'll provide, file formats you need, number of revisions expected, languages to include..."
              value={form.notes}
              onChange={(v: string) => f('notes', v)}
              rows={3}
            />
          </div>
        )}

        {/* ── STEP 4: Review & Submit ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>Review Your Brief</Hl>
            <Body style={{ fontSize: 13, color: S.textMuted }}>Check everything before sending to {designer?.name}.</Body>

            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px' }}>
              {/* Designer preview */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${S.borderFaint}` }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${S.gold}40`, flexShrink: 0 }}>
                  <img src={designer?.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)' }} />
                </div>
                <div>
                  <Hl style={{ fontSize: 16, fontWeight: 600 }}>{designer?.name}</Hl>
                  <Body style={{ fontSize: 12, margin: 0 }}>{designer?.category} · Starting at GH₵{designer?.price}</Body>
                </div>
              </div>

              {/* Brief summary */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {[
                  { l: 'Category',   v: form.category    },
                  { l: 'Title',      v: form.title        },
                  { l: 'Industry',   v: form.industry     },
                  { l: 'Audience',   v: form.audience     },
                  { l: 'Tone',       v: form.tone         },
                  { l: 'Budget',     v: form.budget       },
                  { l: 'Deadline',   v: form.deadline     },
                  { l: 'Rush Order', v: form.rush ? '⚡ Yes' : 'No' },
                ].map(item => (
                  <div key={item.l}>
                    <Lbl style={{ marginBottom: 4, fontSize: 8 }}>{item.l}</Lbl>
                    <Body style={{ fontSize: 13, margin: 0, color: S.text }}>{item.v || '—'}</Body>
                  </div>
                ))}
              </div>

              {form.description && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${S.borderFaint}` }}>
                  <Lbl style={{ marginBottom: 8, fontSize: 8 }}>Description</Lbl>
                  <Body style={{ fontSize: 13, lineHeight: 1.8 }}>{form.description}</Body>
                </div>
              )}
            </div>

            {/* Escrow notice */}
            <div style={{ background: 'rgba(74,154,74,0.06)', border: '1px solid rgba(74,154,74,0.2)', padding: '14px 18px', borderRadius: S.radiusSm }}>
              <Body style={{ fontSize: 12, margin: 0, lineHeight: 1.8 }}>
                🔒 <strong style={{ color: S.text }}>Secure Escrow:</strong> Your payment will be held safely until you approve the final work. You only release funds when you're satisfied.
              </Body>
            </div>
          </div>
        )}

        {/* Error */}
        {stepError && (
          <div style={{ marginTop: 16, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', padding: '12px 14px', borderRadius: S.radiusSm }}>
            <Body style={{ color: S.danger, fontSize: 12, margin: 0 }}>⚠ {stepError}</Body>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexDirection: isMobile ? 'column' : 'row' }}>
          {step > 1 && (
            <Btn variant="ghost" full={isMobile} onClick={() => { setStep(s => s - 1); setStepError(null) }}>← Back</Btn>
          )}
          {step < 4 && (
            <Btn variant="gold" full onClick={handleContinue}>Continue →</Btn>
          )}
          {step === 4 && (
            <Btn variant="gold" full onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : `Send Brief to ${designer?.name} →`}
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}