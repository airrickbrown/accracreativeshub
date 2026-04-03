// ── src/AuthContext.tsx ──
// Root cause of Google not persisting:
// The onAuthStateChange listener was resolving before the session was written.
// Fix: use SIGNED_IN event explicitly + handle hash fragment OAuth tokens.

import React, { createContext, useContext, useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'
import { handleGoogleUser } from './lib/auth'

interface AuthContextType {
  user:          any
  userRole:      'admin' | 'designer' | 'client' | null
  isAdmin:       boolean
  isDesigner:    boolean
  isClient:      boolean
  emailVerified: boolean
  signOut:       () => Promise<void>
  loading:       boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false,
  isDesigner: false, isClient: false, emailVerified: false,
  signOut: async () => {}, loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]             = useState<any>(null)
  const [userRole, setUserRole]     = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading]       = useState(true)

  const fetchRole = async (userId: string, fallback?: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles').select('role').eq('id', userId).single()
      return data?.role || fallback || 'client'
    } catch {
      return fallback || 'client'
    }
  }

  const processUser = async (u: any) => {
    if (!u) {
      setUser(null); setUserRole(null); setEmailVerified(false)
      return
    }
    setUser(u)
    const verified = !!u.email_confirmed_at || u.app_metadata?.provider === 'google'
    setEmailVerified(verified)
    const role = await fetchRole(u.id, u.user_metadata?.role)
    setUserRole(role as any)
    // Ensure Google users have a profile row
    if (u.app_metadata?.provider === 'google') {
      await handleGoogleUser(u)
    }
  }

  useEffect(() => {
    // ── FIX: Handle OAuth hash fragment on page load ──
    // When Google redirects back, Supabase puts the token in the URL hash.
    // We must call getSession() AFTER the hash is processed.
    const initAuth = async () => {
      // This call processes any hash tokens in the URL automatically
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) console.warn('Auth init error:', error.message)
      await processUser(session?.user ?? null)
      setLoading(false)
    }

    initAuth()

    // ── FIX: Listen for all auth state changes including SIGNED_IN from OAuth ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        // SIGNED_IN fires when OAuth redirect completes
        // TOKEN_REFRESHED fires when token is auto-renewed
        // SIGNED_OUT fires on logout
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await processUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null); setUserRole(null); setEmailVerified(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setUserRole(null); setEmailVerified(false)
  }

  return (
    <AuthContext.Provider value={{
      user, userRole, emailVerified,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   userRole === 'client' || (!!user && userRole === null),
      signOut, loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)