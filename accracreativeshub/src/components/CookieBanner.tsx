// ── src/components/CookieBanner.tsx ──
// Appears on first visit. Saves user choice to localStorage.
// Does not render again once accepted or declined.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Body } from './UI'

const STORAGE_KEY = 'cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setVisible(true)
  }, [])

  if (!visible) return null

  const accept = () => { localStorage.setItem(STORAGE_KEY, 'accepted');  setVisible(false) }
  const decline = () => { localStorage.setItem(STORAGE_KEY, 'declined'); setVisible(false) }

  return (
    <div style={{
      position:     'fixed',
      bottom:        0,
      left:          0,
      right:         0,
      zIndex:        180,
      background:    S.surface,
      borderTop:    `1px solid ${S.border}`,
      backdropFilter: 'blur(12px)',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      flexWrap:     'wrap',
      gap:           12,
      padding:      '14px 24px',
    }}>
      <Body style={{ fontSize: 13, margin: 0, flex: 1, minWidth: 200 }}>
        We use cookies to improve your experience on Accra Creatives Hub.
      </Body>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Btn variant="ghost" size="sm" onClick={decline}>Decline</Btn>
        <Btn variant="gold"  size="sm" onClick={accept}>Accept All</Btn>
      </div>
    </div>
  )
}
