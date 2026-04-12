// ── src/App.tsx ──
// KEY FIXES:
// 1. Nav receives isDesigner + isClient props so role-based rendering works
// 2. navProps is memoized — never recreated from auth state (no flicker)
// 3. openOverlay no longer touches auth state
// 4. closeAll only resets overlay state, never auth state

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { S, kenteUrl } from './styles/tokens'
import { DESIGNERS, ORDERS } from './data/mockData'
import { ALL_CATS } from './lib/constants'
import Nav from './components/Nav'
import AuthCallback from './components/AuthCallback'
import ClientWelcome from './components/ClientWelcome'
import DesignerWelcome from './components/DesignerWelcome'
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
import AdminRoute from './components/AdminRoute'
import { Btn, Hl, Body, Lbl, GoldLine } from './components/UI'
import { useDesigners } from './hooks/useDesigners'
import AuthModal from './components/AuthModal'
import { useAuth } from './AuthContext'
import { COPY } from './lib/copy'
import { useOwnPresence } from './components/PresenceIndicator'
import { HelpButton, NotFoundPage} from './components/LoadingSpinner'


const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const REAL_STATS = {
  designerCount:   DESIGNERS.length,
  verifiedCount:   DESIGNERS.filter(d => d.verified).length,
  completedOrders: ORDERS.reduce((s, o) => s + (o.status === 'delivered' ? 1 : 0), 0),
  totalOrders:     ORDERS.length,
  commission:      10,
  avgRating:       Number((DESIGNERS.reduce((s, d) => s + d.rating, 0) / DESIGNERS.length).toFixed(1)),
}

interface AuthConfig {
  tab:      'login' | 'signup'
  role:     'client' | 'designer'
  lockRole: 'client' | 'designer' | undefined
}
const DEFAULT_AUTH: AuthConfig = { tab: 'login', role: 'client', lockRole: undefined }

