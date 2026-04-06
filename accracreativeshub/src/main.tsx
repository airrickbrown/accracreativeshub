// ── src/main.tsx ──
// Google OAuth removed for MVP simplicity.
// Handles password reset token BEFORE React mounts.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import PasswordResetPage from './components/PasswordResetPage'

function start() {
  const hash = window.location.hash

  // Password reset link from Supabase email
  // URL looks like: https://accracreativeshub.com/#access_token=...&type=recovery
  if (hash.includes('type=recovery')) {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <AuthProvider>
          <PasswordResetPage />
        </AuthProvider>
      </React.StrictMode>
    )
    return
  }

  // Normal app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  )
}

start()