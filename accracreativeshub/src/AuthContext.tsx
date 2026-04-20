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
  deleteAccount:    (name?: string) => Promise<void>
}

const Ctx = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false, isDesigner: false,
  isClient: false, emailVerified: false, loading: true,
  justVerified: false, clearJustVerified: () => {},
  signOut: async () => {}, refreshUser: async () => {}, deleteAccount: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]              = useState<any>(null)
  const [userRole, setUserRole]      = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setVerified] = useState(false)
  const [loading, setLoading]        = useState(true)
  const [justVerified, setJustVerified] = useState(false)

  const fetchRole = async (userId: string, fallback = 'client'): Promise<string> => {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (error) {
      // Surface DB errors (e.g. RLS recursion) instead of silently masking them
      console.error('[fetchRole] profiles query failed:', error.message)
      return fallback
    }
    return data?.role || fallback
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

        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          // processUser once per event — fetches role and sets all auth state
          await processUser(session?.user ?? null)

          // ── Detect fresh email verification ──────────────────────────────
          // We cannot rely on URL hash inspection: Supabase JS strips the
          // #access_token fragment synchronously during client init, before
          // any async code (including this callback) ever runs.
          //
          // Instead, signUpUser() stores the pending email in localStorage.
          // We check it here and clear it on first match so it only fires once,
          // even if the verification link opens in a different tab or browser.
          if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
            try {
              const pendingEmail = localStorage.getItem('ach_verifying')
              if (pendingEmail && pendingEmail === session.user.email?.toLowerCase()) {
                // Confirm recency — email_confirmed_at must be within the last 15 minutes
                const confirmedMs = new Date(session.user.email_confirmed_at).getTime()
                if (Date.now() - confirmedMs < 15 * 60 * 1000) {
                  localStorage.removeItem('ach_verifying')
                  // Clean the URL (remove any leftover Supabase query params)
                  window.history.replaceState({}, '', '/')
                  // Signal App.tsx to show the role-appropriate welcome overlay.
                  // Role is already set in state by processUser above.
                  setJustVerified(true)
                }
              }
            } catch { /* localStorage unavailable — skip verification detection */ }
          }

        } else if (event === 'SIGNED_OUT') {
          setUser(null); setUserRole(null); setVerified(false)
          try { localStorage.removeItem('ach_verifying') } catch { /* ignore */ }
        }
        setLoading(false)
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [processUser])

  const signOut = async () => {
    // Nuke all realtime subscriptions before clearing session
    try { await supabase.removeAllChannels() } catch { /* ignore */ }
    await supabase.auth.signOut()
    setUser(null); setUserRole(null); setVerified(false)
    // Clear all ACH auth keys from storage
    try {
      localStorage.removeItem('ach_verifying')
      localStorage.removeItem('ach_last_activity')
      sessionStorage.removeItem('ach_adm_ok')
    } catch { /* ignore */ }
    window.history.replaceState({}, '', '/')
  }

  // Calls the server-side delete-account function which uses the service role key
  // to anonymize profile data and delete the auth user, then clears local session.
  const deleteAccount = async (name?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const res = await fetch('/api/delete-account', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Account deletion failed. Please contact support.')
    }

    // Auth user is now deleted server-side. Clear local session gracefully.
    await supabase.auth.signOut().catch(() => {})
    setUser(null); setUserRole(null); setVerified(false)
    window.history.replaceState({}, '', '/')
  }

  const clearJustVerified = useCallback(() => setJustVerified(false), [])

  return (
    <Ctx.Provider value={{
      user, userRole, emailVerified, loading,
      justVerified, clearJustVerified,
      signOut, refreshUser, deleteAccount,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   !!user && !['admin', 'designer'].includes(userRole || ''),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)