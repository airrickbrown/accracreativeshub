// ── src/components/AuthCallback.tsx ──

import React, { useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import { S } from '../styles/tokens'
import { ROLE_REDIRECT } from '../lib/constants'

export default function AuthCallback() {
  const { refreshUser } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)

      const code = searchParams.get('code')
      const error = searchParams.get('error')

      const isHashCallback =
        hash.includes('access_token') || hash.includes('refresh_token')
      const isCodeCallback = !!code
      const isErrorCallback = !!error || hash.includes('error')

      if (!isHashCallback && !isCodeCallback && !isErrorCallback) {
        return
      }

      setProcessing(true)

      try {
        if (isCodeCallback && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error.message)
            window.history.replaceState({}, '', '/')
            setProcessing(false)
            return
          }
        } else if (isHashCallback) {
          const { error } = await supabase.auth.getSession()
          if (error) {
            console.error('Session error:', error.message)
            window.history.replaceState({}, '', '/')
            setProcessing(false)
            return
          }
        }

        // Refresh auth context after session is restored
        await refreshUser()

        // Read final role from DB after refresh
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user

        if (!user) {
          window.history.replaceState({}, '', '/')
          setProcessing(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role || 'client'
        const destination =
          ROLE_REDIRECT[role as keyof typeof ROLE_REDIRECT] || '/'

        // Clean URL and redirect
        window.history.replaceState({}, '', destination)
        window.dispatchEvent(new PopStateEvent('popstate'))
      } catch (err) {
        console.error('Auth callback error:', err)
        window.history.replaceState({}, '', '/')
      }

      setProcessing(false)
    }

    handleCallback()
  }, [refreshUser])

  if (!processing) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          color: S.gold,
          fontSize: 20,
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
          letterSpacing: '0.05em',
        }}
      >
        ACCRA CREATIVES HUB
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: S.gold,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:0.2; transform:scale(0.8); }
          50% { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  )
}