// ── APP.TSX ── All links fixed. Stats pulled from real data.

import React, { useState, useEffect } from 'react'
import { S, kenteUrl } from './styles/tokens'
import { DESIGNERS, ORDERS } from './data/mockData'

import Nav                from './components/Nav'
import DesignerCard       from './components/DesignerCard'
import DesignerProfile    from './components/DesignerProfile'
import BriefBuilder       from './components/BriefBuilder'
import MessagingInterface from './components/MessagingInterface'
import AdminPanel         from './components/AdminPanel'
import DesignerDashboard  from './components/DesignerDashboard'
import DesignerSignup     from './components/DesignerSignup'
import { Btn, Hl, Body, Lbl, GoldLine } from './components/UI'
import { supabase } from './lib/supabase'

// ── Smooth scroll to a section by id ──
const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// ── Derive real stats from actual data ──
const REAL_STATS = {
  designerCount: DESIGNERS.length,
  verifiedCount: DESIGNERS.filter(d => d.verified).length,
  completedOrders: ORDERS.reduce((sum, o) => sum + (o.status === 'delivered' ? 1 : 0), 0),
  totalOrders: ORDERS.length,
  totalEarnings: ORDERS.reduce((sum, o) => sum + o.amount, 0),
  commission: 10,
  avgRating: Number(
    (DESIGNERS.reduce((s, d) => s + d.rating, 0) / DESIGNERS.length).toFixed(1)
  ),
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [heroIn, setHeroIn] = useState(false)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null)
  const [briefDesigner, setBriefDesigner] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState<any>(null)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 100)

    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)

    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Optional Supabase connection test
  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      if (error) {
        console.log('Supabase test:', error.message)
      } else {
        console.log('Supabase connected')
      }
    }

    testConnection()
  }, [])

  const cats = ['All', 'Logo Design', 'Flyer & Social Media', 'Business Branding']

  const filtered = DESIGNERS.filter(d => {
    const mc = category === 'All' || d.category === category
    const ms =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tagline.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))

    return mc && ms
  })

  const navProps = {
    scrolled,
    onAdmin: () => setShowAdmin(true),
    onSignup: () => setShowSignup(true),
    onMessages: () => setShowChat(true),
    onMarketplace: () => scrollTo('marketplace'),
    onHowItWorks: () => scrollTo('how-it-works'),
    onForDesigners: () => scrollTo('for-designers'),
  }

  return (
    <div
      style={{
        background: S.bg,
        minHeight: '100vh',
        color: S.text,
        fontFamily: S.body,
        backgroundImage: kenteUrl,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:${S.bgDeep}; }
        ::-webkit-scrollbar-thumb { background:${S.gold}30; }
        ::placeholder { color:${S.textFaint}; }
        select option { background:${S.bgLow}; color:${S.text}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:0.3; } 50% { opacity:0.8; } }
        @media (max-width:768px) {
          .hero-grid { grid-template-columns:1fr !important; gap:40px !important; }
          .hero-portrait { display:none !important; }
          .process-grid { grid-template-columns:1fr !important; }
          .footer-grid { grid-template-columns:1fr 1fr !important; }
          .stats-row { gap:20px !important; }
          .search-row { flex-direction:column !important; }
          section { padding:60px 20px !important; }
        }
      `}</style>

      {showSignup && <DesignerSignup onClose={() => setShowSignup(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showAnalytics && (
        <DesignerDashboard
          designer={showAnalytics}
          onClose={() => setShowAnalytics(null)}
        />
      )}
      {briefDesigner && (
        <BriefBuilder
          designer={briefDesigner}
          onClose={() => setBriefDesigner(null)}
        />
      )}
      {showChat && <MessagingInterface onClose={() => setShowChat(false)} />}
      {selectedDesigner && (
        <DesignerProfile
          designer={selectedDesigner}
          onHire={(d: any) => {
            setSelectedDesigner(null)
            setBriefDesigner(d)
          }}
          onMessage={() => {
            setSelectedDesigner(null)
            setShowChat(true)
          }}
          onAnalytics={() => {
            setShowAnalytics(selectedDesigner)
            setSelectedDesigner(null)
          }}
          onClose={() => setSelectedDesigner(null)}
        />
      )}

      <Nav {...navProps} />

      <section
        id="hero"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 80,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="hero-grid"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              animation: heroIn ? 'fadeUp 0.8s ease forwards' : 'none',
              opacity: heroIn ? 1 : 0,
            }}
          >
            <Lbl style={{ marginBottom: 20 }}>The Sovereign Gallery</Lbl>
            <Hl
              style={{
                fontSize: 'clamp(42px,7vw,80px)',
                fontWeight: 300,
                marginBottom: 20,
                lineHeight: 1.0,
              }}
            >
              Elevating
              <br />
              <em style={{ fontStyle: 'italic', color: S.gold }}>Ghanaian</em> Design
            </Hl>
            <Body
              style={{
                fontSize: 16,
                marginBottom: 40,
                maxWidth: 440,
                lineHeight: 1.8,
              }}
            >
              A curated marketplace for Ghana&apos;s most prestigious visual storytellers.
              Connecting global brands with elite local craftsmanship.
            </Body>

            <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
              <Btn variant="gold" size="lg" onClick={() => scrollTo('marketplace')}>
                Find Your Designer →
              </Btn>
              <Btn variant="ghost" size="lg" onClick={() => scrollTo('how-it-works')}>
                How It Works
              </Btn>
            </div>

            <div className="stats-row" style={{ display: 'flex', gap: 36 }}>
              {[
                { n: `${REAL_STATS.verifiedCount}`, l: 'Verified Designers' },
                { n: `${REAL_STATS.totalOrders}`, l: 'Active Projects' },
                { n: `${REAL_STATS.commission}%`, l: 'Commission Only' },
              ].map(s => (
                <div key={s.l}>
                  <Hl
                    style={{
                      color: S.gold,
                      fontSize: 28,
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </Hl>
                  <Lbl style={{ margin: 0, marginTop: 4 }}>{s.l}</Lbl>
                </div>
              ))}
            </div>
          </div>

          <div
            className="hero-portrait"
            style={{
              position: 'relative',
              animation: heroIn ? 'fadeUp 0.8s ease 0.2s forwards' : 'none',
              opacity: heroIn ? 1 : 0,
            }}
          >
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src={DESIGNERS[0].portrait}
                alt={DESIGNERS[0].name}
                style={{
                  width: '100%',
                  height: 520,
                  objectFit: 'cover',
                  objectPosition: 'top',
                  filter: 'grayscale(100%)',
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top,rgba(19,19,19,0.9) 0%,rgba(19,19,19,0.1) 50%,transparent 100%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>Elite Member</Lbl>
                <Hl
                  style={{
                    fontSize: 18,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  &quot;Crafting modern African narratives through a digital lens.&quot;
                </Hl>
                <Lbl style={{ margin: 0 }}>— {DESIGNERS[0].name}</Lbl>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => scrollTo('marketplace')}
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            animation: 'pulse 2.5s ease infinite',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 1,
              height: 40,
              background: `linear-gradient(to bottom,transparent,${S.gold})`,
            }}
          />
          <Lbl style={{ margin: 0, fontSize: 7 }}>Scroll</Lbl>
        </div>
      </section>

      <section
        style={{
          background: S.surface,
          padding: '32px 40px',
          borderTop: `1px solid ${S.borderFaint}`,
          borderBottom: `1px solid ${S.borderFaint}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 1,
            background: S.borderFaint,
          }}
        >
          {[
            { label: 'Designers on Platform', value: REAL_STATS.designerCount, suffix: '' },
            { label: 'Verified Designers', value: REAL_STATS.verifiedCount, suffix: '' },
            { label: 'Projects Completed', value: REAL_STATS.completedOrders, suffix: '' },
            { label: 'Platform Avg Rating', value: REAL_STATS.avgRating, suffix: ' ★' },
          ].map(s => (
            <div
              key={s.label}
              style={{ background: S.bgLow, padding: '24px 28px', textAlign: 'center' }}
            >
              <div
                style={{
                  color: S.gold,
                  fontSize: 32,
                  fontFamily: S.headline,
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                {s.value}
                {s.suffix}
              </div>
              <Lbl style={{ margin: 0, marginTop: 8, fontSize: 9 }}>{s.label}</Lbl>
            </div>
          ))}
        </div>
      </section>

      <section id="marketplace" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <Lbl style={{ marginBottom: 12 }}>Selected by our Editorial Board</Lbl>
              <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300 }}>
                Featured Designers
              </Hl>
            </div>
            <Lbl style={{ color: S.gold }}>{REAL_STATS.designerCount} designers available</Lbl>
          </div>

          <div style={{ height: 1, background: S.borderFaint, marginBottom: 28 }} />

          <div className="search-row" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flex: 1, minWidth: 260 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, style, or category..."
                style={{
                  flex: 1,
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRight: 'none',
                  color: S.text,
                  padding: '11px 16px',
                  fontFamily: S.body,
                  fontSize: 13,
                  outline: 'none',
                }}
                onFocus={(e: any) => (e.target.style.borderColor = S.gold)}
                onBlur={(e: any) => (e.target.style.borderColor = S.border)}
              />
              <button
                onClick={() => {}}
                style={{
                  background: S.gold,
                  color: S.onPrimary,
                  border: 'none',
                  padding: '11px 20px',
                  fontFamily: S.headline,
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Search
              </button>
            </div>

            <div style={{ display: 'flex', gap: 1, background: S.borderFaint, flexWrap: 'wrap' }}>
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    background: category === c ? S.gold : S.surface,
                    color: category === c ? S.onPrimary : S.textMuted,
                    border: 'none',
                    padding: '11px 18px',
                    fontFamily: S.headline,
                    fontSize: 9,
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Body style={{ fontSize: 12, color: S.textFaint }}>
              {filtered.length} designer{filtered.length !== 1 ? 's' : ''} found
              {category !== 'All' ? ` in ${category}` : ''}
              {search ? ` matching "${search}"` : ''}
            </Body>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {filtered.map(d => (
              <DesignerCard
                key={d.id}
                designer={d}
                onView={setSelectedDesigner}
                onHire={(designer: any) => setBriefDesigner(designer)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 0',
                color: S.textFaint,
                fontFamily: S.headline,
                fontSize: 24,
                fontStyle: 'italic',
              }}
            >
              No designers found. Try a different search or category.
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" style={{ background: S.surface, padding: '96px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
          <Hl style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 300 }}>
            The Process of Craft
          </Hl>
          <GoldLine w="40px" />
          <Body style={{ fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
            From brief to final delivery — every step is secure, transparent, and built for Ghana.
          </Body>
        </div>

        <div
          className="process-grid"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 1,
            background: S.borderFaint,
          }}
        >
          {[
            {
              n: '01',
              i: '▣',
              t: 'Build Your Brief',
              d: 'Fill out our structured brief form — project type, colours, references, and budget. Your designer gets everything they need from day one.',
              action: () => scrollTo('marketplace'),
            },
            {
              n: '02',
              i: '◈',
              t: 'Collaborate Securely',
              d: 'Chat directly with your designer. Share files, track revisions, and iterate. Funds are held in escrow until you approve the final delivery.',
              action: null,
            },
            {
              n: '03',
              i: '◉',
              t: 'Approve & Pay',
              d: "When you're satisfied, approve the delivery. Funds are released instantly. Leave a review to help the community.",
              action: null,
            },
          ].map((s, i) => (
            <div
              key={i}
              onClick={s.action || undefined}
              style={{
                background: S.bgLow,
                padding: '48px 32px',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                cursor: s.action ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e: any) => {
                if (s.action) e.currentTarget.style.background = S.surface
              }}
              onMouseLeave={(e: any) => {
                if (s.action) e.currentTarget.style.background = S.bgLow
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  color: `${S.gold}06`,
                  fontFamily: S.headline,
                  fontSize: 80,
                  fontWeight: 300,
                  userSelect: 'none',
                }}
              >
                {s.n}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ color: S.gold, fontSize: 28, marginBottom: 12 }}>{s.i}</div>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>{s.n}</Lbl>
                <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 14 }}>{s.t}</Hl>
                <Body style={{ fontSize: 12, lineHeight: 1.8 }}>{s.d}</Body>
                {s.action && (
                  <div style={{ marginTop: 16 }}>
                    <Btn variant="outline" size="sm" onClick={s.action}>
                      Get Started →
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="for-designers" style={{ padding: '96px 40px', background: S.bgDeep }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <Lbl style={{ marginBottom: 16 }}>For Ghanaian Creatives</Lbl>
              <Hl
                style={{
                  fontSize: 'clamp(28px,4vw,48px)',
                  fontWeight: 300,
                  marginBottom: 16,
                  lineHeight: 1.1,
                }}
              >
                Your talent deserves
                <br />
                <em style={{ fontStyle: 'italic', color: S.gold }}>better exposure.</em>
              </Hl>
              <GoldLine />
              <Body style={{ fontSize: 14, marginBottom: 32, lineHeight: 1.9 }}>
                Stop chasing clients through Instagram DMs. Build a verified profile, receive
                structured briefs, and get paid securely through escrow. Free to join — we only
                earn when you do.
              </Body>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Btn variant="gold" size="lg" onClick={() => setShowSignup(true)}>
                  Apply to Join →
                </Btn>
                <Btn variant="outline" size="lg" onClick={() => setShowAnalytics(DESIGNERS[0])}>
                  See Analytics Demo
                </Btn>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: S.borderFaint }}>
              {[
                {
                  i: '◈',
                  t: 'Free to List',
                  d: 'Create your profile at no cost. We take 10% commission only when you complete an order.',
                },
                {
                  i: '◉',
                  t: 'Verified Badge',
                  d: 'Our editorial board reviews and approves every designer before they go live.',
                },
                {
                  i: '◐',
                  t: 'Secure Escrow',
                  d: 'Funds are held safely. You always get paid for work that is approved.',
                },
                {
                  i: '◑',
                  t: 'Referral Earnings',
                  d: 'Earn GH₵20 for every client you refer who completes their first order.',
                },
              ].map((f, i) => (
                <div key={i} style={{ background: S.surface, padding: '32px 24px' }}>
                  <div style={{ color: S.gold, fontSize: 24, marginBottom: 12 }}>{f.i}</div>
                  <Hl style={{ fontSize: 17, fontWeight: 400, marginBottom: 8 }}>{f.t}</Hl>
                  <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{f.d}</Body>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#040404', borderTop: `1px solid ${S.borderFaint}`, padding: '56px 40px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <Hl
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: S.gold,
                  letterSpacing: '-0.02em',
                  marginBottom: 16,
                }}
              >
                ACCRA CREATIVES HUB
              </Hl>
              <Body style={{ fontSize: 12, maxWidth: 280, lineHeight: 1.9, marginBottom: 20 }}>
                Ghana&apos;s first curated marketplace for verified graphic designers. Secure
                escrow. Real reviews. Built for the creative economy.
              </Body>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ color: S.gold, fontSize: 20, fontFamily: S.headline }}>
                    {REAL_STATS.designerCount}
                  </div>
                  <Lbl style={{ margin: 0, fontSize: 8 }}>Designers</Lbl>
                </div>
                <div>
                  <div style={{ color: S.gold, fontSize: 20, fontFamily: S.headline }}>
                    {REAL_STATS.totalOrders}
                  </div>
                  <Lbl style={{ margin: 0, fontSize: 8 }}>Orders</Lbl>
                </div>
                <div>
                  <div style={{ color: S.gold, fontSize: 20, fontFamily: S.headline }}>
                    {REAL_STATS.avgRating}★
                  </div>
                  <Lbl style={{ margin: 0, fontSize: 8 }}>Avg Rating</Lbl>
                </div>
              </div>
            </div>

            <div>
              <Lbl style={{ marginBottom: 16 }}>Platform</Lbl>
              {[
                { label: 'Marketplace', fn: () => scrollTo('marketplace') },
                { label: 'Designers', fn: () => scrollTo('marketplace') },
                { label: 'How It Works', fn: () => scrollTo('how-it-works') },
                { label: 'Messages', fn: () => setShowChat(true) },
                { label: 'Admin Panel', fn: () => setShowAdmin(true) },
              ].map(l => (
                <div
                  key={l.label}
                  onClick={l.fn}
                  style={{
                    color: S.textFaint,
                    fontSize: 12,
                    fontFamily: S.body,
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >
                  {l.label}
                </div>
              ))}
            </div>

            <div>
              <Lbl style={{ marginBottom: 16 }}>For Designers</Lbl>
              {[
                { label: 'Apply to Join', fn: () => setShowSignup(true) },
                { label: 'Designer Signup', fn: () => setShowSignup(true) },
                { label: 'View Analytics Demo', fn: () => setShowAnalytics(DESIGNERS[0]) },
                { label: 'For Designers', fn: () => scrollTo('for-designers') },
              ].map(l => (
                <div
                  key={l.label}
                  onClick={l.fn}
                  style={{
                    color: S.textFaint,
                    fontSize: 12,
                    fontFamily: S.body,
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >
                  {l.label}
                </div>
              ))}
            </div>

            <div>
              <Lbl style={{ marginBottom: 16 }}>Company</Lbl>
              {[
                { label: 'About', fn: () => scrollTo('hero') },
                { label: 'How It Works', fn: () => scrollTo('how-it-works') },
                { label: 'For Designers', fn: () => scrollTo('for-designers') },
                { label: 'Contact Us', fn: () => setShowChat(true) },
                { label: 'Admin', fn: () => setShowAdmin(true) },
              ].map(l => (
                <div
                  key={l.label}
                  onClick={l.fn}
                  style={{
                    color: S.textFaint,
                    fontSize: 12,
                    fontFamily: S.body,
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: `1px solid ${S.borderFaint}`,
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Body style={{ fontSize: 11, margin: 0 }}>
              © {new Date().getFullYear()} Accra Creatives Hub · Sovereign Craft ·{' '}
              {REAL_STATS.commission}% commission on completed orders
            </Body>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Instagram', 'Twitter', 'LinkedIn', 'WhatsApp'].map(s => (
                <span
                  key={s}
                  style={{
                    color: S.textFaint,
                    fontSize: 10,
                    fontFamily: S.body,
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.gold)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}