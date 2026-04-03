import { useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from '../lib/supabase'

interface AuthCallbackProps {
  onComplete: () => void | Promise<void>
}

export default function AuthCallback({ onComplete }: AuthCallbackProps) {
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
        await onComplete()
        return
      }

      setProcessing(true)

      try {
        if (isCodeCallback && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error.message)
          }
        } else if (isHashCallback) {
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Session error:', error.message)
          }
          if (data?.session) {
            console.log('OAuth session established:', data.session.user?.email)
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
      }

      window.history.replaceState({}, '', '/')
      setProcessing(false)
      await onComplete()
    }

    handleCallback()
  }, [onComplete])

  if (!processing) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#131313',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          color: '#c9a84c',
          fontSize: 22,
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
        }}
      >
        ACCRA CREATIVES HUB
      </div>
      <div
        style={{
          color: '#666',
          fontSize: 13,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.1em',
        }}
      >
        Signing you in...
      </div>
    </div>
  )
}