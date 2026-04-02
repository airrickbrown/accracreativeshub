import React, { useState, useEffect } from 'react'
import { S, kenteUrl } from './styles/tokens'
import { DESIGNERS, ORDERS } from './data/mockData'
import Nav from './components/Nav'
import DesignerCard from './components/DesignerCard'
import DesignerProfile from './components/DesignerProfile'
import BriefBuilder from './components/BriefBuilder'
import MessagingInterface from './components/MessagingInterface'
import AdminPanel from './components/AdminPanel'
import DesignerDashboard from './components/DesignerDashboard'
import DesignerSignup from './components/DesignerSignup'
import DesignerResume from './components/DesignerResume'
import TermsPage from './components/TermsPage'
import ContactPage from './components/ContactPage'
import AboutPage from './components/AboutPage'
import { Btn, Hl, Body, Lbl, GoldLine } from './components/UI'
import { useDesigners } from './hooks/useDesigners'
// @ts-ignore
import { supabase } from './lib/supabase'
import AuthModal from './components/AuthModal'
import { useAuth } from './AuthContext'

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const REAL_STATS = {
  designerCount:   DESIGNERS.length,
  verifiedCount:   DESIGNERS.filter((d) => d.verified).length,
  completedOrders: ORDERS.reduce((sum, o) => sum + (o.status === 'delivered' ? 1 : 0), 0),
  totalOrders:     ORDERS.length,
  totalEarnings:   ORDERS.reduce((sum, o) => sum + o.amount, 0),
  commission:      10,
  avgRating:       Number((DESIGNERS.reduce((s, d) => s + d.rating, 0) / DESIGNERS.length).toFixed(1)),
}

