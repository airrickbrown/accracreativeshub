// ── APP.TSX — MAIN ENTRY POINT ──
// This is where all the components come together.
// Think of this file as the "director" — it decides
// which component to show based on what the user clicks.
//
// COMPONENTS USED:
//   Nav                → top navigation bar
//   DesignerCard       → cards in the marketplace grid
//   DesignerProfile    → full profile page
//   BriefBuilder       → hire flow (3-step form)
//   MessagingInterface → chat between client and designer
//   AdminPanel         → platform management for you
//   DesignerDashboard  → analytics for designers
//   DesignerSignup     → application flow for new designers

import React, { useState, useEffect } from 'react'
import { S, kenteUrl } from './styles/tokens'
import { DESIGNERS } from './data/mockData'

// ── Import all components ──
import Nav               from './components/Nav'
import DesignerCard      from './components/DesignerCard'
import DesignerProfile   from './components/DesignerProfile'
import BriefBuilder      from './components/BriefBuilder'
import MessagingInterface from './components/MessagingInterface'
import AdminPanel        from './components/AdminPanel'
import DesignerDashboard from './components/DesignerDashboard'
import DesignerSignup    from './components/DesignerSignup'
import { Btn, Hl, Body, Lbl, GoldLine } from './components/UI'

export default function App() {
  // ── State — track which modal/page is open ──
  const [scrolled,         setScrolled]         = useState(false)
  const [heroIn,           setHeroIn]           = useState(false)
  const [category,         setCategory]         = useState('All')
  const [search,           setSearch]           = useState('')
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null)
  const [briefDesigner,    setBriefDesigner]    = useState<any>(null)
  const [showChat,         setShowChat]         = useState(false)
  const [showSignup,       setShowSignup]       = useState(false)
  const [showAdmin,        setShowAdmin]        = useState(false)
  const [showAnalytics,    setShowAnalytics]    = useState<any>(null)

  // ── On page load ──
  useEffect(() => {
    setTimeout(() => setHeroIn(true), 100)
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // ── Filter designers by category and search ──
  const cats     = ['All', 'Logo Design', 'Flyer & Social Media', 'Business Branding']
  const filtered = DESIGNERS.filter(d => {
    const matchCat    = category === 'All' || d.category === category
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.tagline.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.text, fontFamily: S.body, backgroundImage: kenteUrl }}>

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${S.bgDeep}; }
        ::-webkit-scrollbar-thumb { background: ${S.gold}30; }
        ::placeholder { color: ${S.textFaint}; }
        select option { background: ${S.bgLow}; color: ${S.text}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      `}</style>

      {/* ── Modals — only one shows at a time ── */}
      {showSignup       && <DesignerSignup    onClose={() => setShowSignup(false)} />}
      {showAdmin        && <AdminPanel        onClose={() => setShowAdmin(false)} />}
      {showAnalytics    && <DesignerDashboard designer={showAnalytics} onClose={() => setShowAnalytics(null)} />}
      {briefDesigner    && <BriefBuilder      designer={briefDesigner} onClose={() => setBriefDesigner(null)} />}
      {showChat         && <MessagingInterface onClose={() => setShowChat(false)} />}
      {selectedDesigner && (
        <DesignerProfile
          designer={selectedDesigner}
          onHire={d  => { setSelectedDesigner(null); setBriefDesigner(d) }}
          onMessage={() => { setSelectedDesigner(null); setShowChat(true) }}
          onAnalytics={() => { setShowAnalytics(selectedDesigner); setSelectedDesigner(null) }}
          onClose={() => setSelectedDesigner(null)}
        />
      )}

      {/* ── Navigation bar ── */}
      <Nav
        onAdmin={()    => setShowAdmin(true)}
        onSignup={()   => setShowSignup(true)}
        onMessages={() => setShowChat(true)}
        scrolled={scrolled}
      />

      {/* ════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>

          {/* Left — headline and CTA */}
          <div style={{ animation: heroIn ? 'fadeUp 0.8s ease forwards' : 'none', opacity: heroIn ? 1 : 0 }}>
            <Lbl style={{ marginBottom: 20 }}>The Sovereign Gallery</Lbl>
            <Hl style={{ fontSize: 'clamp(48px,7vw,80px)', fontWeight: 300, marginBottom: 20, lineHeight: 1.0 }}>
              Elevating<br /><em style={{ fontStyle: 'italic', color: S.gold }}>Ghanaian</em> Design
            </Hl>
            <Body style={{ fontSize: 16, marginBottom: 40, maxWidth: 440, lineHeight: 1.8 }}>
              A curated marketplace for Ghana's most prestigious visual storytellers. Connecting global brands with elite local craftsmanship.
            </Body>
            <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
              <Btn variant="gold" size="lg" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
                Find Your Designer →
              </Btn>
              <Btn variant="ghost" size="lg" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
                View Portfolio
              </Btn>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 36 }}>
              {[{ n: '200+', l: 'Verified Designers' }, { n: '4,800+', l: 'Projects Completed' }, { n: '10%', l: 'Commission Only' }].map(s => (
                <div key={s.l}>
                  <Hl style={{ color: S.gold, fontSize: 26, fontWeight: 300, lineHeight: 1 }}>{s.n}</Hl>
                  <Lbl style={{ margin: 0, marginTop: 4 }}>{s.l}</Lbl>
                </div>
              ))}
            </div>
          </div>

          {/* Right — featured designer portrait */}
          <div style={{ position: 'relative', animation: heroIn ? 'fadeUp 0.8s ease 0.2s forwards' : 'none', opacity: heroIn ? 1 : 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={DESIGNERS[0].portrait} alt={DESIGNERS[0].name} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(100%)', opacity: 0.8 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,19,0.9) 0%,rgba(19,19,19,0.1) 50%,transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>Elite Member</Lbl>
                <Hl style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>
                  "Crafting modern African narratives through a digital lens."
                </Hl>
                <Lbl style={{ margin: 0 }}>— {DESIGNERS[0].name}</Lbl>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'pulse 2.5s ease infinite' }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom,transparent,${S.gold})` }} />
          <Lbl style={{ margin: 0, fontSize: 7 }}>Scroll</Lbl>
        </div>
      </section>

      {/* ════════════════════════════════════
          SECTION 2 — MARKETPLACE / DESIGNER GRID
      ════════════════════════════════════ */}
      <section id="marketplace" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Lbl style={{ marginBottom: 12 }}>Selected by our Editorial Board</Lbl>
              <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300 }}>Featured Designers</Hl>
            </div>
            <Btn variant="ghost" onClick={() => {}}>View All Designers →</Btn>
          </div>
          <div style={{ height: 1, background: S.borderFaint, marginBottom: 28 }} />

          {/* Search + category filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flex: 1, minWidth: 260 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search designers, styles, categories..."
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRight: 'none', color: S.text, padding: '11px 16px', fontFamily: S.body, fontSize: 13, outline: 'none' }}
                onFocus={(e: any) => e.target.style.borderColor = S.gold}
                onBlur={(e: any)  => e.target.style.borderColor = S.border}
              />
              <button style={{ background: S.gold, color: S.onPrimary, border: 'none', padding: '11px 20px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Search
              </button>
            </div>
            {/* Category pills */}
            <div style={{ display: 'flex', gap: 1, background: S.borderFaint }}>
              {cats.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ background: category === c ? S.gold : S.surface, color: category === c ? S.onPrimary : S.textMuted, border: 'none', padding: '11px 18px', fontFamily: S.headline, fontSize: 9, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Designer cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {filtered.map(d => (
              <DesignerCard
                key={d.id}
                designer={d}
                onView={setSelectedDesigner}
                onHire={d => { setBriefDesigner(d) }}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: S.textFaint, fontFamily: S.headline, fontSize: 24, fontStyle: 'italic' }}>
              No designers found.
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ════════════════════════════════════ */}
      <section style={{ background: S.surface, padding: '96px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
          <Hl style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 300 }}>The Process of Craft</Hl>
          <GoldLine w="40px" />
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: S.borderFaint }}>
          {[
            { n: '01', i: '▣', t: 'Brief',       d: "Submit your vision through our curated brief portal. Define your brand's unique soul." },
            { n: '02', i: '◈', t: 'Collaborate',  d: 'Work directly with your chosen designer on our secure workspace. Iterate with precision.' },
            { n: '03', i: '◉', t: 'Deliver',      d: 'Receive high-end assets ready for the global stage. Sovereign craft, delivered.' },
          ].map((s, i) => (
            <div key={i} style={{ background: S.bgLow, padding: '48px 32px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
              {/* Big ghost number in background */}
              <div style={{ position: 'absolute', top: 12, right: 16, color: `${S.gold}06`, fontFamily: S.headline, fontSize: 80, fontWeight: 300, userSelect: 'none' }}>{s.n}</div>
              <div style={{ position: 'relative' }}>
                <div style={{ color: S.gold, fontSize: 28, marginBottom: 12 }}>{s.i}</div>
                <Lbl style={{ marginBottom: 8, color: S.gold }}>{s.n}</Lbl>
                <Hl style={{ fontSize: 22, fontWeight: 400, marginBottom: 14 }}>{s.t}</Hl>
                <Body style={{ fontSize: 12, lineHeight: 1.8 }}>{s.d}</Body>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          SECTION 4 — FOR DESIGNERS CTA
      ════════════════════════════════════ */}
      <section style={{ padding: '96px 40px', background: S.bgDeep }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40 }}>
          <div style={{ maxWidth: 520 }}>
            <Hl style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, marginBottom: 16 }}>For Ghanaian Creatives</Hl>
            <Body style={{ fontSize: 14, marginBottom: 32, lineHeight: 1.9 }}>
              Are you a designer pushing the boundaries of contemporary African aesthetic? Join our exclusive roster and connect with brands that value intellectual design and cultural authenticity.
            </Body>
          </div>
          <Btn variant="gold" size="lg" onClick={() => setShowSignup(true)}>
            Become a Verified Designer →
          </Btn>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ background: '#040404', borderTop: `1px solid ${S.borderFaint}`, padding: '48px 40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <Hl style={{ fontSize: 16, fontWeight: 700, color: S.gold, letterSpacing: '-0.02em', marginBottom: 16 }}>ACCRA CREATIVES HUB</Hl>
              <Body style={{ fontSize: 12, maxWidth: 280, lineHeight: 1.9 }}>
                Ghana's first curated marketplace for verified graphic designers. Secure escrow. Real reviews. Built for the creative economy.
              </Body>
            </div>
            {[
              { t: 'Platform',  links: ['About', 'Terms of Service', 'Privacy Policy', 'Contact Support', 'Instagram', 'LinkedIn'] },
              { t: 'Designers', links: ['Apply to Join', 'Designer Code', 'Verification', 'Referral Programme'] },
              { t: 'Company',   links: ['About', 'Blog', 'Partnerships', 'Press'] },
            ].map(col => (
              <div key={col.t}>
                <Lbl style={{ marginBottom: 16 }}>{col.t}</Lbl>
                {col.links.map(l => (
                  <div key={l} style={{ color: S.textFaint, fontSize: 12, fontFamily: S.body, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e: any) => e.target.style.color = S.text}
                    onMouseLeave={(e: any) => e.target.style.color = S.textFaint}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Body style={{ fontSize: 11, margin: 0 }}>© {new Date().getFullYear()} Accra Creatives Hub · Sovereign Craft.</Body>
          </div>
        </div>
      </footer>

    </div>
  )
}
