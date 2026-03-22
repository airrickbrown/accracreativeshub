// ── DESIGNER SIGNUP / VERIFICATION COMPONENT ──
// 4-step application flow for designers joining the platform.
// Step 1: Personal details
// Step 2: Portfolio upload
// Step 3: Identity verification (Ghana Card)
// Step 4: Final setup + profile preview

import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Sel, Txt, Hl, Body, Lbl, Badge, GoldLine } from './UI'
import Nav from './Nav'

interface DesignerSignupProps {
  onClose: () => void
}

export default function DesignerSignup({ onClose }: DesignerSignupProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', phone: '', location: '', category: '',
    tagline: '', portfolioCount: 0, idUploaded: false, price: '',
  })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  // Generate initials for profile preview
  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'

  const stepLabels = ['Personal Details', 'Portfolio Collection', 'Verification & Security', 'Final Setup']

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}} scrolled={true} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 40px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

        {/* ── Left — context and step indicators ── */}
        <div>
          <Lbl style={{ marginBottom: 16 }}>Step {step} — {stepLabels[step - 1]}</Lbl>
          <Hl style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, marginBottom: 8 }}>
            Join the Sovereign<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Collective.</em>
          </Hl>
          <GoldLine />

          {/* Why apply card */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px', marginBottom: 32 }}>
            <Hl style={{ fontSize: 18, marginBottom: 12 }}>The Standard of Excellence</Hl>
            <Body style={{ fontSize: 12, marginBottom: 14 }}>
              We curate Ghana's best contemporary designers. Your portfolio should reflect both technical mastery and cultural relevance.
            </Body>
            {['Minimum 5 high resolution project submissions', 'Include project descriptions', 'Conceptual sketches and final frames'].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: S.gold, fontSize: 12 }}>◆</span>
                <Body style={{ fontSize: 11 }}>{r}</Body>
              </div>
            ))}
          </div>

          {/* Step indicator dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {[1, 2, 3, 4].map((n, i) => (
              <React.Fragment key={n}>
                <div onClick={() => setStep(n)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 24, height: 24, background: step === n ? S.gold : step > n ? 'rgba(201,168,76,0.3)' : S.surface, border: `1px solid ${step === n ? S.gold : S.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step === n ? S.onPrimary : S.textFaint, fontSize: 9, fontFamily: S.body, fontWeight: 700, transition: 'all 0.3s' }}>
                    {n}
                  </div>
                  <Lbl style={{ margin: 0, fontSize: 7 }}>{['STEP 1', 'PORTFOLIO', 'IDENTITY', 'FORM'][i]}</Lbl>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: step > n ? 'rgba(201,168,76,0.3)' : S.borderFaint, margin: '0 6px 16px' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Right — form for current step ── */}
        <div>

          {/* Step 1 — Personal Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Inp label="Full Name"        placeholder="e.g. Abena Kyei"          value={form.name}     onChange={(v: string) => f('name', v)}     />
              <Inp label="WhatsApp Number"  placeholder="+233..."                   value={form.phone}    onChange={(v: string) => f('phone', v)}    />
              <Inp label="Location"         placeholder="e.g. Accra, East Legon"   value={form.location} onChange={(v: string) => f('location', v)} />
              <Sel label="Primary Service"  options={['', 'Logo Design', 'Flyer & Social Media', 'Business Branding']} value={form.category} onChange={(v: string) => f('category', v)} />
            </div>
          )}

          {/* Step 2 — Portfolio Upload */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Body style={{ fontSize: 12 }}>Upload a minimum of 5 samples. These will be reviewed by our editorial board before your profile is approved.</Body>
              {/* Portfolio upload grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[0, 1].map(i => (
                  <div key={i}
                    style={{ background: S.surface, border: `2px dashed ${i < form.portfolioCount ? S.gold : S.border}`, aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden' }}
                    onClick={() => f('portfolioCount', Math.max(form.portfolioCount, i + 1) + 1)}>
                    {i < form.portfolioCount ? (
                      <>
                        <img src={`https://picsum.photos/id/${200 + i * 10}/200/250`} alt="" style={{ width: '100%', height: '80%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.7 }} />
                        <Lbl style={{ margin: 0, fontSize: 7 }}>Portfolio Sample {i + 1}</Lbl>
                      </>
                    ) : (
                      <>
                        <span style={{ color: S.textFaint, fontSize: 24 }}>+</span>
                        <Lbl style={{ margin: 0, fontSize: 8 }}>Upload New Craft</Lbl>
                        <Body style={{ fontSize: 10 }}>PNG / JPG / PDF</Body>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Btn variant="outline" full onClick={() => f('portfolioCount', form.portfolioCount + 1)}>+ Add Portfolio Sample</Btn>
              {form.portfolioCount > 0 && (
                <Body style={{ color: S.gold, fontSize: 11, textAlign: 'center' }}>
                  {form.portfolioCount} sample{form.portfolioCount !== 1 ? 's' : ''} added
                  {form.portfolioCount < 5 && ` · ${5 - form.portfolioCount} more required`}
                </Body>
              )}
            </div>
          )}

          {/* Step 3 — Identity Verification */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Hl style={{ fontSize: 20, marginBottom: 4 }}>Verification &amp; Security</Hl>
              <Body style={{ fontSize: 12 }}>
                Government-issued identification is required to protect clients and maintain platform integrity. Your ID is encrypted and never shown publicly.
              </Body>
              {/* ID upload area */}
              <div style={{ background: S.surface, border: `1px solid ${form.idUploaded ? 'rgba(74,154,74,0.4)' : S.border}`, padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Lbl style={{ marginBottom: 4, fontSize: 8 }}>Ghana Card or Passport</Lbl>
                  <Hl style={{ color: form.idUploaded ? S.success : S.textFaint, fontSize: 12 }}>
                    {form.idUploaded ? '✓ ID Uploaded' : 'Not uploaded'}
                  </Hl>
                </div>
                <Btn variant="gold" size="sm" onClick={() => f('idUploaded', true)}>Upload ID</Btn>
              </div>
              <div style={{ background: 'rgba(74,154,74,0.06)', border: '1px solid rgba(74,154,74,0.2)', padding: '12px 16px' }}>
                <Body style={{ fontSize: 11 }}>✓ Encrypted · Never shown to clients · Used for identity verification only</Body>
              </div>
            </div>
          )}

          {/* Step 4 — Final Setup */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Inp label="Starting Price (GH₵)"   placeholder="e.g. 150"                    value={form.price}    onChange={(v: string) => f('price', v)}   />
              <Sel label="Average Response Time"   options={['', 'Under 30 minutes', '1 hour', '2–3 hours', 'Same day']} value={''} onChange={() => {}} />
              <Txt label="Professional Tagline"    placeholder="e.g. Brand identities that outlast trends" value={form.tagline} onChange={(v: string) => f('tagline', v)} rows={2} />

              {/* Profile preview */}
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '20px' }}>
                <Lbl style={{ marginBottom: 12 }}>Profile Preview</Lbl>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a2a1a', border: `2px solid ${S.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 12, fontWeight: 700, fontFamily: S.body }}>
                    {initials}
                  </div>
                  <div>
                    <Hl style={{ fontSize: 18, fontWeight: 600 }}>{form.name || 'Your Name'}</Hl>
                    <Body style={{ fontSize: 11 }}>{form.location || 'Location'} · {form.category || 'Category'}</Body>
                    <div style={{ marginTop: 4 }}><Badge type="under_review" size={9} /></div>
                  </div>
                </div>
                <Body style={{ fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>{form.tagline || 'Your professional tagline'}</Body>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {step > 1 && <Btn variant="ghost" onClick={() => setStep(s => s - 1)} full>← Back</Btn>}
            {step < 4
              ? <Btn variant="gold" onClick={() => setStep(s => s + 1)} full>Continue →</Btn>
              : <Btn variant="gold" onClick={() => { alert('Application submitted! Our editorial board will review within 24 hours and contact you via WhatsApp.'); onClose() }} full>Continue to Agreement →</Btn>
            }
          </div>

        </div>
      </div>
    </div>
  )
}
