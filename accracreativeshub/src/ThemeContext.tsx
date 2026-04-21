// ── src/ThemeContext.tsx ──
// Provides a reactive dark/light theme token object (S) to the whole app.
// Uses a Proxy over the underlying dark/light S objects so all existing
// `import { S }` usages re-read the correct values on every re-render —
// no mass file updates needed.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
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

  // Sync the proxy whenever theme changes
  useEffect(() => {
    _setTheme(theme === 'dark')
    // Force body background so browser chrome matches
    document.documentElement.style.background = theme === 'dark' ? '#080808' : '#f9f7f2'
    document.body.style.background = theme === 'dark' ? '#080808' : '#f9f7f2'
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('ach_theme', next) } catch { /* ignore */ }
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, kenteUrl: getKenteUrl() }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
