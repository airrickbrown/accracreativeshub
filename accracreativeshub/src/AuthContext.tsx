// ── src/AuthContext.tsx ──
// Fix: after email verification link is clicked, user is redirected
// and the welcome page now shows correctly based on role.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'

interface AuthContextType {
  user:             any
  userRole:         'admin' | 'designer' | 'client' | null
  isAdmin:          boolean
  isDesigner:       boolean
  isClient:         boolean
  emailVerified:    boolean
  loading:          boolean
  justVerified:     boolean       // true for one render cycle after email verification
  clearJustVerified: () => void   // call after consuming the flag
  signOut:          () => Promise<void>
  refreshUser:      () => Promise<void>
}

const Ctx = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false, isDesigner: false,
  isClient: false, emailVerified: false, loading: true,
  justVerified: false, clearJustVerified: () => {},
  signOut: async () => {}, refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]              = useState<any>(null)
  const [userRole, setUserRole]      = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setVerified] = useState(false)
  const [loading, setLoading]        = useState(true)
  const [justVerified, setJustVerified] = useState(false)

  const fetchRole = async (userId: string, fallback = 'client'): Promise<string> => {
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      return data?.role || fallback
    } catch { return fallback }
  }

  const processUser = useCallback(async (u: any) => {
    if (!u) { setUser(null); setUserRole(null); setVerified(false); return }
    setUser(u)
    setVerified(!!u.email_confirmed_at)
    const role = await fetchRole(u.id, u.user_metadata?.role || 'client')
    setUserRole(role as any)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await processUser(session?.user ?? null)
  }, [processUser])

  useEffect(() => {
    let done = false
    const timeout = setTimeout(() => { if (!done) { done = true; setLoading(false) } }, 8000)

    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      if (done) return
      done = true
      clearTimeout(timeout)
      await processUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => { if (!done) { done = true; clearTimeout(timeout); setLoading(false) } })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {

        // ── Email verification completed ──
        // When user clicks verification link, event is SIGNED_IN
        // and email_confirmed_at is now set
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          await processUser(session.user)

          // Check if this is a fresh verification (not just a normal login).
          // We detect it by looking at the URL hash that Supabase appends on
          // email-confirmation redirects (#access_token=... or ?type=signup).
          const isVerificationCallback =
            window.location.hash.includes('access_token') ||
            window.location.search.includes('type=signup') ||
            window.location.search.includes('type=recovery')

          const role = await fetchRole(session.user.id, session.user.user_metadata?.role || 'client')

          if (isVerificationCallback) {
            // Use pushState (not replaceState) so that the popstate listener
            // in App.tsx fires and re-evaluates currentPath.
            if (role === 'designer') {
              window.history.pushState({ overlay: true }, '', '/apply-designer')
            } else {
              window.history.pushState({ overlay: true }, '', '/welcome')
            }
            // Dispatch popstate so App.tsx picks up the new pathname
            window.dispatchEvent(new PopStateEvent('popstate'))
            setJustVerified(true)
          }
        }

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
    window.history.replaceState({}, '', '/')
  }

  const clearJustVerified = useCallback(() => setJustVerified(false), [])

  return (
    <Ctx.Provider value={{
      user, userRole, emailVerified, loading,
      justVerified, clearJustVerified,
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