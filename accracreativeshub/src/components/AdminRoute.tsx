// ── AdminRoute.tsx ──
// Place at: src/components/AdminRoute.tsx
//
// This component intercepts the secret URL /admin-sovereign-2024
// and renders the AdminPanel directly — completely hidden from public navigation.
//
// HOW TO USE:
// In your App.tsx, add this at the very top of the return, BEFORE everything else:
//
//   import AdminRoute from './components/AdminRoute'
//
//   // Inside App() return, as the very first thing:
//   const adminRoute = AdminRoute({ onClose: () => window.history.back() })
//   if (adminRoute) return adminRoute
//
// Or alternatively, add this block at the top of your App() function body,
// before the return statement:
//
//   // ── Secret admin URL ──
//   if (window.location.pathname === '/admin-sovereign-2024') {
//     return <AdminPanel onClose={() => { window.history.pushState({}, '', '/'); window.location.reload() }} />
//   }

import React from 'react'
import AdminPanel from './AdminPanel'
import { useAuth } from '../AuthContext'
import { S } from '../styles/tokens'
import { Hl, Body } from './UI'

interface AdminRouteProps {
  onClose: () => void
}

export default function AdminRoute({ onClose }: AdminRouteProps) {
  const { isAdmin, user, loading } = useAuth()

  // Only intercept the secret URL
  if (window.location.pathname !== '/admin-sovereign-2024') return null

  // Still loading auth state
  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: S.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Body style={{ color: S.textFaint }}>Loading...</Body>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: S.bgDeep, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Hl style={{ color: S.gold, fontSize: 24 }}>Access Denied</Hl>
        <Body>Please log in with your admin account first.</Body>
        <button
          onClick={() => { window.history.pushState({}, '', '/'); window.location.reload() }}
          style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, padding: '10px 24px', cursor: 'pointer', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 8 }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: S.bgDeep, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Hl style={{ color: S.danger, fontSize: 24 }}>Unauthorised</Hl>
        <Body>This area is restricted to platform administrators.</Body>
        <button
          onClick={() => { window.history.pushState({}, '', '/'); window.location.reload() }}
          style={{ background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, padding: '10px 24px', cursor: 'pointer', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 8 }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  // Admin confirmed — render panel
  return <AdminPanel onClose={onClose} />
}