// ── src/components/ProfileSettings.tsx ──
// Full profile settings for clients and designers.
// Reads/writes: profiles table (all users), designers table (designers only).
// Avatar → Supabase Storage bucket "avatars" (must exist, set to public)
// Portfolio → Supabase Storage bucket "portfolio-uploads" (must exist, set to public)
//
// If any storage bucket doesn't exist, uploads degrade gracefully with an error message.

import React, { useState, useEffect, useRef } from 'react'
import { S } from '../styles/tokens'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { supabase } from '../lib/supabase'

interface Props {
  onClose: () => void
}

type Section = 'profile' | 'security' | 'designer' | 'danger'

function FocusField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <p style={{ margin: '0 0 7px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textFaint }}>{label}</p>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box',
          background: S.surfaceHigh,
          border: `1px solid ${focused ? S.gold : S.borderFaint}`,
          borderRadius: 8, color: S.text, fontFamily: S.body,
          fontSize: 15, padding: '13px 16px',
          outline: 'none', transition: 'border-color 0.15s',
        }}
      />
    </div>
  )
}

function Banner({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const p = {
    error:   { bg: 'rgba(239,68,68,0.08)',  bd: 'rgba(239,68,68,0.22)',  c: '#f87171' },
    success: { bg: 'rgba(74,154,74,0.08)',  bd: 'rgba(74,154,74,0.22)', c: '#4ade80' },
  }[type]
  return (
    <div style={{ background: p.bg, border: `1px solid ${p.bd}`, borderRadius: 8, padding: '12px 14px' }}>
      <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: p.c, lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

export default function ProfileSettings({ onClose }: Props) {
  useTheme()
  const { user, isDesigner, deleteAccount } = useAuth()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [active, setActive]     = useState<Section>('profile')

  // Profile fields
  const [fullName, setFullName]   = useState('')
  const [bio, setBio]             = useState('')
  const [location, setLocation]   = useState('')
  const [phone, setPhone]         = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)

  // Security
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [newEmail, setNewEmail]   = useState('')

  const isPasswordUser = Array.isArray(user?.app_metadata?.providers)
    ? user.app_metadata.providers.includes('email')
    : user?.app_metadata?.provider === 'email'

  // Designer-specific
  const [tagline, setTagline]   = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [available, setAvailable] = useState(true)
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  const [pendingFiles, setPendingFiles]   = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])

  // Danger zone
  const [showConfirm, setShowConfirm]         = useState(false)
  const [confirmName, setConfirmName]         = useState('')
  const [deleting, setDeleting]               = useState(false)

  const avatarRef    = useRef<HTMLInputElement>(null)
  const portfolioRef = useRef<HTMLInputElement>(null)

  const clearMsg = () => { setError(''); setSuccess('') }

  // ── Load profile ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('full_name, bio, location, phone, tagline, avatar_url')
          .eq('id', user.id)
          .single()

        if (p) {
          setFullName(p.full_name || user.user_metadata?.full_name || '')
          setBio(p.bio || '')
          setLocation(p.location || '')
          setPhone(p.phone || '')
          setTagline(p.tagline || '')
          setAvatarUrl(p.avatar_url || user.user_metadata?.avatar_url || '')
        }

        if (isDesigner) {
          const { data: d } = await supabase
            .from('designers')
            .select('price_min, portfolio_urls, public_visible')
            .eq('id', user.id)
            .single()

          if (d) {
            setPriceMin(d.price_min != null ? String(d.price_min) : '')
            setPriceMax('')
            setAvailable(d.public_visible !== false)
            setPortfolioUrls(d.portfolio_urls || [])
          }
        }
      } catch {
        // fail silently; form is still usable with empty fields
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id, isDesigner])

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    const ext  = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (upErr) throw new Error(`Avatar upload failed: ${upErr.message}`)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    return publicUrl
  }

  // ── Save profile ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!fullName.trim()) { setError('Name cannot be empty.'); return }
    setSaving(true); clearMsg()
    try {
      let finalAvatar = avatarUrl
      if (avatarFile) finalAvatar = await uploadAvatar(avatarFile)

      const { error: upErr } = await supabase.from('profiles').update({
        full_name:  fullName.trim(),
        bio:        bio.trim(),
        location:   location.trim(),
        phone:      phone.trim(),
        avatar_url: finalAvatar,
      }).eq('id', user.id)
      if (upErr) throw new Error(upErr.message)

      await supabase.auth.updateUser({ data: { full_name: fullName.trim(), avatar_url: finalAvatar } })
      if (avatarFile) { setAvatarUrl(finalAvatar); setAvatarFile(null) }
      setSuccess('Profile saved successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ───────────────────────────────────────────
  const handleChangePassword = async () => {
    if (isPasswordUser && !currentPw) { setError('Enter your current password.'); return }
    if (!newPw)                        { setError('Enter a new password.'); return }
    if (newPw.length < 8)              { setError('Password must be at least 8 characters.'); return }
    if (newPw !== confirmPw)           { setError('Passwords do not match.'); return }
    if (isPasswordUser && currentPw === newPw) { setError('New password must differ from current.'); return }
    setSaving(true); clearMsg()
    try {
      if (isPasswordUser && user?.email) {
        const { error: reAuthErr } = await supabase.auth.signInWithPassword({
          email: user.email, password: currentPw,
        })
        if (reAuthErr) { setError('Current password is incorrect.'); setSaving(false); return }
      }
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPw })
      if (pwErr) throw new Error(pwErr.message)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setSuccess('Password updated successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  // ── Change email ──────────────────────────────────────────────
  const handleEmailChange = async () => {
    if (!newEmail.trim())              { setError('Enter a new email address.'); return }
    if (!newEmail.includes('@'))       { setError('Enter a valid email address.'); return }
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError('That is already your current email.'); return
    }
    setSaving(true); clearMsg()
    try {
      const { error: emailErr } = await supabase.auth.updateUser({
        email: newEmail.trim().toLowerCase(),
      })
      if (emailErr) throw new Error(emailErr.message)
      setNewEmail('')
      setSuccess('Confirmation sent — check your new inbox and click the link to complete the change.')
    } catch (err: any) {
      setError(err.message || 'Failed to update email.')
    } finally {
      setSaving(false)
    }
  }

  // ── Portfolio file picker ─────────────────────────────────────
  const handlePortfolioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPendingFiles(p => [...p, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPendingPreviews(p => [...p, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // ── Save designer profile ─────────────────────────────────────
  const handleSaveDesigner = async () => {
    setSaving(true); clearMsg()
    try {
      const newUrls: string[] = []
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i]
        const ext  = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('portfolio-uploads')
          .upload(path, file, { upsert: true })
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`)
        const { data: { publicUrl } } = supabase.storage.from('portfolio-uploads').getPublicUrl(path)
        newUrls.push(publicUrl)
      }

      const allUrls = [...portfolioUrls, ...newUrls]

      const { error: upErr } = await supabase.from('designers').update({
        tagline:        tagline.trim(),
        price_min:      priceMin ? parseInt(priceMin, 10) : null,
        portfolio_urls: allUrls,
        public_visible: available,
      }).eq('id', user.id)
      if (upErr) throw new Error(upErr.message)

      // Also update tagline in profiles
      await supabase.from('profiles').update({ tagline: tagline.trim() }).eq('id', user.id)

      setPortfolioUrls(allUrls)
      setPendingFiles([]); setPendingPreviews([])
      setSuccess('Designer profile saved.')
    } catch (err: any) {
      setError(err.message || 'Failed to save designer profile.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete account ────────────────────────────────────────────
  const expectedName = (user?.user_metadata?.full_name || user?.email || '').split(' ')[0]

  const handleDeleteAccount = async () => {
    if (confirmName.trim().toLowerCase() !== expectedName.toLowerCase()) {
      setError(`Type "${expectedName}" exactly to confirm.`); return
    }
    setDeleting(true); clearMsg()
    try {
      await deleteAccount(confirmName)
    } catch (err: any) {
      setError(err.message || 'Deletion failed. Contact support.')
      setDeleting(false)
    }
  }

  // ── Section tab icons ────────────────────────────────────────
  const PersonIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
  const LockIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
  const BrushIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1.02 3.5 1.02 2.2 0 3.5-1.55 3.5-3.04 0-1.66-1.37-3.02-2-3.02z"/>
    </svg>
  )
  const AlertTriangleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )

  // ── Section tabs ──────────────────────────────────────────────
  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',  label: 'Profile Info', icon: <PersonIcon /> },
    { key: 'security', label: 'Security',     icon: <LockIcon /> },
    ...(isDesigner ? [{ key: 'designer' as Section, label: 'Designer', icon: <BrushIcon /> }] : []),
    { key: 'danger',   label: 'Danger Zone',  icon: <AlertTriangleIcon /> },
  ]

  const SaveBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick} disabled={saving}
      style={{
        background: saving ? 'rgba(201,168,76,0.45)' : S.gold,
        border: 'none', borderRadius: 8, padding: '14px 24px',
        fontFamily: S.headline, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontWeight: 700, color: '#131313',
        cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
      }}
    >{saving ? 'Saving…' : label}</button>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 290, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 300,
        width: 'min(560px, 100vw)', background: S.bg,
        borderLeft: `1px solid ${S.borderFaint}`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.35)',
        animation: 'ps_in 0.22s ease',
      }}>
        <style>{`@keyframes ps_in { from { transform: translateX(32px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes ps_spin { to { transform: rotate(360deg); } }`}</style>

        {/* Header */}
        <div style={{ padding: '24px 24px 0', borderBottom: `1px solid ${S.borderFaint}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ width: 24, height: 2, background: S.gold, marginBottom: 10 }} />
              <h2 style={{ margin: '0 0 4px', fontFamily: S.headline, fontWeight: 300, fontSize: 22, color: S.text }}>
                Profile Settings
              </h2>
              <p style={{ margin: 0, fontFamily: S.body, fontSize: 12, color: S.textFaint }}>{user?.email}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.textFaint, fontSize: 24, cursor: 'pointer', padding: '4px 8px', lineHeight: 1, marginTop: -4 }}>×</button>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {sections.map(s => (
              <button key={s.key} onClick={() => { setActive(s.key); clearMsg() }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 16px', fontFamily: S.body, fontSize: 12,
                color: active === s.key
                  ? (s.key === 'danger' ? '#ef4444' : S.gold)
                  : (s.key === 'danger' ? 'rgba(239,68,68,0.55)' : S.textMuted),
                borderBottom: `2px solid ${active === s.key
                  ? (s.key === 'danger' ? '#ef4444' : S.gold)
                  : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(201,168,76,0.15)', borderTopColor: S.gold, animation: 'ps_spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error   && <Banner type="error">{error}</Banner>}
              {success && <Banner type="success">{success}</Banner>}

              {/* ── PROFILE INFO ──────────────────────────────────── */}
              {active === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Avatar */}
                  <div>
                    <p style={{ margin: '0 0 12px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textFaint }}>Profile Photo</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                        background: S.surfaceHigh, border: `1px solid ${S.borderFaint}`,
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(avatarPreview || avatarUrl)
                          ? <img src={avatarPreview || avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={S.gold} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                      </div>
                      <div>
                        <button
                          onClick={() => avatarRef.current?.click()}
                          style={{
                            background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted,
                            padding: '9px 16px', borderRadius: 8, fontFamily: S.body,
                            fontSize: 12, cursor: 'pointer', display: 'block', marginBottom: 6,
                          }}
                        >
                          {avatarFile ? '✓ Image selected' : 'Upload Photo'}
                        </button>
                        <p style={{ margin: 0, fontFamily: S.body, fontSize: 11, color: S.textFaint }}>JPG, PNG, WebP — max 5 MB</p>
                      </div>
                      <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </div>
                  </div>

                  <FocusField label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
                  <FocusField label="Phone / WhatsApp" value={phone} onChange={setPhone} placeholder="+233 XX XXX XXXX" />

                  <div>
                    <p style={{ margin: '0 0 7px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textFaint }}>Bio</p>
                    <textarea
                      value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Tell others about yourself…" rows={4}
                      style={{
                        display: 'block', width: '100%', boxSizing: 'border-box',
                        background: S.surfaceHigh, border: `1px solid ${S.borderFaint}`,
                        borderRadius: 8, color: S.text, fontFamily: S.body,
                        fontSize: 14, padding: '13px 16px', outline: 'none',
                        resize: 'vertical', lineHeight: 1.6,
                      }}
                      onFocus={(e: any) => e.target.style.borderColor = S.gold}
                      onBlur={(e: any)  => e.target.style.borderColor = S.borderFaint}
                    />
                  </div>

                  <FocusField label="Location" value={location} onChange={setLocation} placeholder="e.g. Accra, Ghana" />

                  <SaveBtn onClick={handleSaveProfile} label="Save Profile →" />
                </div>
              )}

              {/* ── SECURITY ─────────────────────────────────────── */}
              {active === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontFamily: S.headline, fontWeight: 600, fontSize: 14, color: S.text }}>Change Password</p>
                    <p style={{ margin: '0 0 4px', fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.6 }}>
                      {isPasswordUser ? 'Enter your current password to set a new one.' : 'You signed in with Google. Set a password to also enable email login.'}
                    </p>
                  </div>

                  {isPasswordUser && (
                    <FocusField label="Current Password" value={currentPw} onChange={setCurrentPw} type={showPw ? 'text' : 'password'} placeholder="Your current password" />
                  )}
                  <FocusField label="New Password" value={newPw} onChange={setNewPw} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" />
                  <FocusField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} type={showPw ? 'text' : 'password'} placeholder="Repeat new password" />

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: '#c9a84c' }} />
                    <span style={{ fontFamily: S.body, fontSize: 12, color: S.textMuted }}>Show passwords</span>
                  </label>

                  <SaveBtn onClick={handleChangePassword} label="Update Password →" />

                  {/* ── Email change ──────────────────────────────── */}
                  <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontFamily: S.headline, fontWeight: 600, fontSize: 14, color: S.text }}>Email Address</p>
                      <p style={{ margin: '0 0 10px', fontFamily: S.body, fontSize: 13, color: S.textMuted }}>Current: <strong style={{ color: S.text }}>{user?.email}</strong></p>
                    </div>
                    <FocusField label="New Email Address" value={newEmail} onChange={setNewEmail} type="email" placeholder="Enter new email" />
                    <SaveBtn onClick={handleEmailChange} label="Update Email →" />
                    <p style={{ margin: 0, fontFamily: S.body, fontSize: 11, color: S.textFaint, lineHeight: 1.6 }}>
                      A confirmation link will be sent to your new address. Your email won't change until you click it.
                    </p>
                  </div>
                </div>
              )}

              {/* ── DESIGNER PROFILE ─────────────────────────────── */}
              {active === 'designer' && isDesigner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Availability toggle */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 16, borderRadius: 8,
                    background: available ? 'rgba(74,154,74,0.06)' : S.surfaceHigh,
                    border: `1px solid ${available ? 'rgba(74,154,74,0.2)' : S.borderFaint}`,
                  }}>
                    <div>
                      <p style={{ margin: '0 0 3px', fontFamily: S.headline, fontSize: 13, fontWeight: 600, color: S.text }}>
                        {available ? '● Available for work' : '○ Currently unavailable'}
                      </p>
                      <p style={{ margin: 0, fontFamily: S.body, fontSize: 11, color: S.textMuted }}>
                        {available ? 'Visible to clients in the marketplace' : 'Hidden from new hire requests'}
                      </p>
                    </div>
                    <div
                      onClick={() => setAvailable(v => !v)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                        background: available ? S.success : S.surfaceHighest,
                        cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: available ? 22 : 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </div>
                  </div>

                  <FocusField label="Tagline / Specialty" value={tagline} onChange={setTagline} placeholder="e.g. Brand identity & visual storytelling" />

                  {/* Pricing */}
                  <div>
                    <p style={{ margin: '0 0 7px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textFaint }}>Starting Price (GH₵)</p>
                    <input
                      type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                      placeholder="e.g. 500"
                      style={{
                        width: '100%', boxSizing: 'border-box', background: S.surfaceHigh,
                        border: `1px solid ${S.borderFaint}`, borderRadius: 8,
                        color: S.text, fontFamily: S.body, fontSize: 14,
                        padding: '13px 16px', outline: 'none',
                      }}
                      onFocus={(e: any) => e.target.style.borderColor = S.gold}
                      onBlur={(e: any)  => e.target.style.borderColor = S.borderFaint}
                    />
                  </div>

                  {/* Portfolio images */}
                  <div>
                    <p style={{ margin: '0 0 10px', fontFamily: S.headline, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textFaint }}>Portfolio Images</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 10 }}>
                      {portfolioUrls.map((url, i) => (
                        <div key={url + i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: S.surfaceHigh }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => setPortfolioUrls(p => p.filter((_, j) => j !== i))}
                            style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          >×</button>
                        </div>
                      ))}
                      {pendingPreviews.map((src, i) => (
                        <div key={'pending-' + i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: S.surfaceHigh, opacity: 0.7 }}>
                          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => { setPendingPreviews(p => p.filter((_, j) => j !== i)); setPendingFiles(p => p.filter((_, j) => j !== i)) }}
                            style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          >×</button>
                          <div style={{ position: 'absolute', bottom: 3, left: 3, background: S.gold, color: '#131313', fontSize: 8, padding: '2px 4px', borderRadius: 3, fontFamily: S.headline, letterSpacing: '0.05em' }}>NEW</div>
                        </div>
                      ))}
                      <button
                        onClick={() => portfolioRef.current?.click()}
                        style={{
                          aspectRatio: '1', borderRadius: 8, border: `2px dashed ${S.borderFaint}`,
                          background: 'none', color: S.textFaint, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', gap: 3, fontSize: 20,
                        }}
                      >
                        +<span style={{ fontSize: 9, fontFamily: S.body, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Add</span>
                      </button>
                    </div>
                    <input ref={portfolioRef} type="file" accept="image/*" multiple onChange={handlePortfolioFiles} style={{ display: 'none' }} />
                    <p style={{ margin: 0, fontFamily: S.body, fontSize: 11, color: S.textFaint }}>Showcase your best work. Images upload on save.</p>
                  </div>

                  <SaveBtn onClick={handleSaveDesigner} label="Save Designer Profile →" />
                </div>
              )}

              {/* ── DANGER ZONE ──────────────────────────────────── */}
              {active === 'danger' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8 }}>
                    <p style={{ margin: '0 0 5px', fontFamily: S.headline, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>⚠ Danger Zone</p>
                    <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.6 }}>
                      Actions here are permanent and cannot be undone.
                    </p>
                  </div>

                  {!showConfirm ? (
                    <div style={{ border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: 20 }}>
                      <p style={{ margin: '0 0 4px', fontFamily: S.headline, fontSize: 14, fontWeight: 600, color: S.text }}>Delete Account</p>
                      <p style={{ margin: '0 0 16px', fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.6 }}>
                        Permanently remove your account and all data. Cannot be undone.
                      </p>
                      <button
                        onClick={() => { setShowConfirm(true); clearMsg() }}
                        style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)',
                          color: '#ef4444', padding: '10px 20px', borderRadius: 8,
                          fontFamily: S.headline, fontSize: 10, letterSpacing: '0.14em',
                          textTransform: 'uppercase', cursor: 'pointer',
                        }}
                      >
                        Delete My Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ border: '1px solid rgba(239,68,68,0.32)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <p style={{ margin: 0, fontFamily: S.headline, fontSize: 14, fontWeight: 600, color: '#ef4444' }}>Confirm Account Deletion</p>
                      <p style={{ margin: 0, fontFamily: S.body, fontSize: 13, color: S.textMuted, lineHeight: 1.6 }}>
                        Type <strong style={{ color: S.text }}>{expectedName}</strong> to confirm. All your data, orders, and messages will be permanently erased.
                      </p>
                      <input
                        value={confirmName}
                        onChange={e => setConfirmName(e.target.value)}
                        placeholder={`Type "${expectedName}" to confirm`}
                        style={{
                          background: S.surfaceHigh, border: '1px solid rgba(239,68,68,0.28)',
                          borderRadius: 8, color: S.text, fontFamily: S.body,
                          fontSize: 14, padding: '12px 14px', outline: 'none',
                          width: '100%', boxSizing: 'border-box',
                        }}
                        onFocus={(e: any) => e.target.style.borderColor = '#ef4444'}
                        onBlur={(e: any)  => e.target.style.borderColor = 'rgba(239,68,68,0.28)'}
                      />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => { setShowConfirm(false); setConfirmName(''); clearMsg() }}
                          style={{ flex: 1, background: 'none', border: `1px solid ${S.borderFaint}`, color: S.textMuted, padding: '12px', borderRadius: 8, fontFamily: S.body, fontSize: 13, cursor: 'pointer' }}
                        >Cancel</button>
                        <button
                          onClick={handleDeleteAccount} disabled={deleting}
                          style={{
                            flex: 1, background: deleting ? 'rgba(239,68,68,0.3)' : '#ef4444',
                            border: 'none', color: '#fff', padding: '12px', borderRadius: 8,
                            fontFamily: S.headline, fontSize: 10, letterSpacing: '0.14em',
                            textTransform: 'uppercase', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
                          }}
                        >{deleting ? 'Deleting…' : 'Delete Forever'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
