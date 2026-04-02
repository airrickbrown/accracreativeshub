// ── AuthContext.tsx ──
// Exposes user, userRole, isAdmin, isDesigner, isClient, signOut, loading
// Place this file at: src/AuthContext.tsx (replacing your existing one)

import React, { createContext, useContext, useEffect, useState } from 'react'
// @ts-ignore
import { supabase } from './lib/supabase'

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
  user:       null,
  userRole:   null,
  isAdmin:    false,
  isDesigner: false,
  isClient:   false,
  signOut:    async () => {},
  loading:    true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<any>(null)
  const [userRole, setUserRole] = useState<'admin' | 'designer' | 'client' | null>(null)
  const [loading, setLoading]   = useState(true)

  const fetchRole = async (userId: string, metaRole?: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return data?.role || metaRole || 'client'
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const role = await fetchRole(session.user.id, session.user.user_metadata?.role)
        setUserRole(role)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const role = await fetchRole(session.user.id, session.user.user_metadata?.role)
          setUserRole(role)
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
      user,
      userRole,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   userRole === 'client',
      signOut,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)