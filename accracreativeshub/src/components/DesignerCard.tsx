import React, { useState } from 'react'
import { S } from '../styles/tokens'
import { Btn, Badge, Stars, Hl, Body, Lbl } from './UI'

interface DesignerCardProps {
  designer: any
  onView:   (d: any) => void
  onHire:   (d: any) => void
}

export default function DesignerCard({ designer, onView, onHire }: DesignerCardProps) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: S.surface,
        border: `1px solid ${hov ? 'rgba(201,168,76,0.45)' : S.borderFaint}`,
        borderRadius: S.radiusMd,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.45)' : '0 1px 4px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: designer.color }}>
        <img
          src={designer.portrait}
          alt={`${designer.name} — ${designer.category} designer in Ghana`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            filter: 'grayscale(100%)',
            opacity: hov ? 0.9 : 0.75,
            transition: 'opacity 0.35s, transform 0.35s',
            transform: hov ? 'scale(1.03)' : 'scale(1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(19,19,19,0.9) 0%, transparent 55%)',
          }}
        />

        {/* Top-left: featured badge only */}
        {designer.featured && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <div
              style={{
                background: S.gold,
                color: S.onPrimary,
                fontSize: 7,
                fontWeight: 800,
                letterSpacing: '0.2em',
                padding: '3px 8px',
                fontFamily: S.body,
                borderRadius: 999,
              }}
            >
              FEATURED
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Hl style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{designer.name}</Hl>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Badge type={designer.badge} size={8} />
                <Body style={{ fontSize: 9 }}>{designer.location}</Body>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Lbl style={{ margin: 0, fontSize: 7, color: S.textFaint }}>Starting at</Lbl>
              <Hl style={{ color: S.gold, fontSize: 15 }}>GH₵{designer.price}</Hl>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <Body style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>{designer.tagline}</Body>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {designer.tags.map((t: string) => (
            <span
              key={t}
              style={{
                background: S.bgLow,
                color: S.textFaint,
                fontSize: 8,
                padding: '3px 8px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: S.body,
                border: `1px solid ${S.borderFaint}`,
                borderRadius: 4,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: `1px solid ${S.borderFaint}`,
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={designer.rating} />
            <Body style={{ fontSize: 10 }}>{designer.rating} ({designer.reviews})</Body>
          </div>
          <span style={{ color: S.gold, fontSize: 9, fontFamily: S.body, letterSpacing: '0.1em' }}>
            ⚡ {designer.responseTime}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => onView(designer)} full>
            View Profile
          </Btn>
          <Btn variant="gold" size="sm" onClick={() => onHire(designer)} full>
            Hire
          </Btn>
        </div>
      </div>
    </div>
  )
}
