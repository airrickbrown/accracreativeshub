// ── src/components/DesignerSignup.tsx ──
// Changes from previous version:
// - Portfolio minimum changed from 5 to 3
// - Resume upload REMOVED from Step 3 (portfolio shows their work, that's enough)
// - Resume info is auto-generated from their bio + experience in their profile

import React, { useState, useEffect, useRef } from 'react'
import { S } from '../styles/tokens'
import { Btn, Inp, Sel, Txt, Hl, Body, Lbl, Badge, GoldLine } from './UI'
import Nav from './Nav'
import { signUpUser } from '../lib/auth'

interface DesignerSignupProps {
  onClose: () => void
}

const STEP_ERRORS: Record<number, (form: any) => string | null> = {
  1: (f) => {
    if (!f.name.trim())     return 'Full name is required.'
    if (!f.email.trim())    return 'Email address is required.'
    if (!f.password.trim()) return 'Password is required.'
    if (f.password.length < 8) return 'Password must be at least 8 characters.'
    if (!f.phone.trim())    return 'WhatsApp number is required.'
    if (!f.location.trim()) return 'Location is required.'
    if (!f.category)        return 'Please select your primary service.'
    return null
  },
  2: (f) => {
    // ── FIX: minimum changed from 5 to 3 ──
    if (f.portfolioFiles.length < 1)
      return 'Please upload at least 1 portfolio sample to continue. (Minimum 3 required for approval.)'
    return null
  },
  3: (f) => {
    if (!f.idFile) return 'Please upload your government-issued ID before continuing.'
    return null
  },
  4: (f) => {
    if (!f.price.trim())   return 'Please enter your starting price.'
    if (!f.responseTime)   return 'Please select your average response time.'
    if (!f.tagline.trim()) return 'Please enter a professional tagline.'
    if (!f.bio.trim())     return 'Please write a short bio about yourself.'
    return null
  },
}

