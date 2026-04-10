// ── src/main.tsx ──

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './AuthContext'
import PasswordResetPage from './components/PasswordResetPage'

function start() {
  const hash = window.location.hash

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

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  )
}

start()