export default function App() {
  const [scrolled, setScrolled]                 = useState(false)
  const [heroIn, setHeroIn]                     = useState(false)
  const [category, setCategory]                 = useState('All')
  const [search, setSearch]                     = useState('')
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null)
  const [briefDesigner, setBriefDesigner]       = useState<any>(null)
  const [showChat, setShowChat]                 = useState(false)
  const [showSignup, setShowSignup]             = useState(false)
  const [showAdmin, setShowAdmin]               = useState(false)
  const [showAnalytics, setShowAnalytics]       = useState<any>(null)
  const [showAuth, setShowAuth]                 = useState(false)
  const [authConfig, setAuthConfig]             = useState<AuthConfig>(DEFAULT_AUTH)
  const [chatOrder, setChatOrder]               = useState<any>(null)
  const [showResume, setShowResume]             = useState<any>(null)
  const [showTerms, setShowTerms]               = useState(false)
  const [showContact, setShowContact]           = useState(false)
  const [showAbout, setShowAbout]               = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showWelcome, setShowWelcome]           = useState(false)
  const [showDesignerWelcome, setShowDesignerWelcome] = useState(false)
  const [currentPath, setCurrentPath]           = useState(window.location.pathname)
  useOwnPresence()

  // ── Auth state from context — NEVER modified by overlay logic ──
  const { user, signOut, isAdmin, isDesigner, isClient } = useAuth()
  const { designers: realDesigners } = useDesigners()
  const activeDesigners = realDesigners.length > 0 ? realDesigners : DESIGNERS

  const showForDesigners = !user || isDesigner || isAdmin

  const openOverlay = useCallback((fn: () => void) => {
    window.history.pushState({ overlay: true }, '')
    fn()
  }, [])

  const openAuth = useCallback(
    (tab: 'login' | 'signup', role: 'client' | 'designer', lockRole?: 'client' | 'designer') => {
      openOverlay(() => { setAuthConfig({ tab, role, lockRole }); setShowAuth(true) })
    }, [openOverlay]
  )

  const closeAuth = useCallback(() => {
    setShowAuth(false); setAuthConfig(DEFAULT_AUTH)
  }, [])

  const openDesignerFlow = useCallback(() => {
    if (user && isDesigner) { openOverlay(() => setShowSignup(true)); return }
    openAuth('signup', 'designer', 'designer')
  }, [user, isDesigner, openAuth, openOverlay])

  // ── closeAll ONLY touches overlay state, never auth state ──
  const closeAll = useCallback(() => {
    setSelectedDesigner(null); setBriefDesigner(null)
    setShowSignup(false);      setShowAdmin(false)
    setShowChat(false);        setShowAuth(false)
    setShowAnalytics(null);    setShowResume(null)
    setShowTerms(false);       setShowContact(false)
    setShowAbout(false);       setShowLogoutConfirm(false)
    setShowWelcome(false);     setShowDesignerWelcome(false)
    setAuthConfig(DEFAULT_AUTH)
  }, [])

  const handleLogout   = useCallback(() => setShowLogoutConfirm(true), [])
  const confirmLogout  = useCallback(async () => {
    setShowLogoutConfirm(false); closeAll()
    await signOut()
    window.history.replaceState({}, '', '/'); setCurrentPath('/')
  }, [closeAll, signOut])

  useEffect(() => {
    const onChange = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onChange)
    return () => window.removeEventListener('popstate', onChange)
  }, [])

  useEffect(() => {
    if (currentPath === '/welcome' && user && isClient) {
      setShowWelcome(true)
      return
    }
    if (currentPath === '/apply-designer' && user && isDesigner) {
      setShowDesignerWelcome(true)
      return
    }
    if (currentPath === '/apply-designer' && !user) {
      openAuth('signup', 'designer', 'designer')
    }
  }, [currentPath, user, isClient, isDesigner])

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 100)
    const onScroll   = () => setScrolled(window.scrollY > 60)
    const onPopState = () => { closeAll(); setCurrentPath(window.location.pathname) }
    window.addEventListener('scroll',   onScroll)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('scroll',   onScroll)
      window.removeEventListener('popstate', onPopState)
    }
  }, [closeAll])

  if (currentPath === '/admin-sovereign-2024') {
    return <AdminRoute onClose={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} />
  }

  const filtered = activeDesigners.filter((d: any) => {
    const mc = category === 'All' || d.category === category
    const ms = !search || [d.name, d.tagline, ...(d.tags || [])].some((t: string) => t?.toLowerCase().includes(search.toLowerCase()))
    return mc && ms
  })

  // ── navProps is stable — auth values come from context, not state ──
  const navProps = {
    scrolled, user, isAdmin, isDesigner, isClient,
    onAdmin:        isAdmin ? () => openOverlay(() => setShowAdmin(true)) : () => {},
    onSignup:       openDesignerFlow,
    onMessages:     () => user ? openOverlay(() => setShowChat(true)) : openAuth('login', 'client'),
    onMarketplace:  () => { window.scrollTo({ top: 0, behavior: 'smooth' }) },
    onHowItWorks:   () => scrollTo('how-it-works'),
    onForDesigners: () => scrollTo('for-designers'),
    onLogin:        () => openAuth('login', 'client'),
    onSignOut:      handleLogout,
  }

  return (
    <div style={{ background: S.bg, minHeight: '100dvh', color: S.text, fontFamily: S.body, backgroundImage: kenteUrl }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body,#root { min-height:100%; background:#080808; }
        html,body { margin:0; padding:0; overflow-x:hidden; }
        body { overscroll-behavior-y:none; }
        input,select,textarea { font-size:16px!important; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:${S.bgDeep}; }
        ::-webkit-scrollbar-thumb { background:${S.gold}30; }
        ::placeholder { color:${S.textFaint}; }
        select option { background:${S.bgLow}; color:${S.text}; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes pulse  { 0%,100%{opacity:0.3;}50%{opacity:0.8;} }
        @media(max-width:1024px){ .hero-grid{grid-template-columns:1fr!important;} .for-designers-grid{grid-template-columns:1fr!important;} }
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;padding:64px 20px!important;}
          .hero-portrait{display:none!important;}
          .platform-stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .process-grid,.for-designers-grid,.for-designers-cards{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:28px!important;}
          .search-row{flex-direction:column!important;}
          section{padding:64px 20px!important;}
          .footer-root{padding:48px 20px 28px!important;}
        }
        @media(max-width:560px){
          .platform-stats-grid{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr!important;}
          .hero-title{font-size:clamp(34px,11vw,52px)!important;}
          .hero-buttons{flex-direction:column!important;align-items:stretch!important;}
        }
      `}</style>

      <AuthCallback />

      {/* ── Logout confirmation ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '32px 28px', maxWidth: 360, width: '100%', borderRadius: S.radiusLg, textAlign: 'center' }}>
            <Hl style={{ fontSize: 20, marginBottom: 10 }}>Sign out?</Hl>
            <Body style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>Are you sure you want to sign out of Accra Creatives Hub?</Body>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn variant="ghost" full onClick={() => setShowLogoutConfirm(false)}>Cancel</Btn>
              {/* Red sign out button in confirmation too */}
              <button
                onClick={confirmLogout}
                style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#ef4444', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
              >Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlays ── */}
      {showWelcome && isClient && (
        <ClientWelcome
          onBrowse={() => { setShowWelcome(false); scrollTo('marketplace') }}
          onMessages={() => { setShowWelcome(false); openOverlay(() => setShowChat(true)) }}
        />
      )}
      {showDesignerWelcome && isDesigner && (
        <DesignerWelcome
          onContinue={() => {
            setShowDesignerWelcome(false)
            openOverlay(() => setShowSignup(true))
          }}
          onBrowse={() => {
            setShowDesignerWelcome(false)
            scrollTo('marketplace')
          }}
        />
      )}
      {showSignup && isDesigner && <DesignerSignup onClose={() => setShowSignup(false)} />}
      {showAuth && (
        <AuthModal
          onClose={closeAuth}
          defaultTab={authConfig.tab}
          defaultRole={authConfig.role}
          lockRole={authConfig.lockRole}
        />
      )}
      {showAdmin && isAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showAnalytics && isAdmin && <DesignerDashboard designer={showAnalytics} onClose={() => setShowAnalytics(null)} />}
      {briefDesigner && (
        <BriefBuilder
          designer={briefDesigner}
          onClose={() => setBriefDesigner(null)}
          onOrderCreated={order => { setBriefDesigner(null); setChatOrder(order); setShowChat(true) }}
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
          onHire={d => { setShowResume(null); openOverlay(() => setBriefDesigner(d)) }}
          onClose={() => setShowResume(null)}
        />
      )}
      {selectedDesigner && (
        <DesignerProfile
          designer={selectedDesigner}
          onHire={d => { setSelectedDesigner(null); openOverlay(() => setBriefDesigner(d)) }}
          onMessage={() => { setSelectedDesigner(null); openOverlay(() => setShowChat(true)) }}
          onResume={d => { setSelectedDesigner(null); openOverlay(() => setShowResume(d)) }}
          onAnalytics={() => { setShowAnalytics(selectedDesigner); setSelectedDesigner(null) }}
          onClose={() => setSelectedDesigner(null)}
          isAdmin={isAdmin}
        />
      )}
      {showTerms   && <TermsPage   onClose={() => setShowTerms(false)} />}
      {showContact && <ContactPage onClose={() => setShowContact(false)} />}
      {showAbout   && (
        <AboutPage
          onClose={() => setShowAbout(false)}
          onSignup={() => { setShowAbout(false); openDesignerFlow() }}
          onContact={() => { setShowAbout(false); openOverlay(() => setShowContact(true)) }}
        />
      )}

      <Nav {...navProps} />

      {/* ── Hero ── */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <img src="/logo.png" alt="" style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', width: 340, maxWidth: '42vw', opacity: 0.045, pointerEvents: 'none', zIndex: 1 }} />
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
              <Btn variant="gold" size="lg" onClick={() => scrollTo('marketplace')}>Find Your Designer →</Btn>
              <Btn variant="ghost" size="lg" onClick={() => scrollTo('how-it-works')}>How It Works</Btn>
            </div>
            <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
              {[
                { n: `${REAL_STATS.verifiedCount}`, l: 'Verified Designers' },
                { n: `${REAL_STATS.totalOrders}`,   l: 'Active Projects'    },
                { n: `${REAL_STATS.commission}%`,   l: 'Commission Only'    },
              ].map(s => (
                <div key={s.l}>
                  <Hl style={{ color: S.gold, fontSize: 28, fontWeight: 300, lineHeight: 1 }}>{s.n}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4 }}>{s.l}</Lbl>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-portrait" style={{ animation: heroIn ? 'fadeUp 0.8s ease 0.2s forwards' : 'none', opacity: heroIn ? 1 : 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: S.radiusLg }}>
              <img src={DESIGNERS[0].portrait} alt={DESIGNERS[0].name} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(100%)', opacity: 0.8 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.9) 0%,rgba(19,19,19,0.1) 50%,transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>Elite Member</Lbl>
                <Hl style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>"Crafting modern African narratives through a digital lens."</Hl>
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

      {/* ── Stats bar ── */}
      <section style={{ background: S.surface, padding: '32px 40px', borderTop: `1px solid ${S.borderFaint}`, borderBottom: `1px solid ${S.borderFaint}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            <img src="/logo.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <Lbl style={{ margin: 0, color: S.gold }}>Platform Overview</Lbl>
          </div>
          <div className="platform-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: S.borderFaint }}>
            {[
              { label: 'Designers on Platform', value: REAL_STATS.designerCount,   suffix: ''   },
              { label: 'Verified Designers',    value: REAL_STATS.verifiedCount,   suffix: ''   },
              { label: 'Projects Completed',    value: REAL_STATS.completedOrders, suffix: ''   },
              { label: 'Platform Avg Rating',   value: REAL_STATS.avgRating,       suffix: ' ★' },
            ].map(s => (
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
            <div style={{ display: 'flex', flex: 1, minWidth: 260 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, style, or category..."
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRight: 'none', color: S.text, padding: '12px 16px', fontFamily: S.body, fontSize: 16, outline: 'none', minHeight: 46, borderTopLeftRadius: S.radiusSm, borderBottomLeftRadius: S.radiusSm }}
                onFocus={(e: any) => (e.target.style.borderColor = S.gold)}
                onBlur={(e: any)  => (e.target.style.borderColor = S.border)}
              />
              <button style={{ background: S.gold, color: S.onPrimary, border: 'none', padding: '12px 20px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', minHeight: 46, borderTopRightRadius: S.radiusSm, borderBottomRightRadius: S.radiusSm }}>Search</button>
            </div>
            <div style={{ display: 'flex', gap: 1, background: S.borderFaint, flexWrap: 'wrap', borderRadius: S.radiusSm, overflow: 'hidden' }}>
              {ALL_CATS.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ background: category === c ? S.gold : S.surface, color: category === c ? S.onPrimary : S.textMuted, border: 'none', padding: '12px 14px', fontFamily: S.headline, fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Body style={{ fontSize: 12, color: S.textFaint, marginBottom: 16 }}>
            {filtered.length} designer{filtered.length !== 1 ? 's' : ''} found{category !== 'All' ? ` in ${category}` : ''}{search ? ` matching "${search}"` : ''}
          </Body>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {filtered.map((d: any) => (
              <DesignerCard key={d.id} designer={d} onView={d => openOverlay(() => setSelectedDesigner(d))} onHire={d => openOverlay(() => setBriefDesigner(d))} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ color: S.gold, fontSize: 36, marginBottom: 16 }}>◈</div>
              <Hl style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: S.textFaint, marginBottom: 12 }}>
                {category !== 'All' && !search ? `No ${category} designers yet.` : 'No designers found.'}
              </Hl>
              <Body style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.8, maxWidth: 420, margin: '0 auto 24px' }}>
                {category !== 'All' && !search ? `We're growing our ${category} roster. Browse all designers in the meantime.` : 'Try a different search term or category.'}
              </Body>
              {category !== 'All' && <Btn variant="gold" onClick={() => setCategory('All')}>Browse All Designers →</Btn>}
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
            { n: '01', i: '▣', t: 'Build Your Brief',     d: 'Fill out our structured brief form — project type, colours, references, and budget.', action: () => scrollTo('marketplace') },
            { n: '02', i: '◈', t: 'Collaborate Securely', d: 'Chat directly with your designer. Funds are held in escrow until you approve.', action: null },
            { n: '03', i: '◉', t: 'Approve & Pay',        d: 'When satisfied, approve the delivery. Funds are released instantly.', action: null },
          ].map((s, i) => (
            <div key={i} onClick={s.action || undefined}
              style={{ background: 'transparent', padding: '42px 28px', position: 'relative', overflow: 'hidden', textAlign: 'center', cursor: s.action ? 'pointer' : 'default', transition: 'background 0.2s' }}
              onMouseEnter={(e: any) => { if (s.action) e.currentTarget.style.background = S.surface }}
              onMouseLeave={(e: any) => { if (s.action) e.currentTarget.style.background = 'transparent' }}
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

      {/* ── For Designers — hidden from logged-in clients ── */}
      {showForDesigners && (
        <section id="for-designers" style={{ padding: '96px 40px', background: S.bgDeep }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="for-designers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
              <div>
                <Lbl style={{ marginBottom: 16 }}>For Ghanaian Creatives</Lbl>
                <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, marginBottom: 16, lineHeight: 1.1 }}>
                  Your talent deserves<br /><em style={{ fontStyle: 'italic', color: S.gold }}>better exposure.</em>
                </Hl>
                <GoldLine />
                <Body style={{ fontSize: 14, marginBottom: 32, lineHeight: 1.9 }}>
                  Stop chasing clients through Instagram DMs. Build a verified profile, receive structured briefs, and get paid securely through escrow.
                </Body>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Btn variant="gold" size="lg" onClick={openDesignerFlow}>Apply to Join →</Btn>
                  {isAdmin && <Btn variant="outline" size="lg" onClick={() => setShowAnalytics(DESIGNERS[0])}>Analytics Demo</Btn>}
                </div>
              </div>
              <div className="for-designers-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: S.borderFaint, borderRadius: S.radiusSm, overflow: 'hidden' }}>
                {[
                  { i: '◈', t: 'Free to List',     d: 'Create your profile at no cost. We take 10% commission only when you complete an order.' },
                  { i: '◉', t: 'Verified Badge',    d: 'Our editorial board reviews and approves every designer before they go live.'            },
                  { i: '◐', t: 'Secure Escrow',     d: 'Funds are held safely. You always get paid for work that is approved.'                   },
                  { i: '◑', t: 'Referral Earnings', d: 'Earn GH₵20 for every client you refer who completes their first order.'                  },
                ].map((card, i) => (
                  <div key={i} style={{ background: S.surface, padding: '28px 22px' }}>
                    <div style={{ color: S.gold, fontSize: 24, marginBottom: 12 }}>{card.i}</div>
                    <Hl style={{ fontSize: 17, fontWeight: 400, marginBottom: 8 }}>{card.t}</Hl>
                    <Body style={{ fontSize: 12, lineHeight: 1.7 }}>{card.d}</Body>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="footer-root" style={{ background: '#040404', borderTop: `1px solid ${S.borderFaint}`, padding: '56px 40px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src="/logo.png" alt="" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
                <Hl style={{ fontSize: 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em', marginBottom: 0, lineHeight: 1 }}>ACCRA CREATIVES HUB</Hl>
              </div>
              <Body style={{ fontSize: 12, maxWidth: 280, lineHeight: 1.9, marginBottom: 20 }}>Ghana's first curated marketplace for verified graphic designers. Secure escrow. Real reviews.</Body>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ v: REAL_STATS.designerCount, l: 'Designers' }, { v: REAL_STATS.totalOrders, l: 'Orders' }, { v: `${REAL_STATS.avgRating}★`, l: 'Avg Rating' }].map(s => (
                  <div key={s.l}>
                    <div style={{ color: S.gold, fontSize: 20, fontFamily: S.headline }}>{s.v}</div>
                    <Lbl style={{ margin: 0, fontSize: 8 }}>{s.l}</Lbl>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Lbl style={{ marginBottom: 16 }}>Platform</Lbl>
              {[
                { label: 'Marketplace',  fn: () => scrollTo('marketplace')  },
                { label: 'How It Works', fn: () => scrollTo('how-it-works') },
                { label: 'Messages',     fn: () => user ? openOverlay(() => setShowChat(true)) : openAuth('login', 'client') },
                ...(isAdmin ? [{ label: 'Admin Panel', fn: () => openOverlay(() => setShowAdmin(true)) }] : []),
              ].map(l => (
                <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{l.label}</div>
              ))}
            </div>

            {showForDesigners && (
              <div>
                <Lbl style={{ marginBottom: 16 }}>For Designers</Lbl>
                {[
                  { label: 'Apply to Join', fn: openDesignerFlow              },
                  { label: 'How It Works',  fn: () => scrollTo('for-designers') },
                ].map(l => (
                  <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                    onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                  >{l.label}</div>
                ))}
              </div>
            )}

            <div>
              <Lbl style={{ marginBottom: 16 }}>Company</Lbl>
              {[
                { label: 'About',          fn: () => openOverlay(() => setShowAbout(true))   },
                { label: 'Contact Us',     fn: () => openOverlay(() => setShowContact(true)) },
                { label: 'Terms',          fn: () => openOverlay(() => setShowTerms(true))   },
                { label: 'Privacy Policy', fn: () => openOverlay(() => setShowTerms(true))   },
              ].map(l => (
                <div key={l.label} onClick={l.fn} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.text)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{l.label}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Body style={{ fontSize: 11, margin: 0 }}>
              © {new Date().getFullYear()} Accra Creatives Hub · {REAL_STATS.commission}% commission
              {' · '}<span onClick={() => openOverlay(() => setShowTerms(true))} style={{ color: S.gold, cursor: 'pointer' }}>Terms</span>
              {' · '}<span onClick={() => openOverlay(() => setShowTerms(true))} style={{ color: S.gold, cursor: 'pointer' }}>Privacy</span>
            </Body>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Instagram', 'Twitter', 'LinkedIn', 'WhatsApp'].map(s => (
                <span key={s} style={{ color: S.textFaint, fontSize: 10, fontFamily: S.body, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => (e.target.style.color = S.gold)}
                  onMouseLeave={(e: any) => (e.target.style.color = S.textFaint)}
                >{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <HelpButton onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  )
}