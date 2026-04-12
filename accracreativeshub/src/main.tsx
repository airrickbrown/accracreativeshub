// ── src/main.tsx ──

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import PasswordResetPage from './components/PasswordResetPage'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'

function start() {
  const hash = window.location.hash

  const root = ReactDOM.createRoot(document.getElementById('root')!)

  // Password reset link from Supabase email
  if (hash.includes('type=recovery')) {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <PasswordResetPage />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )
    return
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

start()