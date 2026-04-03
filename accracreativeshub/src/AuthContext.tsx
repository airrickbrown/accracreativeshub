// ── src/AuthContext.tsx ──

import React, { createContext, useContext, useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'
import { handleGoogleUser } from './lib/auth'

interface AuthContextType {
  user:            any
  userRole:        'admin' | 'designer' | 'client' | null
  isAdmin:         boolean
  isDesigner:      boolean
  isClient:        boolean
  emailVerified:   boolean
  signOut:         () => Promise<void>
  loading:         boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false,
  isDesigner: false, isClient: false, emailVerified: false,
  signOut: async () => {}, loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<any>(null)
  const [userRole, setUserRole]       = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading]         = useState(true)

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

    // Check email verification
    // email_confirmed_at is set by Supabase when user clicks verification link
    const verified = !!u.email_confirmed_at || u.app_metadata?.provider === 'google'
    setEmailVerified(verified)

    // Fetch role from profiles table
    const role = await fetchRole(u.id, u.user_metadata?.role)
    setUserRole(role as any)

    // Handle Google OAuth users — ensure profile exists
    if (u.app_metadata?.provider === 'google') {
      await handleGoogleUser(u)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      await processUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        await processUser(session?.user ?? null)
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
      isClient:   userRole === 'client' || userRole === null,
      signOut, loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)