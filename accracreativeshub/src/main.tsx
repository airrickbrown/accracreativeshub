// ── src/main.tsx ──
// This is the true entry point.
// We intercept the OAuth callback HERE, before React even mounts.
// This eliminates the race condition where AuthCallback tries to read
// tokens that Supabase's client already cleared.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import { handleOAuthCallback } from './lib/oauthCallback'

async function start() {
  // ── If this is an OAuth redirect, handle it first ──
  // Google sends the user back with either:
  //   ?code=...        (PKCE flow)
  //   #access_token=... (implicit flow)
  // We process this synchronously before rendering anything.
  const isCallback =
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('error') ||
    window.location.search.includes('code=')

  if (isCallback) {
    await handleOAuthCallback()
    // handleOAuthCallback cleans the URL and navigates — we don't render the app
    // until after it's done so there's no flash of logged-out state
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  )
}

start()