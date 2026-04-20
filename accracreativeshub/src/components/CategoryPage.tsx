// ── src/components/CategoryPage.tsx ──
//
// Full-page SEO landing page for each design category.
// Served at /designers/logo-design, /designers/branding, etc.
// Returns early from App.tsx — NOT an overlay.
//
// Each page has:
//   - Unique H1, H2s, and descriptive copy
//   - Live designer cards from Supabase
//   - FAQ section (keyword-rich, good for featured snippets)
//   - Internal links to other categories
//   - CTA to homepage marketplace
//   - Person schema for each listed designer
//   - BreadcrumbList schema

import React, { useEffect, useState } from 'react'
import { S } from '../styles/tokens'
import { useSEO } from '../hooks/useSEO'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../lib/constants'

const BASE = 'https://www.accracreativeshub.com'

// ── Slug ↔ Category mapping ───────────────────────────────────
export const CATEGORY_SLUGS: Record<string, string> = {
  'logo-design':          'Logo Design',
  'branding':             'Business Branding',
  'flyer-design':         'Flyer Design',
  'social-media-design':  'Social Media Design',
  'ui-ux-design':         'UI/UX Design',
  'motion-graphics':      'Motion Graphics',
}

export const SLUG_FROM_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([slug, cat]) => [cat, slug])
)

