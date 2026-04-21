// ── src/main.tsx ──

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from './ThemeContext'
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
          <ThemeProvider>
            <AuthProvider>
              <PasswordResetPage />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )
    return
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

start()
// force rebuild 04/20/2026 21:38:45
