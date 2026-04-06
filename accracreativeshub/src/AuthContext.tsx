// ── src/AuthContext.tsx ──
// Auth state is stored in module-level cache so it never resets
// when overlays open/close or history changes.
// The root cause of the navbar flickering was that `closeAll()` in App.tsx
// was triggering re-renders that made the nav briefly see `user = null`.
// Fix: auth state lives here and is never touched by overlay logic.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'

interface AuthContextType {
  user:          any
  userRole:      'admin' | 'designer' | 'client' | null
  isAdmin:       boolean
  isDesigner:    boolean
  isClient:      boolean
  emailVerified: boolean
  loading:       boolean
  signOut:       () => Promise<void>
  refreshUser:   () => Promise<void>
}

const Ctx = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false, isDesigner: false,
  isClient: false, emailVerified: false, loading: true,
  signOut: async () => {}, refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]             = useState<any>(null)
  const [userRole, setUserRole]     = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setVerified] = useState(false)
  const [loading, setLoading]       = useState(true)

  const fetchRole = async (userId: string, fallback = 'client'): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles').select('role').eq('id', userId).single()
      return data?.role || fallback
    } catch {
      return fallback
    }
  }

  const processUser = useCallback(async (u: any) => {
    if (!u) {
      setUser(null); setUserRole(null); setVerified(false)
      return
    }
    const isGoogle = u.app_metadata?.provider === 'google'
    setUser(u)
    setVerified(!!u.email_confirmed_at || isGoogle)
    const role = await fetchRole(u.id, u.user_metadata?.role || 'client')
    setUserRole(role as any)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await processUser(session?.user ?? null)
  }, [processUser])

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      await processUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes — only update on real auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          await processUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null); setUserRole(null); setVerified(false)
        }
        // INITIAL_SESSION fires on load — don't double-process
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [processUser])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setUserRole(null); setVerified(false)
  }

  return (
    <Ctx.Provider value={{
      user, userRole, emailVerified: emailVerified, loading,
      signOut, refreshUser,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   !!user && !['admin', 'designer'].includes(userRole || ''),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)