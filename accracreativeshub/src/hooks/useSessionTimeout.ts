// ── src/hooks/useSessionTimeout.ts ──
//
// Detects user inactivity across mouse, keyboard, touch, scroll, and wheel events.
// Uses localStorage so all open tabs share the same activity clock — activity in
// any tab resets the timer for all tabs.
//
// On timeout: calls `onTimeout` (which in App.tsx triggers handleLogout —
// closes all overlays, shows SignedOutPage, clears Supabase session + storage).
//
// Supabase token behaviour:
//   • Access token (JWT) expires every 3600s by default; Supabase JS auto-refreshes it.
//   • Refresh tokens rotate on each use and (by default) never hard-expire.
//   • Our signOut() calls supabase.auth.signOut(), which revokes the refresh token
//     server-side — even a stolen localStorage token becomes useless after that.
//   • For extra hardening, set "Refresh token reuse interval" in
//     Supabase Dashboard → Authentication → Settings.

import { useEffect, useRef } from 'react'

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes default
const CHECK_INTERVAL_MS         = 60 * 1_000        // poll every 60s
const STORAGE_KEY               = 'ach_last_activity'
const ACTIVITY_EVENTS           = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'click'] as const

export { STORAGE_KEY as SESSION_ACTIVITY_KEY }

interface Options {
  timeoutMs?: number   // override default — pass in milliseconds
  onTimeout:  () => void
  enabled:    boolean  // only active while user is logged in
}

export function useSessionTimeout({ timeoutMs = SESSION_TIMEOUT_MS, onTimeout, enabled }: Options) {
  // Keep a stable ref so interval/visibilitychange closures never capture stale callbacks
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    if (!enabled) return

    const stamp = () => {
      try { localStorage.setItem(STORAGE_KEY, Date.now().toString()) } catch { /* ignore */ }
    }

    const check = () => {
      try {
        const raw  = localStorage.getItem(STORAGE_KEY)
        const last = raw ? parseInt(raw, 10) : 0
        if (last && Date.now() - last > timeoutMs) {
          onTimeoutRef.current()
        }
      } catch { /* ignore */ }
    }

    // Record initial activity so a freshly-logged-in user isn't immediately timed out
    stamp()

    // Reset clock on any user interaction
    const handleActivity = () => stamp()
    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }))

    // Check immediately when the tab becomes visible again — browsers throttle
    // setInterval in background tabs, so this is the reliable wakeup path.
    const handleVisibility = () => { if (!document.hidden) check() }
    document.addEventListener('visibilitychange', handleVisibility)

    // Periodic in-tab check (catches inactivity even when tab stays focused)
    const interval = setInterval(check, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, handleActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(interval)
    }
  }, [enabled, timeoutMs])
}
