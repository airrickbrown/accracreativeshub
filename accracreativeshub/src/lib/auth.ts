// ── src/lib/auth.ts ──

// @ts-ignore
import { supabase } from './supabase'

const FROM_EMAIL = 'noreply@auth.accracreativeshub.com'
const RESEND_KEY = () => (import.meta as any).env?.VITE_RESEND_API_KEY || ''

// ── Send email via Resend ──
const sendEmail = async (to: string, subject: string, html: string) => {
  const key = RESEND_KEY()
  if (!key) { console.warn('VITE_RESEND_API_KEY not set'); return }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Accra Creatives Hub <${FROM_EMAIL}>`, to, subject, html }),
    })
    if (!res.ok) console.warn('Resend error:', await res.text())
  } catch (e) {
    console.warn('Resend send failed:', e)
  }
}

// ── Email/password signup ──
export const signUpUser = async ({
  email, password, fullName, role,
}: {
  email: string; password: string; fullName: string; role: 'client' | 'designer'
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      // Redirect after email verification click
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Signup failed. Please try again.')

  // Detect existing unconfirmed account (Supabase returns empty identities)
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error(
      'An account with this email already exists. Please log in or use "Forgot password".'
    )
  }

  // Upsert profile row
  await supabase
    .from('profiles')
    .upsert([{ id: data.user.id, full_name: fullName, role, email }], { onConflict: 'id' })

  // Designer row
  if (role === 'designer') {
    await supabase
      .from('designers')
      .upsert(
        [{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }],
        { onConflict: 'id' }
      )
  }

  // Welcome email
  await sendEmail(
    email,
    role === 'designer'
      ? 'Your designer application — Accra Creatives Hub'
      : 'Verify your Accra Creatives Hub account',
    role === 'designer' ? designerEmail(fullName) : clientEmail(fullName)
  )

  return data.user
}

// ── Google OAuth user — call after OAuth redirect ──
// Ensures profile row exists and sends welcome email on first login
export const handleGoogleUser = async (user: any) => {
  if (!user) return

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const role = user.user_metadata?.role || 'client'

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existing) {
    // First time — create profile and send welcome email
    await supabase
      .from('profiles')
      .upsert([{ id: user.id, full_name: fullName, role, email: user.email }], { onConflict: 'id' })

    await sendEmail(user.email, 'Welcome to Accra Creatives Hub', clientEmail(fullName))
  }
}

// ── Email templates ──
const clientEmail = (name: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#131313;padding:32px;text-align:center;">
    <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:26px;">Accra Creatives Hub</h1>
    <p style="color:#888;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:6px 0 0;">Ghana's Premier Design Marketplace</p>
  </div>
  <div style="padding:36px;">
    <p style="font-size:16px;color:#333;margin:0 0 14px;">Welcome, ${name}! 🎉</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">
      Please verify your email to activate your account and start browsing Ghana's most curated designers.
    </p>
    <p style="font-size:13px;color:#777;margin:0 0 24px;">
      <strong>Check your inbox</strong> for a separate verification email from Supabase. Click the link in that email to verify.
    </p>
    <p style="font-size:13px;color:#999;">Didn't get it? Check your <strong>spam/junk</strong> folder.</p>
  </div>
  <div style="background:#131313;padding:18px;text-align:center;">
    <p style="color:#666;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
  </div>
</div>`

const designerEmail = (name: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#131313;padding:32px;text-align:center;">
    <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:26px;">Accra Creatives Hub</h1>
    <p style="color:#888;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:6px 0 0;">The Sovereign Gallery</p>
  </div>
  <div style="padding:36px;">
    <p style="font-size:16px;color:#333;margin:0 0 14px;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 16px;">
      Your designer application has been received. Please also verify your email address — check your inbox for a verification link.
    </p>
    <div style="background:#f9f9f9;border-left:3px solid #c9a84c;padding:16px;margin:20px 0;">
      <p style="font-size:13px;color:#444;margin:0;line-height:1.7;">
        <strong>Next steps:</strong><br/>
        1. Verify your email (check inbox + spam)<br/>
        2. Our editorial board reviews your portfolio (3–5 days)<br/>
        3. You receive an approval email and go live
      </p>
    </div>
    <p style="font-size:13px;color:#777;">Questions? Email us at designers@accracreativeshub.com</p>
  </div>
  <div style="background:#131313;padding:18px;text-align:center;">
    <p style="color:#666;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
  </div>
</div>`