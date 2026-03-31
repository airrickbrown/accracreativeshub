// ── DESIGNER RESUME ──
// Opened when user clicks "View Resume" on a designer profile.
// Shows structured CV-style page: bio, skills, experience, education, tools.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Btn, Hl, Body, Lbl, Divider, Badge, GoldLine, Stars } from './UI'
import Nav from './Nav'

interface DesignerResumeProps {
  designer: any
  onHire:   (d: any) => void
  onClose:  () => void
}

export default function DesignerResume({ designer, onHire, onClose }: DesignerResumeProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Derived / fallback data from designer object
  const tools       = designer.tools       || ['Adobe Illustrator', 'Figma', 'Photoshop', 'After Effects', 'Canva Pro']
  const skills      = designer.skills      || ['Brand Identity', 'Typography', 'Visual Design', 'Motion Graphics', 'UI/UX']
  const experience  = designer.experience  || [
    {
      role: 'Senior Graphic Designer',
      company: 'Independent Studio',
      period: '2021 – Present',
      desc: 'Leading brand identity projects for local and international clients across fashion, food, and tech sectors.',
    },
    {
      role: 'Junior Designer',
      company: 'Creative Agency Accra',
      period: '2018 – 2021',
      desc: 'Produced social media assets, flyers, and marketing materials for over 40 brands.',
    },
  ]
  const education   = designer.education   || [
    { degree: 'BA Communication Design', school: 'KNUST, Kumasi', year: '2018' },
  ]
  const languages   = designer.languages   || ['English', 'Twi']

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>

      {/* Nav */}
      <Nav
        scrolled={true}
        user={null}
        onAdmin={() => {}}
        onSignup={() => {}}
        onMessages={() => {}}
        onMarketplace={onClose}
        onHowItWorks={onClose}
        onForDesigners={onClose}
        onLogin={() => {}}
        onSignOut={() => {}}
      />

      {/* Back */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '80px 16px 0' : '80px 40px 0' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: `1px solid ${S.borderFaint}`,
            color: S.textMuted,
            fontFamily: S.headline,
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: 8,
            marginBottom: 28,
          }}
        >
          ← Back to Profile
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 16px 60px' : '0 40px 60px' }}>

        {/* ── Header card ── */}
        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            padding: isMobile ? '24px 20px' : '36px 40px',
            marginBottom: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 28,
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {/* Avatar / initials */}
            <div
              style={{
                width: isMobile ? 64 : 80,
                height: isMobile ? 64 : 80,
                borderRadius: '50%',
                background: '#1a2a1a',
                border: `2px solid ${S.gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: S.text,
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
                fontFamily: S.body,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {designer.portrait ? (
                <img
                  src={designer.portrait}
                  alt={designer.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)' }}
                />
              ) : (
                designer.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
              )}
            </div>

            <div>
              <Hl style={{ fontSize: isMobile ? 22 : 28, fontWeight: 400, marginBottom: 4 }}>
                {designer.name}
              </Hl>
              <Body style={{ fontSize: 13, marginBottom: 8 }}>{designer.tagline}</Body>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge type={designer.badge} />
                <Body style={{ fontSize: 11, margin: 0 }}>📍 {designer.location || 'Accra, Ghana'}</Body>
                <Stars rating={designer.rating || 5} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: isMobile ? '100%' : 160 }}>
            <Btn variant="gold" full onClick={() => onHire(designer)}>Hire Designer</Btn>
            <Body style={{ fontSize: 10, textAlign: 'center', color: S.textFaint, margin: 0 }}>
              Starting at GH₵{designer.price}
            </Body>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
            gap: 1,
            background: S.borderFaint,
            marginBottom: 2,
          }}
        >
          {[
            { l: 'Projects Completed', v: designer.orders     || '12+'  },
            { l: 'Client Reviews',     v: designer.reviews    || '8'    },
            { l: 'Response Time',      v: designer.responseTime || '< 1hr' },
            { l: 'Member Since',       v: designer.memberSince || '2023' },
          ].map((s) => (
            <div key={s.l} style={{ background: S.bgLow, padding: '18px 20px', textAlign: 'center' }}>
              <Hl style={{ color: S.gold, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>{s.v}</Hl>
              <Lbl style={{ margin: 0, marginTop: 6, fontSize: 8 }}>{s.l}</Lbl>
            </div>
          ))}
        </div>

        {/* ── Two column layout ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
            gap: 2,
            background: S.borderFaint,
          }}
        >

          {/* ── Main column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* About */}
            <div style={{ background: S.bgLow, padding: '28px 32px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>About</Lbl>
              <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
                {designer.bio ||
                  `${designer.name} is a Ghana-based visual designer specialising in brand identity and digital design. 
                  With a deep understanding of Ghanaian aesthetics and contemporary global design trends, 
                  they create work that bridges cultural authenticity with modern visual language. 
                  Available for both local and international commissions.`}
              </Body>
            </div>

            {/* Experience */}
            <div style={{ background: S.bgLow, padding: '28px 32px' }}>
              <Lbl style={{ marginBottom: 18, color: S.gold }}>Experience</Lbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {experience.map((e: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      <div>
                        <Hl style={{ fontSize: 15, fontWeight: 500 }}>{e.role}</Hl>
                        <Body style={{ fontSize: 12, margin: 0, color: S.gold }}>{e.company}</Body>
                      </div>
                      <Lbl style={{ margin: 0, fontSize: 9, whiteSpace: 'nowrap' }}>{e.period}</Lbl>
                    </div>
                    <Body style={{ fontSize: 12, lineHeight: 1.8 }}>{e.desc}</Body>
                    {i < experience.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio preview */}
            <div style={{ background: S.bgLow, padding: '28px 32px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>Selected Portfolio</Lbl>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {(designer.portfolio || []).slice(0, 6).map((p: string, i: number) => (
                  <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', background: designer.color || S.surface }}>
                    <img
                      src={p}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(70%)', opacity: 0.8, transition: 'all 0.3s' }}
                      onMouseEnter={(e: any) => { e.target.style.filter = 'grayscale(0%)'; e.target.style.opacity = '1' }}
                      onMouseLeave={(e: any) => { e.target.style.filter = 'grayscale(70%)'; e.target.style.opacity = '0.8' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Skills */}
            <div style={{ background: S.bgLow, padding: '24px 24px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>Skills</Lbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {skills.map((s: string, i: number) => (
                  <div key={s}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Body style={{ fontSize: 11, margin: 0 }}>{s}</Body>
                      <Body style={{ fontSize: 10, margin: 0, color: S.gold }}>
                        {['Expert', 'Expert', 'Advanced', 'Intermediate', 'Advanced'][i % 5]}
                      </Body>
                    </div>
                    <div style={{ height: 2, background: S.borderFaint, borderRadius: 2 }}>
                      <div
                        style={{
                          height: '100%',
                          background: S.gold,
                          borderRadius: 2,
                          width: ['95%', '90%', '80%', '65%', '75%'][i % 5],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div style={{ background: S.bgLow, padding: '24px 24px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>Tools</Lbl>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tools.map((t: string) => (
                  <span
                    key={t}
                    style={{
                      background: S.surface,
                      border: `1px solid ${S.borderFaint}`,
                      color: S.textMuted,
                      fontSize: 9,
                      padding: '4px 10px',
                      fontFamily: S.body,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: 4,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={{ background: S.bgLow, padding: '24px 24px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>Education</Lbl>
              {education.map((e: any, i: number) => (
                <div key={i} style={{ marginBottom: i < education.length - 1 ? 14 : 0 }}>
                  <Hl style={{ fontSize: 13, fontWeight: 500 }}>{e.degree}</Hl>
                  <Body style={{ fontSize: 11, margin: 0 }}>{e.school}</Body>
                  <Lbl style={{ margin: 0, marginTop: 2, fontSize: 8 }}>{e.year}</Lbl>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{ background: S.bgLow, padding: '24px 24px' }}>
              <Lbl style={{ marginBottom: 14, color: S.gold }}>Languages</Lbl>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {languages.map((l: string) => (
                  <span
                    key={l}
                    style={{
                      background: 'rgba(201,168,76,0.08)',
                      border: `1px solid rgba(201,168,76,0.2)`,
                      color: S.gold,
                      fontSize: 10,
                      padding: '4px 12px',
                      fontFamily: S.body,
                      borderRadius: 4,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div style={{ background: S.bgLow, padding: '24px 24px' }}>
              <Lbl style={{ marginBottom: 10, color: S.gold }}>Availability</Lbl>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: S.success }} />
                <Body style={{ fontSize: 12, margin: 0, color: S.success }}>Open to Projects</Body>
              </div>
              <Body style={{ fontSize: 11, marginTop: 8 }}>
                Responds within {designer.responseTime || '1 hour'}
              </Body>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            borderTop: 'none',
            padding: isMobile ? '20px' : '28px 40px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Hl style={{ fontSize: 16, fontWeight: 400 }}>Ready to work with {designer.name?.split(' ')[0]}?</Hl>
            <Body style={{ fontSize: 12, margin: 0 }}>Projects start from GH₵{designer.price}</Body>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
            <Btn variant="gold" size="lg" full={isMobile} onClick={() => onHire(designer)}>
              Hire Designer
            </Btn>
            <Btn variant="outline" size="lg" full={isMobile} onClick={onClose}>
              Back to Profile
            </Btn>
          </div>
        </div>

      </div>
    </div>
  )
}