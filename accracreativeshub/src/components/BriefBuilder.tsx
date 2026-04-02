// ── BRIEF BUILDER COMPONENT ──
// 3-step form that a client fills out before hiring a designer.
// Step 1: Project details
// Step 2: Creative direction (colours, references)
// Step 3: Delivery speed + payment method

import React, { useState } from 'react'
import { S, fmt } from '../styles/tokens'
import { Btn, Inp, Sel, Txt, Hl, Body, Lbl, Divider } from './UI'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

interface BriefBuilderProps {
  designer: any
  onClose: () => void
  onOrderCreated?: (order: any) => void
}

export default function BriefBuilder({ designer, onClose, onOrderCreated }: BriefBuilderProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    projectType: '',
    businessName: '',
    industry: '',
    description: '',
    colors: '',
    references: '',
    notes: '',
    rush: false,
    payment: '',
  })

  const { user } = useAuth()

  const f = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const rushFee = Math.round(designer.price * 0.5)
  const base = form.rush ? designer.price + rushFee : designer.price
  const commission = Math.round(base * 0.1)
  const total = base + commission

  const placeOrder = async () => {
  if (!user) {
    alert('Please log in to place an order')
    return
  }

  if (!form.businessName.trim() || !form.description.trim() || !form.projectType.trim()) {
    alert('Please complete the required project details')
    return
  }

  if (!form.payment) {
    alert('Please select a payment method')
    return
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_id: user.id,
      designer_id: designer.id,
      project_name: form.businessName || 'Design Project',
      brief: form.description,
      amount: total,
      status: 'pending_payment',
      rush: form.rush,
      revisions_total: 3,
    })
    .select()
    .single()

  if (error) {
    console.error('Order placement error:', error)
    alert('Failed to place order. Please try again.')
    return
  }


  alert(`Order placed! Reference: ACH-${data.id.slice(0, 8).toUpperCase()}`)

  if (onOrderCreated) {
    onOrderCreated(data)
  }

  onClose()
}
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '60px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 40,
          alignItems: 'start',
        }}
      >
        {/* ── Left — form ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <Lbl style={{ marginBottom: 12 }}>Project Initiation</Lbl>
              <Hl style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300 }}>
                <em style={{ fontStyle: 'italic', color: S.gold }}>The Brief Builder</em>
              </Hl>
            </div>
            <Btn variant="ghost" onClick={onClose}>✕ Close</Btn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
            {[
              { n: '01', l: 'Project Details' },
              { n: '02', l: 'Creative Direction' },
              { n: '03', l: 'Delivery & Payment' },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: step === i + 1 ? 1 : 0.4,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: step === i + 1 ? S.gold : 'none',
                      border: `1px solid ${step === i + 1 ? S.gold : S.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step === i + 1 ? S.onPrimary : S.textFaint,
                      fontSize: 10,
                      fontFamily: S.body,
                      fontWeight: 700,
                    }}
                  >
                    {s.n}
                  </div>
                  <span
                    style={{
                      color: step === i + 1 ? S.text : S.textFaint,
                      fontSize: 11,
                      fontFamily: S.headline,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.l}
                  </span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: S.borderFaint, margin: '0 16px' }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {step === 1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Inp
                    label="Project Name"
                    placeholder="e.g. Kojo Foods Brand Refresh"
                    value={form.businessName}
                    onChange={(v: string) => f('businessName', v)}
                  />
                  <Sel
                    label="Category"
                    options={['', 'Logo Design', 'Flyer & Social Media', 'Business Branding', 'Other']}
                    value={form.projectType}
                    onChange={(v: string) => f('projectType', v)}
                  />
                </div>

                <Txt
                  label="Project Scope & Narrative"
                  placeholder="Describe the soul of this project..."
                  value={form.description}
                  onChange={(v: string) => f('description', v)}
                  rows={5}
                />

                <Sel
                  label="Industry"
                  options={['', 'Food & Beverage', 'Church / Religion', 'Music & Events', 'Technology', 'Healthcare', 'Retail', 'Education', 'Other']}
                  value={form.industry}
                  onChange={(v: string) => f('industry', v)}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Inp
                  label="Preferred Colours"
                  placeholder="e.g. Earthy golds and deep greens"
                  value={form.colors}
                  onChange={(v: string) => f('colors', v)}
                />
                <Inp
                  label="References & Inspiration"
                  placeholder="Website URLs, Instagram handles"
                  value={form.references}
                  onChange={(v: string) => f('references', v)}
                />
                <Txt
                  label="Additional Notes"
                  placeholder="Target audience, elements to avoid, file formats..."
                  value={form.notes}
                  onChange={(v: string) => f('notes', v)}
                  rows={4}
                />
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Lbl style={{ marginBottom: 12 }}>Creative Logistics</Lbl>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { rush: false, label: 'Standard Delivery', sub: '1–4 Business Days', price: designer.price },
                      { rush: true, label: '⚡ Rush Delivery', sub: '48 Hour Turnaround · +50% Fee', price: designer.price + rushFee },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        onClick={() => f('rush', opt.rush)}
                        style={{
                          background: form.rush === opt.rush ? S.goldDim : S.surface,
                          border: `1px solid ${form.rush === opt.rush ? S.gold : S.border}`,
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}
                      >
                        {opt.rush && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              background: S.gold,
                              color: S.onPrimary,
                              fontSize: 8,
                              padding: '2px 6px',
                              fontFamily: S.body,
                              fontWeight: 700,
                              letterSpacing: '0.1em',
                            }}
                          >
                            RUSH
                          </div>
                        )}
                        <Hl style={{ fontSize: 14, marginBottom: 6 }}>{opt.label}</Hl>
                        <Body style={{ fontSize: 11, marginBottom: 12, lineHeight: 1.5 }}>{opt.sub}</Body>
                        <Hl style={{ color: S.gold, fontSize: 22 }}>{fmt(opt.price)}</Hl>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Lbl style={{ marginBottom: 12 }}>Secure Escrow Payment</Lbl>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[
                      { k: 'momo', l: 'MoMo', i: '📱' },
                      { k: 'bank', l: 'Bank', i: '🏦' },
                      { k: 'card', l: 'Card', i: '💳' },
                    ].map((m) => (
                      <div
                        key={m.k}
                        onClick={() => f('payment', m.k)}
                        style={{
                          background: form.payment === m.k ? S.goldDim : S.surface,
                          border: `1px solid ${form.payment === m.k ? S.gold : S.border}`,
                          padding: '14px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{m.i}</div>
                        <Hl style={{ color: form.payment === m.k ? S.gold : S.textMuted, fontSize: 11 }}>{m.l}</Hl>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: 'rgba(74,154,74,0.06)',
                      border: '1px solid rgba(74,154,74,0.2)',
                      padding: '12px 16px',
                      marginTop: 12,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>🔒</span>
                    <Body style={{ fontSize: 11, color: S.textFaint }}>
                      Escrow Protected — Funds held securely and only released upon your approval.
                    </Body>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 8 }}>
              {step > 1 ? (
                <Btn variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  ← Save Draft
                </Btn>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <Btn variant="gold" onClick={() => setStep((s) => s + 1)}>
                  Continue →
                </Btn>
              ) : (
                <Btn variant="gold" onClick={placeOrder} disabled={!form.payment}>
                  Place Order · {fmt(total)}
                </Btn>
              )}
            </div>
          </div>
        </div>

        {/* ── Right — Project Summary sidebar ── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px', marginBottom: 16 }}>
            <Lbl style={{ marginBottom: 20 }}>Project Summary</Lbl>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Body style={{ fontSize: 12 }}>Creative Fee</Body>
                <Hl style={{ fontSize: 13, color: S.text }}>{fmt(designer.price)}</Hl>
              </div>

              {form.rush && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Body style={{ fontSize: 12 }}>Rush (50%)</Body>
                  <Hl style={{ fontSize: 13, color: S.gold }}>{fmt(rushFee)}</Hl>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Body style={{ fontSize: 12 }}>Platform (10%)</Body>
                <Hl style={{ fontSize: 13, color: S.textFaint }}>{fmt(commission)}</Hl>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Hl style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Total Investment
                </Hl>
                <Hl style={{ color: S.gold, fontSize: 28 }}>{fmt(total)}</Hl>
              </div>
            </div>

            <div style={{ background: S.bgLow, padding: '14px' }}>
              <Lbl style={{ marginBottom: 6, fontSize: 8 }}>Escrow Protected</Lbl>
              <Body style={{ fontSize: 11 }}>
                Funds held securely and only released upon your approval of the final deliverable.
              </Body>
            </div>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', height: 180 }}>
            <img
              src={designer.portrait}
              alt={designer.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                filter: 'grayscale(100%)',
                opacity: 0.6,
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.9),transparent)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
              <Lbl style={{ marginBottom: 4, color: S.gold, fontSize: 7 }}>Curated Craft</Lbl>
              <Body style={{ fontSize: 10 }}>Prioritised over 400+ independent creators</Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}