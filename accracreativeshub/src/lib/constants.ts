// ── src/lib/constants.ts ──
// Single source of truth — import from here everywhere.

export const CATEGORIES = [
  'Logo Design',
  'Business Branding',
  'Flyer Design',
  'Social Media Design',
  'UI/UX Design',
  'Motion Graphics',
] as const

export type Category = typeof CATEGORIES[number]

export const ALL_CATS = ['All', ...CATEGORIES] as const

export type Role = 'client' | 'designer' | 'admin'

// Route each role goes to after login
export const ROLE_REDIRECT: Record<Role, string> = {
  client:   '/welcome',
  designer: '/apply-designer',
  admin:    '/',
}

// ── Legacy category normalizer ──
// If old data in Supabase uses "Flyer & Social Media",
// this maps it to the correct split category.
// Import and use this wherever you read designer.category from DB.
export const normalizeCategory = (raw: string): string => {
  const map: Record<string, string> = {
    'flyer & social media':  'Flyer Design',
    'flyer and social media': 'Flyer Design',
    'social media':          'Social Media Design',
    'ui/ux':                 'UI/UX Design',
    'uiux':                  'UI/UX Design',
    'motion':                'Motion Graphics',
    'branding':              'Business Branding',
    'logo':                  'Logo Design',
  }
  return map[raw.toLowerCase()] ?? raw
}