// ── Per-category SEO copy ─────────────────────────────────────
interface CategoryMeta {
  h1:          string
  metaTitle:   string
  metaDesc:    string
  intro:       string
  whyGhana:    string
  faqs:        { q: string; a: string }[]
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  'Logo Design': {
    h1:        'Logo Designers in Ghana',
    metaTitle: 'Logo Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire verified logo designers in Ghana. Curated talent from Accra and across Ghana. Professional logo design from GHS 300. Escrow-protected payments.',
    intro:     'Find Ghana\'s best logo designers — verified, curated, and ready to build your brand identity from the ground up. Every designer on Accra Creatives Hub is reviewed by our editorial team before they go live.',
    whyGhana:  'Ghanaian designers bring a unique blend of African visual culture and modern design sensibility to every logo. Whether you need a mark that speaks to a local Accra market or a global audience, our designers understand both worlds.',
    faqs: [
      { q: 'How much does a logo designer cost in Ghana?', a: 'Professional logo design in Ghana typically ranges from GHS 300 to GHS 2,500 depending on the designer\'s experience and deliverables. All prices on Accra Creatives Hub are transparent and fixed before work begins.' },
      { q: 'How long does logo design take in Ghana?', a: 'Most logo projects on Accra Creatives Hub are delivered within 3–7 business days. Rush delivery options are available with select designers.' },
      { q: 'Are the logo designers on Accra Creatives Hub verified?', a: 'Yes. Every designer submits a portfolio, identity document, and professional bio. Our editorial team reviews each application before the designer goes live on the platform.' },
      { q: 'Can I get a full brand identity, not just a logo?', a: 'Yes. Many of our logo designers also offer full brand identity packages including brand guidelines, business card design, and letterhead.' },
    ],
  },
  'Business Branding': {
    h1:        'Business Branding Designers in Ghana',
    metaTitle: 'Business Branding Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire verified brand identity designers in Ghana. Full branding packages from Accra\'s top designers. Logo, guidelines, stationery. Escrow payments.',
    intro:     'Build a brand that lasts. Our curated branding designers in Ghana create complete brand identities — from strategy to final assets — that position your business for long-term recognition.',
    whyGhana:  'Ghana\'s design scene has matured into a world-class creative ecosystem. Accra-based brand designers work with multinational corporations, NGOs, and fast-growing local startups daily. You get global quality at local rates.',
    faqs: [
      { q: 'What is included in a branding package in Ghana?', a: 'A full branding package typically includes a logo suite, colour palette, typography system, brand guidelines document, business card design, and letterhead. Our designers itemise deliverables clearly in every brief.' },
      { q: 'How much does business branding cost in Ghana?', a: 'Business branding packages in Ghana range from GHS 800 to GHS 5,000+. The price depends on the scope of deliverables and the designer\'s experience level.' },
      { q: 'Can a branding designer work with my existing logo?', a: 'Yes. Many of our branding designers specialise in brand evolution — building a full identity system around an existing logo mark rather than starting from scratch.' },
    ],
  },
  'Flyer Design': {
    h1:        'Flyer Designers in Ghana',
    metaTitle: 'Flyer Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire professional flyer designers in Ghana. Event flyers, promotional materials, church programs. Fast delivery. Verified designers in Accra and Kumasi.',
    intro:     'Get attention-grabbing flyers designed by Ghana\'s best. Whether it\'s an event, promotion, church programme, or product launch — our verified flyer designers deliver print-ready files fast.',
    whyGhana:  'Ghana\'s event culture demands sharp, bold, high-energy design. Our flyer designers know how to build visual hierarchy that works in markets from Osu to Kumasi — in print and on WhatsApp.',
    faqs: [
      { q: 'How quickly can I get a flyer designed in Ghana?', a: 'Most flyer projects are completed in 24–48 hours. Rush same-day delivery is available with select designers on Accra Creatives Hub.' },
      { q: 'What file formats will I receive?', a: 'Standard deliverables include print-ready PDF (CMYK, 300dpi), PNG for digital use, and editable source files (AI or PSD) where specified.' },
      { q: 'Can designers create flyers in both English and Twi?', a: 'Yes. Many of our designers are fluent in local Ghanaian languages and can design bilingual flyers. Specify this requirement in your project brief.' },
    ],
  },
  'Social Media Design': {
    h1:        'Social Media Designers in Ghana',
    metaTitle: 'Social Media Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire social media designers in Ghana. Instagram posts, Facebook banners, Twitter graphics. Consistent brand visuals. Verified designers in Accra.',
    intro:     'Stand out in the feed. Ghana\'s social media landscape is competitive — our verified designers create scroll-stopping visuals for Instagram, Facebook, TikTok, and Twitter that build brand recognition.',
    whyGhana:  'Ghanaian brands have some of the most engaged social media audiences in Africa. Our social media designers understand platform nuances, local cultural references, and what actually gets shared.',
    faqs: [
      { q: 'What social media platforms do Ghana designers work with?', a: 'Our designers work across Instagram, Facebook, Twitter/X, TikTok, LinkedIn, and WhatsApp. Each platform has different size requirements — designers deliver correctly sized assets for each.' },
      { q: 'Can I get a monthly social media content package?', a: 'Yes. Many designers on Accra Creatives Hub offer retainer packages for ongoing social media content — typically 8, 16, or 30 posts per month with consistent branding.' },
      { q: 'How do I ensure brand consistency across posts?', a: 'Share your brand guidelines or existing visual identity in the brief. Designers will create a template system that keeps every post on-brand.' },
    ],
  },
  'UI/UX Design': {
    h1:        'UI/UX Designers in Ghana',
    metaTitle: 'UI/UX Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire UI/UX designers in Ghana. Mobile app design, web interfaces, user research, prototyping. Verified Accra-based product designers.',
    intro:     'Build products people love. Our verified UI/UX designers in Ghana combine global product design standards with deep understanding of African user behaviour — critical for products built for local markets.',
    whyGhana:  'Ghana\'s tech sector is growing fast. Accra is home to a new generation of product designers who work with mobile-first, low-bandwidth contexts as a baseline — not an afterthought.',
    faqs: [
      { q: 'What tools do UI/UX designers in Ghana use?', a: 'Most designers on Accra Creatives Hub work with Figma as their primary tool, delivering interactive prototypes, component libraries, and design system documentation.' },
      { q: 'Can a Ghana-based designer understand my international audience?', a: 'Yes. Many of our UI/UX designers have worked with international teams and understand global UX standards. They bring the added value of designing for users in Africa and emerging markets.' },
      { q: 'Do I get source files after the project?', a: 'Yes. All projects on Accra Creatives Hub include source file delivery. For UI/UX, this means Figma files with organised layers, components, and auto-layout.' },
    ],
  },
  'Motion Graphics': {
    h1:        'Motion Graphics Designers in Ghana',
    metaTitle: 'Motion Graphics Designers in Ghana | Accra Creatives Hub',
    metaDesc:  'Hire motion graphics designers in Ghana. Animated logos, video intros, explainer videos, social media animations. Verified designers in Accra.',
    intro:     'Bring your brand to life. Our motion graphics designers in Ghana create animated logos, explainer videos, social media animations, and video intros that elevate your brand above static design.',
    whyGhana:  'Ghana\'s media and entertainment industry is one of the most vibrant in West Africa. Our motion designers have produced content for major Ghanaian brands, broadcast media, and international organisations.',
    faqs: [
      { q: 'What types of motion graphics can I commission in Ghana?', a: 'Our designers produce animated logo reveals, explainer videos, social media motion posts, title cards, lower thirds, and full video production packages.' },
      { q: 'What video formats are delivered?', a: 'Standard delivery includes MP4 (H.264) for digital use, MOV with transparency where needed, and GIF for social media. Frame rates and resolutions are specified in each brief.' },
      { q: 'How long does a motion graphics project take?', a: 'Simple animations (logo reveal, social motion post) take 2–5 days. Longer explainer videos (60–90 seconds) typically require 7–14 days including revision rounds.' },
    ],
  },
}

