// ── src/AuthContext.tsx ──

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
  justVerified:     boolean
  clearJustVerified: () => void
  signOut:          () => Promise<void>
  refreshUser:      () => Promise<void>
  deleteAccount:    (name?: string) => Promise<void>
  hasSeenWelcome:   boolean | null  // null = still loading
  markWelcomeSeen:  () => Promise<void>
}

const Ctx = createContext<AuthContextType>({
  user: null, userRole: null, isAdmin: false, isDesigner: false,
  isClient: false, emailVerified: false, loading: true,
  justVerified: false, clearJustVerified: () => {},
  signOut: async () => {}, refreshUser: async () => {}, deleteAccount: async () => {},
  hasSeenWelcome: null, markWelcomeSeen: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]              = useState<any>(null)
  const [userRole, setUserRole]      = useState<'admin' | 'designer' | 'client' | null>(null)
  const [emailVerified, setVerified] = useState(false)
  const [loading, setLoading]        = useState(true)
  const [justVerified, setJustVerified] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null)

  // Fetch the profile row and return the role. If no row exists yet (new signup),
  // create it from user_metadata — this is safe because we're called only when
  // a SIGNED_IN event fires, meaning auth.uid() = user.id is guaranteed.
  const fetchOrCreateProfile = async (u: any): Promise<string> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', u.id)
      .single()

    if (data?.role) return data.role

    if (error?.code === 'PGRST116' || !data) {
      // Row doesn't exist yet — create it now that the session is active
      const role     = u.user_metadata?.role || 'client'
      const fullName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User'
      const { error: insertErr } = await supabase
        .from('profiles')
        .upsert([{ id: u.id, full_name: fullName, role, email: u.email }], { onConflict: 'id' })
      if (insertErr) {
        console.error('[AuthContext] profile upsert failed:', insertErr.message)
      }
      return role
    }

    console.error('[fetchOrCreateProfile] profiles query failed:', (error as any)?.message)
    return u.user_metadata?.role || 'client'
  }

  const processUser = useCallback(async (u: any) => {
    if (!u) { setUser(null); setUserRole(null); setVerified(false); setHasSeenWelcome(null); return }
    setUser(u)
    setVerified(!!u.email_confirmed_at)
    const role = await fetchOrCreateProfile(u)
    setUserRole(role as any)
    // Non-blocking fetch for has_seen_welcome — graceful if column doesn't exist yet
    supabase.from('profiles').select('has_seen_welcome').eq('id', u.id).single()
      .then(({ data }) => setHasSeenWelcome((data as any)?.has_seen_welcome === true))
      .catch(() => setHasSeenWelcome(false))
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
          await processUser(session?.user ?? null)

          // ── Detect fresh email verification ──────────────────────────────
          if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
            try {
              const pendingEmail = localStorage.getItem('ach_verifying')
              if (pendingEmail && pendingEmail === session.user.email?.toLowerCase()) {
                const confirmedMs = new Date(session.user.email_confirmed_at).getTime()
                if (Date.now() - confirmedMs < 15 * 60 * 1000) {
                  localStorage.removeItem('ach_verifying')
                  window.history.replaceState({}, '', '/')
                  setJustVerified(true)
                }
              }
            } catch { /* localStorage unavailable */ }
          }

        } else if (event === 'SIGNED_OUT') {
          setUser(null); setUserRole(null); setVerified(false); setHasSeenWelcome(null)
          try { localStorage.removeItem('ach_verifying') } catch { /* ignore */ }
        }
        setLoading(false)
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [processUser])

  const signOut = async () => {
    // Clear local state immediately so UI updates without waiting for Supabase
    setUser(null); setUserRole(null); setVerified(false)
    try {
      localStorage.removeItem('ach_verifying')
      localStorage.removeItem('ach_last_activity')
      sessionStorage.removeItem('ach_adm_ok')
    } catch { /* ignore */ }
    window.history.replaceState({}, '', '/')
    supabase.removeAllChannels().catch(() => {})
    await supabase.auth.signOut().catch(() => {})
  }

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

    await supabase.auth.signOut().catch(() => {})
    setUser(null); setUserRole(null); setVerified(false)
    window.history.replaceState({}, '', '/')
  }

  const markWelcomeSeen = useCallback(async () => {
    setHasSeenWelcome(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('profiles').update({ has_seen_welcome: true }).eq('id', session.user.id)
      }
    } catch { /* column may not exist yet in DB — silently ignore */ }
  }, [])

  const clearJustVerified = useCallback(() => setJustVerified(false), [])

  return (
    <Ctx.Provider value={{
      user, userRole, emailVerified, loading,
      justVerified, clearJustVerified,
      signOut, refreshUser, deleteAccount,
      hasSeenWelcome, markWelcomeSeen,
      isAdmin:    userRole === 'admin',
      isDesigner: userRole === 'designer',
      isClient:   !!user && !['admin', 'designer'].includes(userRole || ''),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
