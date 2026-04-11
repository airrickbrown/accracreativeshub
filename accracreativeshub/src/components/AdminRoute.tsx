// ── src/components/AdminRoute.tsx ──
// Guards the /admin-sovereign-2024 route.
// Only renders AdminPanel if user role is 'admin'.
// Shows a proper access denied page otherwise — never exposes admin UI.

import React from 'react'
import { useAuth } from '../AuthContext'
import AdminPanel from './AdminPanel'

interface Props { onClose: () => void }

export default function AdminRoute({ onClose }: Props) {
  const { user, isAdmin, loading } = useAuth()

  // Still checking session — show nothing (prevents flash)
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#c9a84c',
              animation: `ap 1.2s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes ap{0%,100%{opacity:.2;transform:scale(.75);}50%{opacity:1;transform:scale(1);}}`}</style>
      </div>
    )
  }

  // Not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif', padding: 24,
      }}>
        <div style={{ color: '#c9a84c', fontSize: 36, marginBottom: 20 }}>◈</div>
        <h1 style={{ color: '#f5f5f5', fontWeight: 400, fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
          Access Denied
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28, textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
          {!user
            ? 'Please log in with your admin account first.'
            : 'You do not have permission to access this page.'}
        </p>
        <button
          onClick={onClose}
          style={{
            background: '#c9a84c', color: '#131313', border: 'none',
            padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Arial', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  return <AdminPanel onClose={onClose} />
}