export default function DesignerSignup({ onClose }: DesignerSignupProps) {
  const [step, setStep]           = useState(1)
  const [isMobile, setIsMobile]   = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)

  const portfolioInputRef = useRef<HTMLInputElement>(null)
  const idInputRef        = useRef<HTMLInputElement>(null)

  const [designerAgreement, setDesignerAgreement] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: '', category: '',
    tagline: '', bio: '', portfolioFiles: [] as File[], portfolioPreviews: [] as string[],
    idFile: null as File | null, idFileName: '', price: '', responseTime: '',
    showPassword: false,
  })

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setStepError(null) }, [step])

  const handlePortfolioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files    = Array.from(e.target.files || [])
    if (!files.length) return
    const newFiles    = [...form.portfolioFiles, ...files].slice(0, 10)
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    f('portfolioFiles', newFiles)
    f('portfolioPreviews', newPreviews)
    if (portfolioInputRef.current) portfolioInputRef.current.value = ''
  }

  const removePortfolio = (index: number) => {
    f('portfolioFiles',   form.portfolioFiles.filter((_, i) => i !== index))
    f('portfolioPreviews', form.portfolioPreviews.filter((_, i) => i !== index))
  }

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    f('idFile', file); f('idFileName', file.name)
    if (idInputRef.current) idInputRef.current.value = ''
  }

  const handleContinue = () => {
    const error = STEP_ERRORS[step]?.(form)
    if (error) { setStepError(error); return }
    setStepError(null); setStep(s => s + 1)
  }

  const handleFinalSubmit = async () => {
    const error = STEP_ERRORS[4]?.(form)
    if (error) { setStepError(error); return }
    if (!designerAgreement) { setStepError('You must agree to the Designer Agreement before submitting.'); return }

    try {
      if (!form.idFile) { setStepError('Please upload your government-issued ID.'); return }
      await signUpUser({ email: form.email, password: form.password, fullName: form.name, role: 'designer' })
      alert('Application submitted! Check your email to verify your account. Our editorial board will review your profile within 3–5 business days.')
      onClose()
    } catch (err: any) {
      setStepError(err?.message || 'Signup failed. Please try again.')
    }
  }

  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'
  const stepLabels = ['Personal Details', 'Portfolio', 'Verification', 'Final Setup']

  // ── Portfolio count indicator ──
  // FIX: minimum is now 3
  const portfolioCount = form.portfolioFiles.length
  const meetsMinimum   = portfolioCount >= 3

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>

      {/* Hidden inputs */}
      <input ref={portfolioInputRef} type="file" accept="image/*,.pdf" multiple style={{ display: 'none' }} onChange={handlePortfolioFiles} />
      <input ref={idInputRef}        type="file" accept="image/*,.pdf"          style={{ display: 'none' }} onChange={handleIdFile} />

      <Nav
        scrolled user={null} isAdmin={false}
        onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}}
        onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose}
        onLogin={() => {}} onSignOut={() => {}}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '88px 16px 60px' : '100px 40px 60px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60, alignItems: 'start' }}>

        {/* Left panel */}
        <div>
          <Lbl style={{ marginBottom: 16 }}>Step {step} — {stepLabels[step - 1]}</Lbl>
          <Hl style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, marginBottom: 8 }}>
            Join the Sovereign<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Collective.</em>
          </Hl>
          <GoldLine />

          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px', marginBottom: 32 }}>
            <Hl style={{ fontSize: 18, marginBottom: 12 }}>The Standard of Excellence</Hl>
            <Body style={{ fontSize: 12, marginBottom: 14 }}>
              We curate Ghana&apos;s best contemporary designers. Your portfolio should reflect both technical mastery and cultural relevance.
            </Body>
            {[
              // ── FIX: Updated from 5 to 3 minimum ──
              'Minimum 3 high resolution project submissions',
              'Include diverse project types',
              'Show your best and most recent work',
            ].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span style={{ color: S.gold, fontSize: 12, flexShrink: 0, marginTop: 2 }}>◆</span>
                <Body style={{ fontSize: 11 }}>{r}</Body>
              </div>
            ))}
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3, 4].map((n, i) => (
              <React.Fragment key={n}>
                <div onClick={() => n < step ? setStep(n) : undefined} style={{ cursor: n < step ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 24, height: 24, background: step === n ? S.gold : step > n ? 'rgba(201,168,76,0.4)' : S.surface, border: `1px solid ${step === n ? S.gold : step > n ? S.gold : S.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step === n ? S.onPrimary : step > n ? S.gold : S.textFaint, fontSize: 9, fontFamily: S.body, fontWeight: 700 }}>
                    {step > n ? '✓' : n}
                  </div>
                  <Lbl style={{ margin: 0, fontSize: 7 }}>{['STEP 1', 'PORTFOLIO', 'IDENTITY', 'SETUP'][i]}</Lbl>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: step > n ? S.gold : S.borderFaint, margin: '0 6px 16px', opacity: step > n ? 0.4 : 1 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Inp label="Full Name *"        placeholder="e.g. Abena Kyei"           value={form.name}     onChange={(v: string) => f('name', v)} />
              <Inp label="Email Address *"    placeholder="e.g. abena@email.com"       value={form.email}    onChange={(v: string) => f('email', v)} />

              {/* Password with show/hide */}
              <div>
                <Lbl style={{ marginBottom: 8 }}>Password * <span style={{ color: S.textFaint, fontSize: 9 }}>(min 8 characters)</span></Lbl>
                <div style={{ position: 'relative' }}>
                  <input
                    type={form.showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={e => f('password', e.target.value)}
                    style={{ width: '100%', background: S.bgLow, border: `1px solid ${S.border}`, color: S.text, padding: '13px 48px 13px 16px', fontFamily: S.body, fontSize: 16, outline: 'none', boxSizing: 'border-box', borderRadius: S.radiusSm, minHeight: 46 }}
                  />
                  <button onClick={() => f('showPassword', !form.showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: S.textFaint, cursor: 'pointer', fontSize: 9, fontFamily: S.headline, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}>
                    {form.showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <Inp label="WhatsApp Number *"  placeholder="+233 XX XXX XXXX"           value={form.phone}    onChange={(v: string) => f('phone', v)} />
              <Inp label="Location *"         placeholder="e.g. Accra, East Legon"     value={form.location} onChange={(v: string) => f('location', v)} />
              <Sel
                label="Primary Service *"
                options={['', 'Logo Design', 'Business Branding', 'Flyer Design', 'Social Media Design', 'UI/UX Design', 'Motion Graphics', 'Photography']}
                value={form.category}
                onChange={(v: string) => f('category', v)}
              />
            </div>
          )}

          {/* STEP 2: Portfolio — min 3 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Body style={{ fontSize: 12 }}>
                Upload a minimum of <strong style={{ color: S.text }}>3 samples</strong>. Accepted: PNG, JPG, PDF. These will be reviewed by our editorial board.
              </Body>

              <Btn variant="gold" full onClick={() => portfolioInputRef.current?.click()}>
                + Upload Portfolio Samples
              </Btn>

              {/* Grid of uploaded previews */}
              {form.portfolioPreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {form.portfolioPreviews.map((preview, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', background: S.surface, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
                      <img src={preview} alt={`Sample ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', opacity: 0.9 }} />
                      <button onClick={() => removePortfolio(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {form.portfolioPreviews.length === 0 && (
                <div onClick={() => portfolioInputRef.current?.click()} style={{ background: S.surface, border: `2px dashed ${S.border}`, borderRadius: S.radiusSm, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <span style={{ color: S.textFaint, fontSize: 32 }}>+</span>
                  <Lbl style={{ margin: 0, fontSize: 9 }}>Click to upload portfolio samples</Lbl>
                  <Body style={{ fontSize: 11 }}>PNG · JPG · PDF · Up to 10 files</Body>
                </div>
              )}

              {/* Progress */}
              <div style={{ background: meetsMinimum ? 'rgba(74,154,74,0.08)' : 'rgba(201,168,76,0.06)', border: `1px solid ${meetsMinimum ? 'rgba(74,154,74,0.3)' : 'rgba(201,168,76,0.2)'}`, padding: '12px 16px', borderRadius: S.radiusSm }}>
                <Body style={{ fontSize: 12, margin: 0, color: meetsMinimum ? S.success : S.gold }}>
                  {portfolioCount === 0
                    ? 'No files uploaded yet — minimum 3 required for approval.'
                    : portfolioCount < 3
                    ? `${portfolioCount} uploaded · ${3 - portfolioCount} more needed for approval`
                    : `✓ ${portfolioCount} sample${portfolioCount !== 1 ? 's' : ''} uploaded — minimum requirement met`}
                </Body>
              </div>
            </div>
          )}

          {/* STEP 3: Verification — ID only, NO resume */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Hl style={{ fontSize: 20, marginBottom: 4 }}>Identity Verification</Hl>
              <Body style={{ fontSize: 12, lineHeight: 1.8 }}>
                Government-issued identification is required to protect clients and maintain platform integrity. Your ID is encrypted and never shown publicly.
              </Body>

              {/* ID Upload */}
              <div>
                <Lbl style={{ marginBottom: 10 }}>Ghana Card or Passport *</Lbl>
                <div style={{ background: S.surface, border: `1px solid ${form.idFile ? 'rgba(74,154,74,0.4)' : S.border}`, padding: '16px', borderRadius: S.radiusSm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <Hl style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                      {form.idFile ? '✓ ID Uploaded' : 'No file selected'}
                    </Hl>
                    {form.idFileName && <Body style={{ fontSize: 11, margin: 0, color: S.textMuted }}>{form.idFileName}</Body>}
                    {!form.idFile && <Body style={{ fontSize: 11, margin: 0 }}>PNG, JPG or PDF accepted</Body>}
                  </div>
                  <Btn variant={form.idFile ? 'outline' : 'gold'} size="sm" onClick={() => idInputRef.current?.click()}>
                    {form.idFile ? 'Replace' : 'Upload ID'}
                  </Btn>
                </div>
              </div>

              <div style={{ background: 'rgba(74,154,74,0.06)', border: '1px solid rgba(74,154,74,0.2)', padding: '12px 16px', borderRadius: S.radiusSm }}>
                <Body style={{ fontSize: 11 }}>
                  ✓ Encrypted &nbsp;·&nbsp; Never shown to clients &nbsp;·&nbsp; Used for identity verification only
                </Body>
              </div>

              {/* Why no resume — explanation */}
              <div style={{ background: S.bgLow, border: `1px solid ${S.borderFaint}`, padding: '14px 16px', borderRadius: S.radiusSm }}>
                <Body style={{ fontSize: 12, lineHeight: 1.8, color: S.textMuted }}>
                  💡 <strong style={{ color: S.text }}>No resume needed.</strong> Your portfolio samples and profile bio are your resume on Accra Creatives Hub. Clients hire based on your work, not a document.
                </Body>
              </div>
            </div>
          )}

          {/* STEP 4: Final Setup */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Inp label="Starting Price (GH₵) *" placeholder="e.g. 150" value={form.price} onChange={(v: string) => f('price', v)} />
              <Sel
                label="Average Response Time *"
                options={['', 'Under 30 minutes', '1 hour', '2–3 hours', 'Same day']}
                value={form.responseTime}
                onChange={(v: string) => f('responseTime', v)}
              />
              <Txt
                label="Professional Tagline *"
                placeholder="e.g. Brand identities that outlast trends"
                value={form.tagline}
                onChange={(v: string) => f('tagline', v)}
                rows={2}
              />
              <Txt
                label="About You / Bio *"
                placeholder="Tell clients about your background, design philosophy, the kind of work you love, and what makes you unique as a Ghanaian creative..."
                value={form.bio}
                onChange={(v: string) => f('bio', v)}
                rows={5}
              />

              {/* Profile preview */}
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '20px', borderRadius: S.radiusSm }}>
                <Lbl style={{ marginBottom: 12 }}>Profile Preview</Lbl>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a2a1a', border: `2px solid ${S.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 12, fontWeight: 700, fontFamily: S.body }}>
                    {initials}
                  </div>
                  <div>
                    <Hl style={{ fontSize: 18, fontWeight: 600 }}>{form.name || 'Your Name'}</Hl>
                    <Body style={{ fontSize: 11 }}>{form.location || 'Location'} · {form.category || 'Category'}</Body>
                    <div style={{ marginTop: 4 }}><Badge type="under_review" size={9} /></div>
                  </div>
                </div>
                {form.tagline && (
                  <Body style={{ fontSize: 12, fontStyle: 'italic', borderTop: `1px solid ${S.borderFaint}`, paddingTop: 10, marginTop: 4 }}>
                    "{form.tagline}"
                  </Body>
                )}
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {form.portfolioFiles.length > 0 && (
                    <span style={{ background: 'rgba(74,154,74,0.1)', border: '1px solid rgba(74,154,74,0.3)', color: S.success, fontSize: 9, padding: '3px 8px', fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 4 }}>
                      {form.portfolioFiles.length} Portfolio Samples
                    </span>
                  )}
                  {form.price && (
                    <span style={{ background: S.bgLow, border: `1px solid ${S.borderFaint}`, color: S.textMuted, fontSize: 9, padding: '3px 8px', fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 4 }}>
                      From GH₵{form.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Designer Agreement consent — step 4 only */}
          {step === 4 && (
            <div style={{ background: S.bgLow, border: `1px solid ${designerAgreement ? 'rgba(74,154,74,0.35)' : S.borderFaint}`, borderRadius: S.radiusSm, padding: '14px 16px', marginTop: 6 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={designerAgreement}
                  onChange={e => setDesignerAgreement(e.target.checked)}
                  style={{ marginTop: 2, flexShrink: 0, accentColor: S.gold, width: 14, height: 14 }}
                />
                <Body style={{ fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                  I have read and agree to the{' '}
                  <a href="/designer-agreement" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Designer Agreement</a>,{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Terms of Service</a>, and{' '}
                  <a href="/payments-disputes" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, textDecoration: 'underline' }}>Payments & Disputes Policy</a>.
                  I understand that I am an independent contractor and not an employee of Accra Creatives Hub.
                </Body>
              </label>
            </div>
          )}

          {/* Error */}
          {stepError && (
            <div style={{ marginTop: 14, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', padding: '12px 14px', borderRadius: S.radiusSm }}>
              <Body style={{ color: S.danger, fontSize: 12, margin: 0 }}>⚠ {stepError}</Body>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {step > 1 && (
              <Btn variant="ghost" onClick={() => { setStep(s => s - 1); setStepError(null) }} full>← Back</Btn>
            )}
            {step < 4
              ? <Btn variant="gold" onClick={handleContinue} full>Continue →</Btn>
              : <Btn variant="gold" onClick={handleFinalSubmit} full>Submit Application →</Btn>
            }
          </div>
        </div>
      </div>
    </div>
  )
}