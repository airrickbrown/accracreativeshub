// ── src/components/AdminToast.tsx ──
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { S } from '../styles/tokens'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id:      string
  variant: ToastVariant
  message: string
}

const STYLES: Record<ToastVariant, { bg: string; border: string; icon: string; accent: string }> = {
  success: { bg: 'rgba(22,163,74,0.13)',  border: 'rgba(22,163,74,0.35)',  icon: '✓', accent: '#4ade80' },
  error:   { bg: 'rgba(239,68,68,0.13)',  border: 'rgba(239,68,68,0.35)',  icon: '✕', accent: '#f87171' },
  info:    { bg: 'rgba(59,130,246,0.13)', border: 'rgba(59,130,246,0.35)', icon: 'ℹ', accent: '#60a5fa' },
  warning: { bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.35)', icon: '⚠', accent: '#fbbf24' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { bg, border, icon, accent } = STYLES[toast.variant]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  // Slide in from right on mount
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translateX(110%)'
    el.style.opacity   = '0'
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease'
      el.style.transform  = 'translateX(0)'
      el.style.opacity    = '1'
    })
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        gap:            10,
        background:     bg,
        border:         `1px solid ${border}`,
        borderLeft:     `3px solid ${accent}`,
        borderRadius:   8,
        padding:        '12px 14px',
        minWidth:       280,
        maxWidth:       360,
        boxShadow:      '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        cursor:         'pointer',
        userSelect:     'none',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <span style={{ color: accent, fontWeight: 700, fontSize: 13, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>
        {icon}
      </span>
      <span style={{ color: '#f0f0f0', fontSize: 12, fontFamily: S.body, lineHeight: 1.6, flex: 1 }}>
        {toast.message}
      </span>
      <span style={{ color: '#666', fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>×</span>
    </div>
  )
}

// ── useToast hook ─────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((variant: ToastVariant, message: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, variant, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}

// ── AdminToast renderer ───────────────────────────────────────────────────────

interface AdminToastProps {
  toasts:    Toast[]
  onDismiss: (id: string) => void
}

export default function AdminToast({ toasts, onDismiss }: AdminToastProps) {
  if (toasts.length === 0) return null
  return (
    <div style={{
      position:       'fixed',
      top:            20,
      right:          20,
      zIndex:         9999,
      display:        'flex',
      flexDirection:  'column',
      gap:            10,
      pointerEvents:  'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
