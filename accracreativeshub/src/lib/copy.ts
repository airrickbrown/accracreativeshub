// ── src/lib/copy.ts ──
// Single source of truth for all platform copy.
// Change words here → changes everywhere.
// Keeps brand voice consistent across every page and component.

export const COPY = {

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    eyebrow:       'The Sovereign Gallery',
    headline1:     'Elevating',
    headline2:     'Ghanaian Design',               // rendered in gold italic
    body:          "A curated marketplace for Ghana's most prestigious visual storytellers. Connecting global brands with elite local craftsmanship.",
    cta_primary:   'Find Your Designer →',
    cta_secondary: 'How It Works',
    trust:         'Every designer reviewed by our editorial board · Payments via Paystack',
  },

  // ── Stats bar ─────────────────────────────────────────────────────────────
  stats: [
    { label: 'Verified Designers', suffix: '' },
    { label: 'Active Projects',    suffix: '' },
    { label: 'Commission Only',    suffix: '%' },
  ],

  // ── Mission block ─────────────────────────────────────────────────────────
  mission: {
    eyebrow: 'Our Mission',
    heading: 'Elevating Ghanaian talent to a global stage.',
    body:    "We curate, verify, and champion Ghana's most talented creatives — connecting them with clients who understand the value of real craft.",
    truth1:  'Every designer on our platform is reviewed by our editorial board.',
    truth2:  'Every transaction is payment-protected through our platform workflow.',
  },

  // ── How It Works ──────────────────────────────────────────────────────────
  process: {
    eyebrow: 'The Process of Craft',
    heading: 'How It Works',
    sub:     'From brief to final delivery — every step is secure, transparent, and built for Ghana.',
    steps: [
      {
        n: '01', icon: '▣',
        title: 'Build Your Brief',
        body:  'Fill out our structured brief form — project type, colours, references, and budget. Clear briefs get better results.',
      },
      {
        n: '02', icon: '◈',
        title: 'Collaborate Securely',
        body:  'Chat directly with your designer. Your payment is held securely and only released when you approve the delivery.',
      },
      {
        n: '03', icon: '◉',
        title: 'Approve & Pay',
        body:  'Satisfied with the work? Approve the delivery. Funds release instantly. Both sides protected, always.',
      },
    ],
  },

  // ── For Designers / Creatives ─────────────────────────────────────────────
  forDesigners: {
    eyebrow:  'For Ghanaian Creatives',
    heading1: 'Your talent deserves',
    heading2: 'better exposure.',
    body:     'Stop chasing clients through Instagram DMs. Build a verified profile, receive structured briefs, and get paid securely — every time.',
    cta:      'Apply to Join →',
    cards: [
      {
        icon: '◈',
        title: 'Free to List',
        body:  'Create your profile at no cost. We take 10% commission only when you complete an order.',
      },
      {
        icon: '◉',
        title: 'Verified Badge',
        body:  'Our editorial board reviews every designer before they go live. Your badge means something.',
      },
      {
        icon: '◐',
        title: 'Payment Protected',
        body:  'Funds are held through our platform workflow until the client approves. You always get paid for approved work.',
      },
      {
        icon: '◑',
        title: 'Referral Earnings',
        body:  'Earn GH₵20 for every client you refer who completes their first order.',
      },
    ],
  },

  // ── Trust signals ─────────────────────────────────────────────────────────
  trust: {
    editorial:   'Reviewed by our editorial board',
    payment:     'Secure payments via Paystack',
    curated:     'Curated talent only',
    independent: 'Designers are independent professionals',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    tagline:     "Ghana's first curated marketplace for verified graphic designers.",
    tagline_sub: 'Payment protected. Editorial review. Real results.',
    copyright:   'Accra Creatives Hub',
    location:    'Accra, Ghana',
  },

  // ── One-line positioning ──────────────────────────────────────────────────
  positioning: "Where Africa's best creative talent meets the world.",

  // ── Meta / SEO ────────────────────────────────────────────────────────────
  meta: {
    title:          "Accra Creatives Hub — Ghana's Curated Design Marketplace",
    description:    'Hire verified Ghanaian graphic designers for logos, branding, flyers, social media design and more. Payment protected. Curated talent reviewed by our editorial team.',
    og_title:       'Accra Creatives Hub — Ghana\'s Curated Design Marketplace',
    og_description: 'Hire verified Ghanaian graphic designers for logos, branding, flyers and more. Secure payments. Curated talent only.',
  },

}
