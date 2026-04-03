import React, { createContext, useContext, useEffect, useState } from 'react'
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
  signOut: () => Promise<void>
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isAdmin: false,
  isDesigner: false,
  isClient: false,
  emailVerified: false,
  signOut: async () => {},
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (userId: string, fallback?: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      return data?.role || fallback || 'client'
    } catch {
      return fallback || 'client'
    }
  }

  const processUser = async (u: any) => {
    if (!u) {
      setUser(null)
      setUserRole(null)
      setEmailVerified(false)
      return
    }

    setUser(u)

    const isGoogle = u.app_metadata?.provider === 'google'
    const verified = !!u.email_confirmed_at || isGoogle
    setEmailVerified(verified)

    // Ensure Google users have their profile/designer row first
    if (isGoogle) {
      await handleGoogleUser(u)
    }

    const role = await fetchRole(u.id, u.user_metadata?.role)
    setUserRole(role as any)
  }

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    await processUser(session?.user ?? null)
  }

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
      console.log('Auth event:', event, session?.user?.email)

      if (event === 'SIGNED_IN') {
        await processUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserRole(null)
        setEmailVerified(false)
      } else if (event === 'TOKEN_REFRESHED') {
        await processUser(session?.user ?? null)
      } else if (event === 'USER_UPDATED') {
        await processUser(session?.user ?? null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setEmailVerified(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        emailVerified,
        isAdmin: userRole === 'admin',
        isDesigner: userRole === 'designer',
        isClient: userRole === 'client' || (!!user && userRole === null),
        signOut,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)