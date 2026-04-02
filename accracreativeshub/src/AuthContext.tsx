// ── AuthContext.tsx ──
// Place at: src/AuthContext.tsx
// Handles: role detection, Google OAuth user setup, hidden admin URL

import React, { createContext, useContext, useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'
import { handleGoogleUser } from './lib/auth'

interface AuthContextType {
  user:       any
  userRole:   'admin' | 'designer' | 'client' | null
  isAdmin:    boolean
  isDesigner: boolean
  isClient:   boolean
  signOut:    () => Promise<void>
  loading:    boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false,
  isDesigner: false, isClient: false,
  signOut: async () => {}, loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<any>(null)
  const [userRole, setUserRole] = useState<'admin' | 'designer' | 'client' | null>(null)
  const [loading, setLoading]   = useState(true)

  const fetchRole = async (userId: string, metaRole?: string) => {
    const { data } = await supabase
      .from('profiles').select('role').eq('id', userId).single()
    return data?.role || metaRole || 'client'
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const role = await fetchRole(u.id, u.user_metadata?.role)
        setUserRole(role)
        // Handle Google OAuth users — ensure profile row exists
        if (u.app_metadata?.provider === 'google') {
          await handleGoogleUser(u)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          const role = await fetchRole(u.id, u.user_metadata?.role)
          setUserRole(role)
          if (u.app_metadata?.provider === 'google') {
            await handleGoogleUser(u)
          }
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  return (
    <AuthContext.Provider value={{
      user, userRole,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   userRole === 'client',
      signOut, loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)