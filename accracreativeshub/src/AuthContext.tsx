// ── src/AuthContext.tsx ──
// Key fix: 8 second timeout on initial session load.
// If Supabase doesn't respond (missing env vars, network issue),
// the app stops loading and renders anyway instead of black screen forever.

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
  const [user, setUser]              = useState<any>(null)
  const [userRole, setUserRole]      = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setVerified] = useState(false)
  const [loading, setLoading]        = useState(true)

  const fetchRole = async (userId: string, fallback = 'client'): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
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
    let done = false

    // Safety timeout — if Supabase doesn't respond in 8s, unblock the app
    const timeout = setTimeout(() => {
      if (!done) { done = true; setLoading(false) }
    }, 8000)

    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      if (done) return
      done = true
      clearTimeout(timeout)
      await processUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      if (!done) { done = true; clearTimeout(timeout); setLoading(false) }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          await processUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null); setUserRole(null); setVerified(false)
        }
        setLoading(false)
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [processUser])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setUserRole(null); setVerified(false)
  }

  return (
    <Ctx.Provider value={{
      user, userRole, emailVerified, loading, signOut, refreshUser,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   !!user && !['admin', 'designer'].includes(userRole || ''),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)