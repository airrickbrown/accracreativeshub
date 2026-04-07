// ── src/lib/auth.ts ──

// @ts-ignore
import { supabase } from './supabase'

const FROM = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'

// @ts-ignore
const getKey = (): string => import.meta.env.VITE_RESEND_API_KEY || ''

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const key = getKey()
  if (!key) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) console.warn('Resend error:', await res.text())
  } catch (e) {
    console.warn('Email send failed (non-fatal):', e)
  }
}

export const upsertProfile = async (
  userId: string,
  fullName: string,
  role: string,
  email: string
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id: userId, full_name: fullName, role, email }], { onConflict: 'id' })
  if (error) console.warn('Profile upsert:', error.message)
}

export const signUpUser = async ({
  email,
  password,
  fullName,
  role,
}: {
  email: string
  password: string
  fullName: string
  role: 'client' | 'designer'
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Signup failed. Please try again.')

  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  await upsertProfile(data.user.id, fullName, role, email)

  if (role === 'designer') {
    await supabase
      .from('designers')
      .upsert(
        [{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }],
        { onConflict: 'id' }
      )
  }

  const year = new Date().getFullYear()
  const isDesigner = role === 'designer'

  await sendEmail(
    email,
    isDesigner
      ? 'Your designer application — verify your email'
      : 'Welcome to Accra Creatives Hub — verify your email',
    isDesigner ? designerEmailHtml(fullName, year) : clientEmailHtml(fullName, year)
  )

  return data.user
}

export const handleGoogleUser = async (user: any): Promise<string> => {
  if (!user) return 'client'

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const role     = user.user_metadata?.role || 'client'

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (existing) return existing.role

  await upsertProfile(user.id, fullName, role, user.email)
  return role
}

// ── Email templates ──

const wrap = (body: string, year: number) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
<tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
</td></tr>
<tr><td style="padding:36px 40px;">${body}</td></tr>
<tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
  <p style="color:#444;font-size:11px;margin:0;">© ${year} Accra Creatives Hub · <a href="https://accracreativeshub.com" style="color:#c9a84c;text-decoration:none;">accracreativeshub.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`

const clientEmailHtml = (name: string, year: number) => wrap(`
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">
    Welcome, <em style="color:#c9a84c;">${name}.</em>
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">
    Check your inbox for a verification email and click the link to activate your account.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:16px 0;">
    <p style="color:#aaa;font-size:12px;margin:0;">
      📬 Can't find it? Check your <strong style="color:#f5f5f5;">spam / junk</strong> folder.
    </p>
  </div>
`, year)

const designerEmailHtml = (name: string, year: number) => wrap(`
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;">
    Hi <em style="color:#c9a84c;">${name}</em>, your application is in.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">
    Verify your email first, then complete your designer application.
  </p>
  <div style="background:#0d0d0d;border:1px solid rgba(201,168,76,0.15);padding:18px;margin:16px 0;">
    <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;"><strong style="color:#f5f5f5;">1.</strong> Verify your email (check inbox + spam)</p>
    <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;"><strong style="color:#f5f5f5;">2.</strong> Complete your designer application</p>
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;"><strong style="color:#f5f5f5;">3.</strong> Editorial board reviews within 3–5 days</p>
  </div>
`, year)