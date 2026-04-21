// ── src/ThemeContext.tsx ──
// Provides a reactive dark/light theme token object (S) to the whole app.
// Uses a Proxy over the underlying dark/light S objects so all existing
// `import { S }` usages re-read the correct values on every re-render —
// no mass file updates needed.

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { setTheme as _setTheme, getKenteUrl } from './styles/tokens'

type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme:        Theme
  isDark:       boolean
  toggleTheme:  () => void
  kenteUrl:     string
}

const Ctx = createContext<ThemeCtx>({
  theme: 'dark', isDark: true, toggleTheme: () => {}, kenteUrl: getKenteUrl(),
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('ach_theme') as Theme) || 'dark' } catch { return 'dark' }
  })

  // Apply on initial mount only (subsequent changes handled synchronously in toggleTheme)
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) return
    didMount.current = true
    _setTheme(theme === 'dark')
    const bg = theme === 'dark' ? '#080808' : '#f9f7f2'
    document.documentElement.style.background = bg
    document.body.style.background = bg
  }, [theme])

  const toggleTheme = useCallback(() => {
    // Suppress all CSS transitions for an instant, flash-free theme switch
    document.documentElement.classList.add('no-transition')
    setTheme(t => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('ach_theme', next) } catch { /* ignore */ }
      _setTheme(next === 'dark')
      const bg = next === 'dark' ? '#080808' : '#f9f7f2'
      document.documentElement.style.background = bg
      document.body.style.background = bg
      return next
    })
    // Re-enable transitions after two animation frames (one to paint, one to restore)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition')
    }))
  }, [])

  return (
    <Ctx.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, kenteUrl: getKenteUrl() }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
