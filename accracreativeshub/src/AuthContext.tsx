// ── src/AuthContext.tsx ──

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'
import { handleGoogleUser } from './lib/auth'

interface AuthContextType {
  user: any
  userRole: 'admin' | 'designer' | 'client' | null
  isAdmin: boolean
  isDesigner: boolean
  isClient: boolean
  emailVerified: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isAdmin: false,
  isDesigner: false,
  isClient: false,
  emailVerified: false,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (userId: string, fallback = 'client'): Promise<string> => {
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
  }, [])

  const processUser = useCallback(
    async (u: any) => {
      if (!u) {
        setUser(null)
        setUserRole(null)
        setEmailVerified(false)
        return
      }

      const isGoogle = u.app_metadata?.provider === 'google'
      const verified = !!u.email_confirmed_at || isGoogle

      setUser(u)
      setEmailVerified(verified)

      // For Google users:
      // 1. ensure profile/designer row exists
      // 2. then fetch final role from DB for consistency
      if (isGoogle) {
        await handleGoogleUser(u)
      }

      const fallbackRole = u.user_metadata?.role || 'client'
      const role = await fetchRole(u.id, fallbackRole)

      setUserRole(role as 'admin' | 'designer' | 'client')
    },
    [fetchRole]
  )

  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    await processUser(session?.user ?? null)
  }, [processUser])

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      await processUser(session?.user ?? null)
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await processUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserRole(null)
        setEmailVerified(false)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [processUser])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setEmailVerified(false)
  }

  return (
    <Ctx.Provider
      value={{
        user,
        userRole,
        emailVerified,
        loading,
        signOut,
        refreshUser,
        isAdmin: userRole === 'admin',
        isDesigner: userRole === 'designer',
        isClient: userRole === 'client' || (!!user && !['admin', 'designer'].includes(userRole || '')),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)