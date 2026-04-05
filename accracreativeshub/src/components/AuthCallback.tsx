// ── src/components/AuthCallback.tsx ──
// The REAL OAuth processing now happens in src/lib/oauthCallback.ts
// which is called from main.tsx BEFORE React mounts.
//
// This component is now just a lightweight detector that shows a spinner
// if somehow the app renders mid-callback. In practice it won't show
// because main.tsx awaits oauthCallback before mounting React.
//
// Keep it in App.tsx as <AuthCallback /> — it's safe and does nothing
// if there's no OAuth callback happening.

import React, { useEffect, useState } from 'react'
import { S } from '../styles/tokens'

// Re-export the key so AuthModal can import it
export { OAUTH_ROLE_KEY } from '../lib/oauthCallback'

export default function AuthCallback() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isCallback =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('error') ||
      window.location.search.includes('code=')
    // If we ever reach this point WITH an OAuth callback,
    // it means main.tsx didn't process it (shouldn't happen)
    if (isCallback) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{ color: S.gold, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.06em' }}>
        ACCRA CREATIVES HUB
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: S.gold, animation: `ach_sp ${1.2}s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes ach_sp { 0%,100%{opacity:.2;transform:scale(.75);}50%{opacity:1;transform:scale(1);} }`}</style>
    </div>
  )
}