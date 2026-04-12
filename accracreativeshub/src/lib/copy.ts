// ── src/lib/copy.ts ──
// All homepage + platform copy in one file.
// Change words here → changes everywhere on the platform.
// Keeps the brand voice consistent across every page.

export const COPY = {

  // ── Hero ────────────────────────────────────────────────
  hero: {
    eyebrow:   'The Sovereign Gallery',
    headline1: 'We built the platform',
    headline2: "Ghana's creative talent deserves.",
    body:      "A curated marketplace where Ghana's most verified creatives — graphic designers, UI/UX designers, and motion artists — meet clients who understand the value of real craft.",
    cta_primary:   'Find Your Creative →',
    cta_secondary: 'How It Works',
  },

  // ── Stats bar ────────────────────────────────────────────
  stats: [
    { label: 'Verified Creatives',  suffix: '' },
    { label: 'Active Projects',     suffix: '' },
    { label: 'Commission Only',     suffix: '%' },
  ],

  // ── Mission block ────────────────────────────────────────
  mission: {
    eyebrow:   'Our Mission',
    heading:   'Elevating Ghanaian talent to a global stage.',
    body:      'We curate, verify, and champion Ghana\'s most talented creatives — connecting them with clients who understand the value of real craft.',
    truth1:    'Every creative on our platform is reviewed by our editorial board.',
    truth2:    'Every transaction is secured through escrow.',
  },

  // ── How It Works ─────────────────────────────────────────
  process: {
    eyebrow: 'The Process of Craft',
    heading: 'How It Works',
    steps: [
      {
        n: '01', icon: '▣',
        title: 'Build Your Brief',
        body:  'Fill out our structured brief — project type, references, and budget. Clear briefs get better results.',
      },
      {
        n: '02', icon: '◈',
        title: 'Collaborate Securely',
        body:  'Message directly with your creative. Your payment is held in escrow until you approve the delivery.',
      },
      {
        n: '03', icon: '◉',
        title: 'Approve & Pay',
        body:  'Satisfied with the work? Approve it. Funds release instantly. Both sides protected, always.',
      },
    ],
  },

  // ── For Designers / Creatives ────────────────────────────
  forDesigners: {
    eyebrow:   'For Ghanaian Creatives',
    heading1:  'Your talent deserves',
    heading2:  'better exposure.',
    body:      'Stop chasing clients through Instagram DMs. Build a verified profile, receive structured briefs, and get paid securely — every time.',
    cta:       'Apply to Join →',
    cards: [
      { icon: '◈', title: 'Free to List',     body: 'Create your profile at no cost. We take 10% commission only when you complete an order.' },
      { icon: '◉', title: 'Verified Badge',   body: 'Our editorial board reviews every creative before they go live. Your badge means something.' },
      { icon: '◐', title: 'Secure Escrow',    body: 'Funds are held safely until approval. You always get paid for work that is approved.'       },
      { icon: '◑', title: 'Real Visibility',  body: 'Get discovered by brands across Africa and beyond — not buried in an Instagram feed.'       },
    ],
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    tagline:     "Ghana's first curated marketplace for verified creative talent.",
    tagline_sub: 'Secure escrow. Editorial review. Real results.',
    copyright:   'Accra Creatives Hub',
    location:    'Accra, Ghana',
  },

  // ── One-line positioning ─────────────────────────────────
  positioning: "Where Africa's best creative talent meets the world.",

  // ── Meta / SEO ───────────────────────────────────────────
  meta: {
    title:       'Accra Creatives Hub — Ghana\'s Premier Creative Marketplace',
    description: "Hire Ghana's most verified graphic designers, UI/UX designers, and motion artists. Secure escrow. Editorial curation. World-class creative talent.",
    og_title:    'Accra Creatives Hub',
    og_description: "Where Africa's best creative talent meets the world.",
  },

}