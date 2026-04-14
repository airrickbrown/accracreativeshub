// ── src/hooks/useIsMobile.ts ──
// Extracted from 6+ components that each had the same 6-line resize listener.
// Usage: const isMobile = useIsMobile()  (defaults to 768px breakpoint)

import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  return isMobile
}
