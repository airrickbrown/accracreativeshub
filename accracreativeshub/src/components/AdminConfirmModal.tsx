// ── src/components/AdminConfirmModal.tsx ──
import React from 'react'
import { S } from '../styles/tokens'

export interface ConfirmConfig {
  title:      string
  message:    string
  confirmLabel?: string
  variant?:   'danger' | 'warning' | 'success'
  onConfirm:  () => void
}

interface Props {
  config:    ConfirmConfig
  onCancel:  () => void
}

const VARIANT_STYLES = {
  danger:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171'  },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24'  },
  success: { bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.4)',  color: '#4ade80'  },
}

export default function AdminConfirmModal({ config, onCancel }: Props) {
  const variant = config.variant ?? 'danger'
  const vs = VARIANT_STYLES[variant]

  return (
    <div
      style={{
        position:       'absolute',
        inset:          0,
        zIndex:         300,
        background:     'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background:   '#111',
          border:       `1px solid ${S.border}`,
          borderRadius: 12,
          padding:      '32px 28px',
          maxWidth:     400,
          width:        '100%',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: vs.color, fontSize: 28, marginBottom: 14, lineHeight: 1 }}>◈</div>

        <div style={{
          fontFamily:    S.headline,
          fontSize:      18,
          fontWeight:    600,
          color:         '#f0f0f0',
          marginBottom:  10,
          lineHeight:    1.3,
        }}>
          {config.title}
        </div>

        <div style={{
          fontFamily:   S.body,
          fontSize:     13,
          color:        '#999',
          lineHeight:   1.7,
          marginBottom: 28,
        }}>
          {config.message}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex:         1,
              background:   'none',
              border:       `1px solid ${S.borderFaint}`,
              borderRadius: 8,
              color:        '#888',
              fontFamily:   S.headline,
              fontSize:     10,
              letterSpacing:'0.16em',
              textTransform:'uppercase',
              fontWeight:   700,
              padding:      '12px',
              cursor:       'pointer',
              transition:   'all 0.2s',
            }}
            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = '#ccc' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = S.borderFaint; e.currentTarget.style.color = '#888' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { config.onConfirm(); onCancel() }}
            style={{
              flex:         1,
              background:   vs.bg,
              border:       `1px solid ${vs.border}`,
              borderRadius: 8,
              color:        vs.color,
              fontFamily:   S.headline,
              fontSize:     10,
              letterSpacing:'0.16em',
              textTransform:'uppercase',
              fontWeight:   700,
              padding:      '12px',
              cursor:       'pointer',
              transition:   'all 0.2s',
            }}
            onMouseEnter={(e: any) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e: any) => (e.currentTarget.style.opacity = '1')}
          >
            {config.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
