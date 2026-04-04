// ── src/lib/constants.ts ──
// Single source of truth — import from here everywhere.
// Never define categories inline in components.

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