interface Props {
  slug:   string
  onBack: () => void
}

function slugToPath(slug: string) {
  return `/designers/${slug}`
}

export default function CategoryPage({ slug, onBack }: Props) {
  const category = CATEGORY_SLUGS[slug]
  const meta     = category ? CATEGORY_META[category] : null

  const [designers, setDesigners] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)

  // Load live designers for this category
  useEffect(() => {
    if (!category) return
    supabase
      .from('designers')
      .select('id, badge, featured, category, profiles:id(full_name, avatar_url), tagline, starting_price')
      .eq('category', category)
      .eq('public_visible', true)
      .eq('verified', true)
      .order('featured', { ascending: false })
      .limit(9)
      .then(({ data }) => { setDesigners(data || []); setLoading(false) })
  }, [category])

  // Schema: BreadcrumbList + ItemList of designers
  const schema = meta ? [
    {
      '@context':      'https://schema.org',
      '@type':         'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',      'item': BASE },
        { '@type': 'ListItem', 'position': 2, 'name': 'Designers', 'item': `${BASE}/designers` },
        { '@type': 'ListItem', 'position': 3, 'name': meta.h1,     'item': `${BASE}${slugToPath(slug)}` },
      ],
    },
    {
      '@context':  'https://schema.org',
      '@type':     'CollectionPage',
      'name':      meta.metaTitle,
      'url':       `${BASE}${slugToPath(slug)}`,
      'description': meta.metaDesc,
      'about': { '@type': 'Service', 'name': category, 'areaServed': { '@type': 'Country', 'name': 'Ghana' } },
    },
  ] : undefined

  useSEO(meta ? {
    title:       meta.metaTitle,
    description: meta.metaDesc,
    canonical:   `${BASE}${slugToPath(slug)}`,
    schema,
  } : {
    title:       "Designers in Ghana | Accra Creatives Hub",
    description: "Browse verified graphic designers in Ghana.",
    noindex:     true,
  })

  // 404 for unknown slugs
  if (!category || !meta) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: S.bgDeep, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ color: S.textMuted, fontFamily: S.body }}>Page not found.</p>
        <button onClick={onBack} style={{ color: S.gold, background: 'none', border: `1px solid ${S.gold}`, padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontFamily: S.body }}>
          ← Back to Homepage
        </button>
      </div>
    )
  }

  const otherCategories = CATEGORIES.filter(c => c !== category)

  return (
    <div style={{ background: S.bgDeep, minHeight: '100dvh', color: S.text, fontFamily: S.body }}>

      {/* ── Top bar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${S.borderFaint}`, padding: '0 clamp(20px,5vw,60px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: S.gold, fontFamily: S.headline, fontSize: 13, cursor: 'pointer', letterSpacing: '0.08em' }}>
            ← Accra Creatives Hub
          </button>
          <button
            onClick={onBack}
            style={{ background: S.gold, border: 'none', color: '#131313', fontFamily: S.headline, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 20px', borderRadius: 7, cursor: 'pointer' }}
          >
            Hire a Designer
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,7vw,80px) clamp(20px,5vw,60px)' }}>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 32 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontFamily: S.body, fontSize: 12, color: S.textFaint }}>
            <li><a href="/" onClick={e => { e.preventDefault(); onBack() }} style={{ color: S.textFaint, textDecoration: 'none' }}>Home</a></li>
            <li style={{ color: S.borderFaint }}>/</li>
            <li><a href="/designers" onClick={e => { e.preventDefault(); onBack() }} style={{ color: S.textFaint, textDecoration: 'none' }}>Designers</a></li>
            <li style={{ color: S.borderFaint }}>/</li>
            <li style={{ color: S.textMuted }}>{meta.h1}</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <header style={{ marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(201,168,76,0.08)', border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 99, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ color: S.gold, fontSize: 10 }}>◈</span>
            <span style={{ fontFamily: S.body, fontSize: 11, color: S.gold, letterSpacing: '0.06em' }}>Verified Talent · Ghana</span>
          </div>
          <h1 style={{ fontFamily: S.headline, fontWeight: 300, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 20px', color: S.text }}>
            {meta.h1}
          </h1>
          <p style={{ fontFamily: S.body, fontSize: 'clamp(14px,1.8vw,17px)', color: S.textMuted, lineHeight: 1.85, maxWidth: 680, margin: '0 0 28px' }}>
            {meta.intro}
          </p>
          <button
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: S.gold, border: 'none', color: '#131313', fontFamily: S.headline, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 9, cursor: 'pointer' }}
          >
            Browse All Designers →
          </button>
        </header>

        {/* ── Designer grid ── */}
        <section aria-labelledby="designers-heading" style={{ marginBottom: 72 }}>
          <h2 id="designers-heading" style={{ fontFamily: S.headline, fontWeight: 400, fontSize: 'clamp(20px,2.5vw,28px)', color: S.text, margin: '0 0 24px' }}>
            Available {category} Designers
          </h2>

          {loading && (
            <p style={{ color: S.textFaint, fontFamily: S.body, fontSize: 13 }}>Loading designers…</p>
          )}

          {!loading && designers.length === 0 && (
            <div style={{ background: S.surface, border: `1px solid ${S.borderFaint}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <p style={{ color: S.textMuted, fontFamily: S.body, fontSize: 13, marginBottom: 16 }}>
                Our editorial team is currently reviewing new {category} applications.
              </p>
              <button onClick={onBack} style={{ color: S.gold, background: 'none', border: `1px solid ${S.gold}40`, padding: '9px 20px', borderRadius: 7, fontFamily: S.body, fontSize: 12, cursor: 'pointer' }}>
                Browse all designers →
              </button>
            </div>
          )}

          {designers.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {designers.map(d => {
                const name = d.profiles?.full_name || 'Designer'
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <article
                    key={d.id}
                    onClick={onBack}
                    style={{ background: S.surface, border: `1px solid ${S.borderFaint}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(201,168,76,0.4)`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = S.borderFaint)}
                  >
                    {d.profiles?.avatar_url ? (
                      <img src={d.profiles.avatar_url} alt={`${name} — ${category} designer in Ghana`} loading="lazy"
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1a2a1a', border: `2px solid ${S.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                        {initials}
                      </div>
                    )}
                    <h3 style={{ fontFamily: S.headline, fontSize: 15, fontWeight: 600, color: S.text, margin: '0 0 4px' }}>{name}</h3>
                    <p style={{ fontFamily: S.body, fontSize: 11, color: S.textMuted, margin: '0 0 10px', lineHeight: 1.5 }}>{d.tagline || category + ' Designer'}</p>
                    {d.badge === 'verified' || d.badge === 'top' ? (
                      <span style={{ fontSize: 10, color: S.gold, fontFamily: S.body }}>✓ Verified</span>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Why Ghana copy ── */}
        <section style={{ marginBottom: 72, background: S.surface, border: `1px solid ${S.borderFaint}`, borderRadius: 14, padding: 'clamp(24px,4vw,40px)' }}>
          <h2 style={{ fontFamily: S.headline, fontWeight: 400, fontSize: 'clamp(18px,2.2vw,26px)', color: S.text, margin: '0 0 16px' }}>
            Why hire a {category} designer from Ghana?
          </h2>
          <p style={{ fontFamily: S.body, fontSize: 'clamp(13px,1.5vw,15px)', color: S.textMuted, lineHeight: 1.9, margin: 0 }}>
            {meta.whyGhana}
          </p>
        </section>

        {/* ── FAQ ── */}
        <section aria-labelledby="faq-heading" style={{ marginBottom: 72 }}>
          <h2 id="faq-heading" style={{ fontFamily: S.headline, fontWeight: 400, fontSize: 'clamp(18px,2.2vw,26px)', color: S.text, margin: '0 0 24px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: S.borderFaint, borderRadius: 12, overflow: 'hidden' }}>
            {meta.faqs.map((faq, i) => (
              <div key={i} style={{ background: S.surface, padding: 'clamp(16px,3vw,24px)' }}>
                <h3 style={{ fontFamily: S.headline, fontSize: 'clamp(13px,1.6vw,15px)', fontWeight: 600, color: S.text, margin: '0 0 10px' }}>
                  {faq.q}
                </h3>
                <p style={{ fontFamily: S.body, fontSize: 'clamp(12px,1.4vw,14px)', color: S.textMuted, lineHeight: 1.8, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Other categories internal links ── */}
        <section aria-labelledby="categories-heading" style={{ marginBottom: 56 }}>
          <h2 id="categories-heading" style={{ fontFamily: S.headline, fontWeight: 400, fontSize: 'clamp(16px,2vw,22px)', color: S.text, margin: '0 0 18px' }}>
            Other Design Services in Ghana
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {otherCategories.map(cat => {
              const catSlug = SLUG_FROM_CATEGORY[cat]
              return (
                <a
                  key={cat}
                  href={`/designers/${catSlug}`}
                  onClick={e => {
                    e.preventDefault()
                    window.history.pushState({}, '', `/designers/${catSlug}`)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                  }}
                  style={{ background: S.surface, border: `1px solid ${S.borderFaint}`, borderRadius: 8, padding: '9px 16px', fontFamily: S.body, fontSize: 12, color: S.textMuted, textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(201,168,76,0.4)`; (e.currentTarget as HTMLAnchorElement).style.color = S.text }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = S.borderFaint; (e.currentTarget as HTMLAnchorElement).style.color = S.textMuted }}
                >
                  {cat} →
                </a>
              )
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ textAlign: 'center', padding: 'clamp(32px,5vw,56px)', background: 'rgba(201,168,76,0.04)', border: `1px solid rgba(201,168,76,0.15)`, borderRadius: 16 }}>
          <p style={{ fontFamily: S.headline, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.gold, marginBottom: 16 }}>
            The Sovereign Gallery
          </p>
          <h2 style={{ fontFamily: S.headline, fontWeight: 300, fontSize: 'clamp(24px,3.5vw,42px)', color: S.text, margin: '0 0 16px', lineHeight: 1.1 }}>
            Ready to hire a {category} designer?
          </h2>
          <p style={{ fontFamily: S.body, fontSize: 'clamp(13px,1.5vw,15px)', color: S.textMuted, margin: '0 0 32px', lineHeight: 1.8 }}>
            Browse verified designers, send a brief, and get your project started today. Payment is held in escrow until you approve the final work.
          </p>
          <button
            onClick={onBack}
            style={{ background: S.gold, border: 'none', color: '#131313', fontFamily: S.headline, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '15px 36px', borderRadius: 10, cursor: 'pointer' }}
          >
            Browse {category} Designers →
          </button>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${S.borderFaint}`, padding: 'clamp(32px,5vw,48px) clamp(20px,5vw,60px)', marginTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ fontFamily: S.headline, fontSize: 10, letterSpacing: '0.2em', color: S.gold, marginBottom: 4 }}>ACCRA CREATIVES HUB</p>
            <p style={{ fontFamily: S.body, fontSize: 12, color: S.textFaint }}>Ghana's curated design marketplace.</p>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(CATEGORY_SLUGS).map(([s, cat]) => (
              <a key={s} href={`/designers/${s}`}
                onClick={e => { e.preventDefault(); window.history.pushState({}, '', `/designers/${s}`); window.dispatchEvent(new PopStateEvent('popstate')) }}
                style={{ fontFamily: S.body, fontSize: 11, color: S.textFaint, textDecoration: 'none' }}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '20px auto 0', borderTop: `1px solid ${S.borderFaint}`, paddingTop: 20 }}>
          <p style={{ fontFamily: S.body, fontSize: 11, color: S.textFaint }}>
            © {new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana ·{' '}
            <a href="mailto:hello@accracreativeshub.com" style={{ color: S.gold, textDecoration: 'none' }}>hello@accracreativeshub.com</a>
          </p>
        </div>
      </footer>

    </div>
  )
}
