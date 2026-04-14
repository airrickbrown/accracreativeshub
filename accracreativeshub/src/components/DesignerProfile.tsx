// ── DESIGNER PROFILE ──
// Portfolio pulls from designer.portfolio (mapped from portfolio_urls in useDesigners)
// Reviews section fetches live from the reviews table
// "View Analytics" hidden from public — admin only

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Badge, Hl, Body, Lbl, Divider } from './UI'
import Nav from './Nav'
import { supabase } from '../lib/supabase'

interface Review {
  id:         string
  rating:     number
  comment:    string
  created_at: string
  profiles:   { full_name: string } | null
}

interface DesignerProfileProps {
  designer:    any
  onHire:      (d: any) => void
  onMessage:   () => void
  onResume:    (d: any) => void
  onAnalytics: () => void
  onClose:     () => void
  isAdmin?:    boolean
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          style={{ color: n <= Math.round(rating) ? S.gold : 'rgba(201,168,76,0.22)', fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function DesignerProfile({
  designer, onHire, onMessage, onResume, onAnalytics, onClose, isAdmin = false,
}: DesignerProfileProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [revLoading, setRevLoading] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fetch reviews for this designer
  useEffect(() => {
    if (!designer?.id) return
    const fetchReviews = async () => {
      setRevLoading(true)
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, profiles:client_id(full_name)')
        .eq('designer_id', designer.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setReviews((data || []) as unknown as Review[])
      setRevLoading(false)
    }
    fetchReviews()
  }, [designer?.id])

  // Portfolio images — from real DB data (portfolio_urls)
  const portfolioImages: string[] = designer.portfolio || []

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: S.bgDeep, overflowY: 'auto' }}>

      <Nav
        scrolled={true} user={null}
        onAdmin={() => {}} onSignup={() => {}} onMessages={onMessage}
        onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose}
        onLogin={() => {}} onSignOut={() => {}}
      />

      {/* Back */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '80px 16px 0' : '80px 40px 0' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted,
            fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer',
            borderRadius: 8, marginBottom: 24,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Main grid */}
      <div
        style={{
          maxWidth: 1100, margin: '0 auto',
          padding: isMobile ? '0 16px 60px' : '0 40px 60px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
          gap: isMobile ? 24 : 40,
          alignItems: 'start',
        }}
      >

        {/* ── Sidebar ── */}
        <div>
          {/* Portrait */}
          <div style={{ position: 'relative', overflow: 'hidden', height: isMobile ? 260 : 320 }}>
            <img
              src={designer.portrait} alt={designer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(100%)', opacity: 0.8 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 50%,rgba(19,19,19,0.7))' }} />
            <div style={{ position: 'absolute', top: 12, left: 12 }}><Badge type={designer.badge} /></div>
          </div>

