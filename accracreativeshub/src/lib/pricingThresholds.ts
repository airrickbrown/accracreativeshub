// ── pricingThresholds.ts ──
// Place at: src/lib/pricingThresholds.ts
//
// Defines the pricing rules tied to designer badge levels.
// Used in DesignerSignup, BriefBuilder, and AdminPanel.

export interface PricingTier {
  badge:       string
  label:       string
  minPrice:    number
  maxPrice:    number | null   // null = unlimited
  requirement: string
  color:       string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    badge:       'under_review',
    label:       'Under Review',
    minPrice:    50,
    maxPrice:    200,
    requirement: 'Account pending editorial approval',
    color:       '#888',
  },
  {
    badge:       'new',
    label:       'New Designer',
    minPrice:    50,
    maxPrice:    200,
    requirement: 'Approved — complete your first order to unlock higher pricing',
    color:       '#aaa',
  },
  {
    badge:       'verified',
    label:       'Verified',
    minPrice:    50,
    maxPrice:    500,
    requirement: '1+ completed order with 4+ star review',
    color:       '#4a9a4a',
  },
  {
    badge:       'top_rated',
    label:       'Top Rated',
    minPrice:    100,
    maxPrice:    1500,
    requirement: '10+ orders with 4.8+ average rating',
    color:       '#c9a84c',
  },
  {
    badge:       'elite',
    label:       'Elite',
    minPrice:    200,
    maxPrice:    null,          // unlimited
    requirement: '50+ orders with 4.9+ average rating — invite only',
    color:       '#e8c96b',
  },
]

// Get the tier for a given badge
export const getTier = (badge: string): PricingTier =>
  PRICING_TIERS.find(t => t.badge === badge) || PRICING_TIERS[0]

// Validate a price against the designer's current tier
export const validatePrice = (price: number, badge: string): string | null => {
  const tier = getTier(badge)
  if (price < tier.minPrice) {
    return `Minimum price for ${tier.label} designers is GH₵${tier.minPrice}.`
  }
  if (tier.maxPrice !== null && price > tier.maxPrice) {
    return `Your current badge (${tier.label}) allows a maximum price of GH₵${tier.maxPrice}. Complete more orders to unlock higher pricing.`
  }
  return null // valid
}

// Check if a designer should be auto-upgraded
// Call this after every order completion + rating update
export const getEarnedBadge = (
  currentBadge: string,
  orderCount:   number,
  avgRating:    number
): string => {
  if (orderCount >= 50 && avgRating >= 4.9) return 'elite'
  if (orderCount >= 10 && avgRating >= 4.8) return 'top_rated'
  if (orderCount >= 1  && avgRating >= 4.0) return 'verified'
  if (currentBadge === 'under_review')       return 'under_review'
  return 'new'
}

// Human-readable unlock message shown to designers
export const getUnlockMessage = (badge: string): string => {
  const messages: Record<string, string> = {
    under_review: 'Your profile is under review. Once approved you can set prices up to GH₵200.',
    new:          'Complete your first order with a 4+ star review to unlock pricing up to GH₵500.',
    verified:     'Complete 10 orders with a 4.8+ average rating to unlock pricing up to GH₵1,500.',
    top_rated:    'Complete 50 orders with a 4.9+ average rating to unlock unlimited pricing.',
    elite:        'You have unlocked unlimited pricing. Welcome to the Elite tier.',
  }
  return messages[badge] || ''
}