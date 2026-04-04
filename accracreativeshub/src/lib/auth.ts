// ── src/lib/auth.ts ──

// @ts-ignore
import { supabase } from './supabase'

const FROM = 'noreply@auth.accracreativeshub.com'

// @ts-ignore
const KEY = (): string => import.meta.env.VITE_RESEND_API_KEY || ''

const REDIRECT_URL = `${window.location.origin}/auth/callback`

const mail = async (to: string, subject: string, html: string) => {
  const k = KEY()
  if (!k) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${k}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Accra Creatives Hub <${FROM}>`,
        to,
        subject,
        html,
      }),
    })
  } catch (e) {
    console.warn('Email failed (non-fatal):', e)
  }
}

// ── Upsert profile row ──
export const upsertProfile = async (
  userId: string,
  fullName: string,
  role: string,
  email: string
) => {
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id: userId, full_name: fullName, role, email }], { onConflict: 'id' })

  if (error) console.warn('Profile upsert:', error.message)
}

// ── Email + password signup ──
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
      emailRedirectTo: REDIRECT_URL,
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

  await mail(
    email,
    role === 'designer'
      ? 'Your Accra Creatives Hub application — verify your email'
      : 'Welcome to Accra Creatives Hub — verify your email',
    role === 'designer' ? designerMail(fullName) : clientMail(fullName)
  )

  return data.user
}

// ── Email + password login ──
export const signInUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// ── Google OAuth login / signup ──
export const signInWithGoogle = async (role: 'client' | 'designer' = 'client') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
      data: { role },
    },
  })

  if (error) throw error
  return data
}

// ── Handle Google user on first login ──
export const handleGoogleUser = async (user: any) => {
  if (!user) return

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  const role = user.user_metadata?.role || 'client'

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!existing) {
    await upsertProfile(user.id, fullName, role, user.email)

    if (role === 'designer') {
      await supabase
        .from('designers')
        .upsert(
          [{ id: user.id, badge: 'under_review', verified: false, public_visible: false }],
          { onConflict: 'id' }
        )
    }

    await mail(
      user.email,
      role === 'designer'
        ? 'Your Accra Creatives Hub application — verify your email'
        : 'Welcome to Accra Creatives Hub',
      role === 'designer' ? designerMail(fullName) : clientMail(fullName)
    )
  }

  return existing?.role || role
}

// ── Email templates ──
const wrap = (body: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">
          <tr>
            <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
              <p style="color:#c9a84c;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;font-family:Arial;">The Sovereign Gallery</p>
              <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:22px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">${body}</td>
          </tr>
          <tr>
            <td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
              <p style="color:#444;font-size:11px;margin:0;">
                ©️ ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana &nbsp;·&nbsp;
                <a href="https://accracreativeshub.com" style="color:#c9a84c;text-decoration:none;">accracreativeshub.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const clientMail = (name: string) => wrap(`
  <p style="color:#c9a84c;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 14px;">Welcome</p>
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 18px;line-height:1.3;">
    Welcome, <em style="color:#c9a84c;">${name}.</em>
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
    You're one step away. Check your inbox for the verification email from Supabase and click the link to activate your account.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:14px 18px;margin:20px 0;border-radius:0 4px 4px 0;">
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">
      📬 Can't find it? Check your <strong style="color:#f5f5f5;">spam / junk</strong> folder.
    </p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr>
      <td align="center">
        <a href="https://accracreativeshub.com" style="display:inline-block;background:#c9a84c;color:#131313;font-family:Arial;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:15px 36px;">
          BROWSE DESIGNERS →
        </a>
      </td>
    </tr>
  </table>
`)

const designerMail = (name: string) => wrap(`
  <p style="color:#c9a84c;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 14px;">Application Received</p>
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 18px;line-height:1.3;">
    Hi <em style="color:#c9a84c;">${name}</em>, your application is in.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
    First, verify your email — check your inbox for the Supabase verification link.
  </p>
  <div style="background:#0d0d0d;border:1px solid rgba(201,168,76,0.15);padding:20px;margin:20px 0;">
    <p style="color:#c9a84c;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 12px;">What happens next</p>
    <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;"><strong style="color:#f5f5f5;">1.</strong> Verify your email (check inbox + spam)</p>
    <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;"><strong style="color:#f5f5f5;">2.</strong> Complete your designer application</p>
    <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;"><strong style="color:#f5f5f5;">3.</strong> Editorial board reviews within 3–5 days</p>
  </div>
  <p style="color:#555;font-size:12px;margin:0;">
    Questions?
    <a href="mailto:designers@accracreativeshub.com" style="color:#c9a84c;">designers@accracreativeshub.com</a>
  </p>
`)