          {/* Info panel */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderTop: 'none', padding: 18 }}>
            {/* Rating stars */}
            {designer.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Stars rating={designer.rating} size={13} />
                <Body style={{ fontSize: 11, margin: 0 }}>
                  {designer.rating.toFixed(1)} · {designer.reviews} review{designer.reviews !== 1 ? 's' : ''}
                </Body>
              </div>
            )}

            {designer.tags && designer.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                {designer.tags.map((t: string) => (
                  <span key={t} style={{ background: S.bgLow, border: `1px solid ${S.borderFaint}`, color: S.textMuted, fontSize: 8, padding: '3px 8px', fontFamily: S.body, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <Divider />
            <Lbl style={{ marginBottom: 4, fontSize: 8 }}>Project Investment</Lbl>
            <Hl style={{ color: S.gold, fontSize: 22, marginBottom: 2 }}>
              Starting at<br />GH₵{designer.price}
            </Hl>
            <Body style={{ fontSize: 10, marginBottom: 14 }}>{designer.responseTime} · {designer.reviews} clients</Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn variant="gold"    full onClick={() => onHire(designer)}>Hire Designer</Btn>
              <Btn variant="outline" full onClick={() => onResume(designer)}>View Resume</Btn>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                ● OPEN TO PROJECTS
              </span>
            </div>
            <Hl style={{ fontSize: isMobile ? 'clamp(28px,8vw,44px)' : 'clamp(32px,6vw,60px)', fontWeight: 300, marginBottom: 8 }}>
              {designer.name}
            </Hl>
            <Body style={{ fontSize: 14, marginBottom: 14 }}>{designer.tagline}</Body>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
              {[
                { l: 'Rating',        v: designer.rating > 0 ? designer.rating.toFixed(1) : '—' },
                { l: 'Commissions',   v: designer.orders        },
                { l: 'Est. Delivery', v: designer.responseTime  },
              ].map((s) => (
                <div key={s.l}>
                  <Lbl style={{ marginBottom: 4, fontSize: 8 }}>{s.l}</Lbl>
                  <Hl style={{ fontSize: isMobile ? 16 : 18 }}>{s.v}</Hl>
                </div>
              ))}
            </div>
          </div>

          {/* ── Portfolio (real uploaded images) ── */}
          <Hl style={{ fontSize: 20, marginBottom: 16 }}>Selected Works</Hl>
          {portfolioImages.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12,
                marginBottom: 32,
              }}
            >
              {portfolioImages.map((url: string, i: number) => (
                <div key={i} style={{ overflow: 'hidden', aspectRatio: '4/3', background: S.surface, border: `1px solid ${S.border}` }}>
                  <img
                    src={url} alt={`Portfolio sample ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)', opacity: 0.8, transition: 'all 0.4s' }}
                    onMouseEnter={(e: any) => { e.target.style.opacity = '1'; e.target.style.filter = 'grayscale(0%)'; e.target.style.transform = 'scale(1.04)' }}
                    onMouseLeave={(e: any) => { e.target.style.opacity = '0.8'; e.target.style.filter = 'grayscale(60%)'; e.target.style.transform = 'scale(1)' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: S.surface, border: `1px dashed ${S.border}`, padding: '40px 20px', textAlign: 'center', marginBottom: 32 }}>
              <Body style={{ fontSize: 12, color: S.textFaint }}>Portfolio samples pending upload.</Body>
            </div>
          )}

          {/* ── Reviews ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <Hl style={{ fontSize: 20, margin: 0 }}>Client Reviews</Hl>
              {designer.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stars rating={designer.rating} size={14} />
                  <Body style={{ fontSize: 12, margin: 0 }}>
                    {designer.rating.toFixed(1)} ({designer.reviews})
                  </Body>
                </div>
              )}
            </div>

            {revLoading && (
              <Body style={{ fontSize: 12, color: S.textMuted }}>Loading reviews…</Body>
            )}

            {!revLoading && reviews.length === 0 && (
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '24px 20px', textAlign: 'center' }}>
                <Body style={{ fontSize: 12, color: S.textFaint }}>No reviews yet — be the first to work with {designer.name.split(' ')[0]}.</Body>
              </div>
            )}

            {!revLoading && reviews.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: S.surface,
                      border: `1px solid ${S.border}`,
                      padding: isMobile ? '16px' : '18px 22px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <div>
                        <Body style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: S.text }}>
                          {(r.profiles as any)?.full_name || 'Anonymous Client'}
                        </Body>
                        <Stars rating={r.rating} size={12} />
                      </div>
                      <Body style={{ fontSize: 10, color: S.textFaint, margin: 0 }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Body>
                    </div>
                    {r.comment && (
                      <Body style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: S.textMuted }}>
                        "{r.comment}"
                      </Body>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTAs */}
          <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
            <Btn variant="gold"    size="lg" full={isMobile} onClick={() => onHire(designer)}>
              Hire Designer
            </Btn>
            <Btn variant="outline" size="lg" full={isMobile} onClick={() => onResume(designer)}>
              View Resume
            </Btn>
            {isAdmin && (
              <Btn variant="ghost" size="lg" full={isMobile} onClick={onAnalytics}>
                View Analytics
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