export default function App() {
  const [scrolled, setScrolled]               = useState(false)
  const [heroIn, setHeroIn]                   = useState(false)
  const [category, setCategory]               = useState('All')
  const [search, setSearch]                   = useState('')
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null)
  const [briefDesigner, setBriefDesigner]     = useState<any>(null)
  const [showChat, setShowChat]               = useState(false)
  const [showSignup, setShowSignup]           = useState(false)
  const [showAdmin, setShowAdmin]             = useState(false)
  const [showAnalytics, setShowAnalytics]     = useState<any>(null)
  const [showAuth, setShowAuth]               = useState(false)
  const [chatOrder, setChatOrder]             = useState<any>(null)
  const [showResume, setShowResume]           = useState<any>(null)
  const [showTerms, setShowTerms]             = useState(false)
  const [showContact, setShowContact]         = useState(false)
  const [showAbout, setShowAbout]             = useState(false)

  // ── Role-based access ──
  // useAuth now exposes isAdmin, isDesigner, isClient
  const { user, signOut, isAdmin, isDesigner } = useAuth()
  const { designers: realDesigners } = useDesigners()
  const activeDesigners = realDesigners.length > 0 ? realDesigners : DESIGNERS

  const openOverlay = (fn: () => void) => {
    window.history.pushState({ overlay: true }, '')
    fn()
  }

  const closeAll = () => {
    setSelectedDesigner(null)
    setBriefDesigner(null)
    setShowSignup(false)
    setShowAdmin(false)
    setShowChat(false)
    setShowAuth(false)
    setShowAnalytics(null)
    setShowResume(null)
    setShowTerms(false)
    setShowContact(false)
    setShowAbout(false)
  }

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('access_token')) {
      setShowAuth(false)
      window.history.replaceState({}, '', '/')
    }
    setTimeout(() => setHeroIn(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    const onPopState = () => closeAll()
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      if (error) console.log('Supabase test:', error.message)
      else        console.log('Supabase connected')
    }
    testConnection()
  }, [])

  // ── FIX: Correct categories, "Other" removed ──
  const cats = ['All', 'Logo Design', 'Flyer & Social Media', 'Business Branding', 'UI/UX Design', 'Motion Graphics']

  const filtered = activeDesigners.filter((d: any) => {
    const mc = category === 'All' || d.category === category
    const ms = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tagline.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    return mc && ms
  })

  const navProps = {
    scrolled,
    user,
    // ── FIX: Admin button only works if isAdmin ──
    onAdmin:        isAdmin ? () => openOverlay(() => setShowAdmin(true)) : () => {},
    onSignup:       () => openOverlay(() => setShowSignup(true)),
    onMessages:     () => user ? openOverlay(() => setShowChat(true)) : openOverlay(() => setShowAuth(true)),
    onMarketplace:  () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    onHowItWorks:   () => scrollTo('how-it-works'),
    onForDesigners: () => scrollTo('for-designers'),
    onLogin:        () => openOverlay(() => setShowAuth(true)),
    onSignOut:      signOut,
  }

  return (
    <div style={{ background: S.bg, minHeight: '100dvh', color: S.text, fontFamily: S.body, backgroundImage: kenteUrl }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body, #root { min-height: 100%; background: #080808; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }
        body { overscroll-behavior-y: none; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:${S.bgDeep}; }
        ::-webkit-scrollbar-thumb { background:${S.gold}30; }
        ::placeholder { color:${S.textFaint}; }
        select option { background:${S.bgLow}; color:${S.text}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.3; } 50% { opacity:0.8; } }
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .for-designers-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 36px !important; padding: 64px 20px !important; }
          .hero-portrait { display: none !important; }
          .platform-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .process-grid, .for-designers-grid, .for-designers-cards { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .stats-row { gap: 20px !important; flex-wrap: wrap !important; }
          .search-row { flex-direction: column !important; }
          .market-search-input-row { flex-direction: column !important; }
          .market-search-input-row > button { width: 100%; }
          section { padding: 64px 20px !important; }
          .for-designers-section { padding: 64px 20px !important; }
          .footer-root { padding: 48px 20px 28px !important; }
        }
        @media (max-width: 560px) {
          .platform-stats-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: clamp(34px,11vw,52px) !important; }
          .auth-role-grid { grid-template-columns: 1fr !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
          .stats-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── Overlays ── */}
      {showSignup  && <DesignerSignup onClose={() => setShowSignup(false)} />}
      {showAuth    && <AuthModal onClose={() => setShowAuth(false)} />}
      {/* ── FIX: Admin panel only renders if isAdmin ── */}
      {showAdmin   && isAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {/* ── FIX: Analytics/Dashboard only for admins ── */}
      {showAnalytics && isAdmin && (
        <DesignerDashboard designer={showAnalytics} onClose={() => setShowAnalytics(null)} />
      )}
      {briefDesigner && (
        <BriefBuilder
          designer={briefDesigner}
          onClose={() => setBriefDesigner(null)}
          onOrderCreated={(order) => { setBriefDesigner(null); setChatOrder(order); setShowChat(true) }}
        />
      )}
      {showChat && (
        <MessagingInterface
          onClose={() => { setShowChat(false); setChatOrder(null) }}
          initialOrder={chatOrder}
        />
      )}
      {showResume && (
        <DesignerResume
          designer={showResume}
          onHire={(d: any) => { setShowResume(null); openOverlay(() => setBriefDesigner(d)) }}
          onClose={() => setShowResume(null)}
        />
      )}
      {selectedDesigner && (
        <DesignerProfile
          designer={selectedDesigner}
          onHire={(d: any) => { setSelectedDesigner(null); openOverlay(() => setBriefDesigner(d)) }}
          onMessage={() => { setSelectedDesigner(null); openOverlay(() => setShowChat(true)) }}
          onResume={(d: any) => { setSelectedDesigner(null); openOverlay(() => setShowResume(d)) }}
          onAnalytics={() => { setShowAnalytics(selectedDesigner); setSelectedDesigner(null) }}
          onClose={() => setSelectedDesigner(null)}
          isAdmin={isAdmin}
        />
      )}
      {showTerms   && <TermsPage onClose={() => setShowTerms(false)} />}
      {showContact && <ContactPage onClose={() => setShowContact(false)} />}
      {showAbout   && (
        <AboutPage
          onClose={() => setShowAbout(false)}
          onSignup={() => { setShowAbout(false); openOverlay(() => setShowSignup(true)) }}
          onContact={() => { setShowAbout(false); openOverlay(() => setShowContact(true)) }}
        />
      )}

      <Nav {...navProps} />

      {/* ── Hero ── */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <img src="/logo.png" alt="" style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', width: 340, maxWidth: '42vw', opacity: 0.045, pointerEvents: 'none', userSelect: 'none', zIndex: 1, filter: 'brightness(1.08)' }} />
        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ animation: heroIn ? 'fadeUp 0.8s ease forwards' : 'none', opacity: heroIn ? 1 : 0 }}>
            <Lbl style={{ marginBottom: 20 }}>The Sovereign Gallery</Lbl>
            <Hl className="hero-title" style={{ fontSize: 'clamp(42px,7vw,80px)', fontWeight: 300, marginBottom: 20, lineHeight: 1.0 }}>
              Elevating<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Ghanaian</em> Design
            </Hl>
            <Body style={{ fontSize: 16, marginBottom: 40, maxWidth: 440, lineHeight: 1.8 }}>
              A curated marketplace for Ghana&apos;s most prestigious visual storytellers. Connecting global brands with elite local craftsmanship.
            </Body>
            <div className="hero-buttons" style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
              <Btn variant="gold"  size="lg" onClick={() => scrollTo('marketplace')}>Find Your Designer →</Btn>
              <Btn variant="ghost" size="lg" onClick={() => scrollTo('how-it-works')}>How It Works</Btn>
            </div>
            <div className="stats-row" style={{ display: 'flex', gap: 36 }}>
              {[
                { n: `${REAL_STATS.verifiedCount}`, l: 'Verified Designers' },
                { n: `${REAL_STATS.totalOrders}`,   l: 'Active Projects'    },
                { n: `${REAL_STATS.commission}%`,   l: 'Commission Only'    },
              ].map((s) => (
                <div key={s.l}>
                  <Hl style={{ color: S.gold, fontSize: 28, fontWeight: 300, lineHeight: 1 }}>{s.n}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4 }}>{s.l}</Lbl>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-portrait" style={{ position: 'relative', animation: heroIn ? 'fadeUp 0.8s ease 0.2s forwards' : 'none', opacity: heroIn ? 1 : 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: S.radiusLg }}>
              <img src={DESIGNERS[0].portrait} alt={DESIGNERS[0].name} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(100%)', opacity: 0.8 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.9) 0%,rgba(19,19,19,0.1) 50%,transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>Elite Member</Lbl>
                <Hl style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>&quot;Crafting modern African narratives through a digital lens.&quot;</Hl>
                <Lbl style={{ margin: 0 }}>— {DESIGNERS[0].name}</Lbl>
              </div>
            </div>
          </div>
        </div>

        <div onClick={() => scrollTo('marketplace')} style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'pulse 2.5s ease infinite', cursor: 'pointer' }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom,transparent,${S.gold})` }} />
          <Lbl style={{ margin: 0, fontSize: 7 }}>Scroll</Lbl>
        </div>
      </section>

      {/* ── Platform stats ── */}
      <section style={{ background: S.surface, padding: '32px 40px', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20, opacity: 0.9 }}>
            <img src="/logo.png" alt="Accra Creatives Hub" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <Lbl style={{ margin: 0, color: S.gold }}>Platform Overview</Lbl>
          </div>
          <div className="platform-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: S.borderFaint }}>
            {[
              { label: 'Designers on Platform', value: REAL_STATS.designerCount,  suffix: ''   },
              { label: 'Verified Designers',    value: REAL_STATS.verifiedCount,  suffix: ''   },
              { label: 'Projects Completed',    value: REAL_STATS.completedOrders, suffix: ''  },
              { label: 'Platform Avg Rating',   value: REAL_STATS.avgRating,      suffix: ' ★' },
            ].map((s) => (
              <div key={s.label} style={{ background: S.bgLow, padding: '24px 28px', textAlign: 'center' }}>
                <div style={{ color: S.gold, fontSize: 32, fontFamily: S.headline, fontWeight: 300, lineHeight: 1 }}>{s.value}{s.suffix}</div>
                <Lbl style={{ margin: 0, marginTop: 8, fontSize: 9 }}>{s.label}</Lbl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketplace ── */}
      <section id="marketplace" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Lbl style={{ marginBottom: 12 }}>Selected by our Editorial Board</Lbl>
              <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300 }}>Featured Designers</Hl>
            </div>
            <Lbl style={{ color: S.gold }}>{REAL_STATS.designerCount} designers available</Lbl>
          </div>
          <div style={{ height: 1, background: S.borderFaint, marginBottom: 28 }} />

          <div className="search-row" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div className="market-search-input-row" style={{ display: 'flex', flex: 1, minWidth: 260, gap: 0 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, style, or category..."
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRight: 'none', color: S.text, padding: '12px 16px', fontFamily: S.body, fontSize: 14, outline: 'none', minHeight: 46, borderTopLeftRadius: S.radiusSm, borderBottomLeftRadius: S.radiusSm }}
                onFocus={(e: any) => (e.target.style.borderColor = S.gold)}
                onBlur={(e: any)  => (e.target.style.borderColor = S.border)}
              />
              <button style={{ background: S.gold, color: S.onPrimary, border: 'none', padding: '12px 20px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', minHeight: 46, borderTopRightRadius: S.radiusSm, borderBottomRightRadius: S.radiusSm }}>
                Search
              </button>
            </div>
            <div style={{ display: 'flex', gap: 1, background: S.borderFaint, flexWrap: 'wrap', borderRadius: S.radiusSm, overflow: 'hidden' }}>
              {cats.map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={{ background: category === c ? S.gold : S.surface, color: category === c ? S.onPrimary : S.textMuted, border: 'none', padding: '12px 16px', fontFamily: S.headline, fontSize: 9, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
            {filtered.map((d: any) => (
              <DesignerCard key={d.id} designer={d} onView={(d: any) => openOverlay(() => setSelectedDesigner(d))} onHire={(d: any) => openOverlay(() => setBriefDesigner(d))} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: S.textFaint }}>
              <div style={{ fontFamily: S.headline, fontSize: 24, fontStyle: 'italic', marginBottom: 10 }}>No designers found.</div>
              <Body style={{ fontSize: 12, margin: 0 }}>Try a different search term or category.</Body>
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ background: S.surface, padding: '96px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
          <Hl style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 300 }}>The Process of Craft</Hl>
          <GoldLine w="40px" />
          <Body style={{ fontSize: 14, maxWidth: 500, margin: '0 auto' }}>From brief to final delivery — every step is secure, transparent, and built for Ghana.</Body>
        </div>
        <div className="process-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: S.borderFaint, borderRadius: S.radiusSm, overflow: 'hidden' }}>
          {[
            { n: '01', i: '▣', t: 'Build Your Brief',     d: 'Fill out our structured brief form — project type, colours, references, and budget. Your designer gets everything they need from day one.', action: () => scrollTo('marketplace') },
            { n: '02', i: '◈', t: 'Collaborate Securely', d: 'Chat directly with your designer. Share files, track revisions, and iterate. Funds are held in escrow until you approve the final delivery.', action: null },
            { n: '03', i: '◉', t: 'Approve & Pay',        d: "When you're satisfied, approve the delivery. Funds are released instantly. Leave a review to help the community.", action: null },
          ].map((s, i) => (
            <div key={i} onClick={s.action || undefined} style={{ background: S.bgLow, padding: '42px 28px', position: 'relative', overflow: 'hidden', textAlign: 'center', cursor: s.action ? 'pointer' : 'default', transition: 'background 0.2s' }}
              onMouseEnter={(e: any) => { if (s.action) e.currentTarget.style.background = S.surface }}
              onMouseLeave={(e: any) => { if (s.action) e.currentTarget.style.background = S.bgLow }}
            >
              <div style={{ position: 'absolute', top: 12, right: 16, color: `${S.gold}06`, fontFamily: S.headline, fontSize: 80, fontWeight: 300, userSelect: 'none' }}>{s.n}</div>
              <div style={{ position: 'relative' }}>
                <div style={{ color: S.gold, fontSize: 28, marginBottom: 12 }}>{s.i}</div>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>{s.n}</Lbl>
                <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 14 }}>{s.t}</Hl>
                <Body style={{ fontSize: 12, lineHeight: 1.8 }}>{s.d}</Body>
                {s.action && <div style={{ marginTop: 16 }}><Btn variant="outline" size="sm" onClick={s.action}>Get Started →</Btn></div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Designers ── */}
      <section id="for-designers" className="for-designers-section" style={{ padding: '96px 40px', background: S.bgDeep }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="for-designers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <Lbl style={{ marginBottom: 16 }}>For Ghanaian Creatives</Lbl>
              <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, marginBottom: 16, lineHeight: 1.1 }}>
                Your talent deserves<br /><em style={{ fontStyle: 'italic', color: S.gold }}>better exposure.</em>
              </Hl>
              <GoldLine />
              <Body style={{ fontSize: 14, marginBottom: 32, lineHeight: 1.9 }}>
                Stop chasing clients through Instagram DMs. Build a verified profile, receive structured briefs, and get paid securely through escrow. Free to join — we only earn when you do.
              </Body>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Btn variant="gold" size="lg" onClick={() => openOverlay(() => setShowSignup(true))}>Apply to Join →</Btn>
                {/* ── FIX: Analytics Demo only visible to admins ── */}
                {isAdmin && (
                  <Btn variant="outline" size="lg" onClick={() => setShowAnalytics(DESIGNERS[0])}>See Analytics Demo</Btn>
                )}
              </div>
            </div>
            <div className="for-designers-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: S.borderFaint, borderRadius: S.radiusSm, overflow: 'hidden' }}>
              {[
                { i: '◈', t: 'Free to List',     d: 'Create your profile at no cost. We take 10% commission only when you complete an order.' },
                { i: '◉', t: 'Verified Badge',    d: 'Our editorial board reviews and approves every designer before they go live.' },
                { i: '◐', t: 'Secure Escrow',     d: 'Funds are held safely. You always get paid for work that is approved.' },
                { i: '◑', t: 'Referral Earnings', d: 'Earn GH₵20 for every client you refer who completes their first order.' },
              ].map((f, i) => (
                <div key={i} style={{ background: S.surface, padding: '28px 22px' }}>
                  <div style={{ color: S.gold, fontSize: 24, marginBottom: 12 }}>{f.i}</div>
                  <Hl style={{ fontSize: 17, fontWeight: 400, marginBottom: 8 }}>{f.t}</Hl>
                  <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{f.d}</Body>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-root" style={{ background: '#040404', borderTop: `1px solid ${S.borderFaint}`, padding: '56px 40px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src="/logo.png" alt="Accra Creatives Hub logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                <Hl style={{ fontSize: 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em', marginBottom: 0, lineHeight: 1 }}>ACCRA CREATIVES HUB</Hl>
              </div>
              <Body style={{ fontSize: 12, maxWidth: 280, lineHeight: 1.9, marginBottom: 20 }}>
                Ghana&apos;s first curated marketplace for verified graphic designers. Secure escrow. Real reviews. Built for the creative economy.
              </Body>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ v: REAL_STATS.designerCount, l: 'Designers' }, { v: REAL_STATS.totalOrders, l: 'Orders' }, { v: `${REAL_STATS.avgRating}★`, l: 'Avg Rating' }].map((s) => (
                  <div key={s.l}>
                    <div style={{ color: S.gold, fontSize: 20, fontFamily: S.headline }}>{s.v}</div>
                    <Lbl style={{ margin: 0, fontSize: 8 }}>{s.l}</Lbl>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <Lbl style={{ marginBottom: 16 }}>Platform</Lbl>
              {[
                { label: 'Marketplace',  fn: () => scrollTo('marketplace')  },
                { label: 'Designers',    fn: () => scrollTo('marketplace')  },
                { label: 'How It Works', fn: () => scrollTo('how-it-works') },
                { label: 'Messages',     fn: () => user ? openOverlay(() => setShowChat(true)) : openOverlay(() => setShowAuth(true)) },
                // ── FIX: Admin Panel only shows if isAdmin ──
                ...(isAdmin ? [{ label: 'Admin Panel', fn: () => openOverlay(() => setShowAdmin(true)) }] : []),
              ].map((l) => (
                <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{l.label}</div>
              ))}
            </div>

            {/* For Designers */}
            <div>
              <Lbl style={{ marginBottom: 16 }}>For Designers</Lbl>
              {[
                { label: 'Apply to Join',   fn: () => openOverlay(() => setShowSignup(true)) },
                { label: 'Designer Signup', fn: () => openOverlay(() => setShowSignup(true)) },
                { label: 'For Designers',   fn: () => scrollTo('for-designers')              },
                // ── FIX: Analytics Demo only for admins ──
                ...(isAdmin ? [{ label: 'Analytics Demo', fn: () => setShowAnalytics(DESIGNERS[0]) }] : []),
              ].map((l) => (
                <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{l.label}</div>
              ))}
            </div>

            {/* Company */}
            <div>
              <Lbl style={{ marginBottom: 16 }}>Company</Lbl>
              {[
                { label: 'About',         fn: () => openOverlay(() => setShowAbout(true))   },
                { label: 'How It Works',  fn: () => scrollTo('how-it-works')                },
                { label: 'For Designers', fn: () => scrollTo('for-designers')               },
                { label: 'Contact Us',    fn: () => openOverlay(() => setShowContact(true)) },
                { label: 'Terms',         fn: () => openOverlay(() => setShowTerms(true))   },
                // ── FIX: Privacy Policy link added ──
                { label: 'Privacy Policy', fn: () => openOverlay(() => setShowTerms(true))  },
              ].map((l) => (
                <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{l.label}</div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Body style={{ fontSize: 11, margin: 0 }}>
              ©️ {new Date().getFullYear()} Accra Creatives Hub · Sovereign Craft · {REAL_STATS.commission}% commission
              {' · '}
              <span onClick={() => openOverlay(() => setShowTerms(true))} style={{ color: S.gold, cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
              {' · '}
              {/* ── FIX: Privacy link in copyright bar ── */}
              <span onClick={() => openOverlay(() => setShowTerms(true))} style={{ color: S.gold, cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
            </Body>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Instagram', 'Twitter', 'LinkedIn', 'WhatsApp'].map((s) => (
                <span key={s} style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.gold)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}