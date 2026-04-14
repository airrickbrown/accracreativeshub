// ── src/components/PresenceIndicator.tsx ──
// Real-time online/offline status using Supabase Realtime presence.
// Drop this anywhere you need to show if a user is online.
//
// Usage:
//   <PresenceIndicator userId={designer.id} showLabel />
//   <PresenceIndicator userId={client.id} size={8} />
//
// Also exports usePresence hook for tracking multiple users.

import React, { useState, useEffect, useCallback } from 'react'
import { S } from '../styles/tokens'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'


// ── Hook: track own presence (call once per session) ──────────

export function useOwnPresence() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    // Join the global presence channel
    const channel = supabase.channel('online_users', {
      config: { presence: { key: user.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {})
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Broadcast that this user is online
          await channel.track({
            user_id:  user.id,
            online_at: new Date().toISOString(),
          })
        }
      })

    // Cleanup — user goes offline when channel unsubscribes
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])
}

// ── Hook: watch if a specific user is online ──────────────────

export function useIsOnline(targetUserId: string | undefined): boolean {
  const [online, setOnline] = useState(false)

  useEffect(() => {
    if (!targetUserId) return

    const channel = supabase.channel('online_users')

    const syncPresence = () => {
      const state  = channel.presenceState()
      const users  = Object.keys(state)
      setOnline(users.includes(targetUserId))
    }

    channel
      .on('presence', { event: 'sync'  }, syncPresence)
      .on('presence', { event: 'join'  }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [targetUserId])

  return online
}

// ── Component: dot + optional label ──────────────────────────

interface PresenceProps {
  userId?:    string
  showLabel?: boolean
  size?:      number        // dot size in px, default 8
  style?:     React.CSSProperties
}

export default function PresenceIndicator({
  userId,
  showLabel = false,
  size      = 8,
  style     = {},
}: PresenceProps) {
  const online = useIsOnline(userId)

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style,
    }}>
      {/* Dot */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {/* Pulse ring — only when online */}
        {online && (
          <div style={{
            position: 'absolute', inset: -3,
            borderRadius: '50%',
            background: 'rgba(74,222,128,0.2)',
            animation: 'presence_pulse 2s ease-out infinite',
          }} />
        )}
        {/* Solid dot */}
        <div style={{
          width: size, height: size,
          borderRadius: '50%',
          background: online ? '#4ade80' : '#555',
          transition: 'background 0.3s',
          position: 'relative',
        }} />
      </div>

      {/* Label */}
      {showLabel && (
        <span style={{
          fontFamily:    S.body,
          fontSize:      'clamp(10px, 2.5vw, 12px)',
          color:         online ? '#4ade80' : S.textFaint,
          fontWeight:    online ? 600 : 400,
          transition:    'color 0.3s',
          letterSpacing: '0.02em',
        }}>
          {online ? 'Online' : 'Offline'}
        </span>
      )}

      <style>{`
        @keyframes presence_pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>
    </div>
  )
}