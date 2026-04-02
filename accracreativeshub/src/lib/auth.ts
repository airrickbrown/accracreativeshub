// ── auth.ts ──
// Place at: src/lib/auth.ts

import { supabase } from './supabase'

// ── Email + Password Signup ──
export const signUpUser = async ({
  email,
  password,
  fullName,
  role,
}: {
  email:    string
  password: string
  fullName: string
  role:     'client' | 'designer'
}) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      // ── This tells Supabase where to redirect after email verification ──
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Signup failed. Please try again.')

  // ── Detect duplicate email ──
  // Supabase returns existing user with empty identities instead of erroring
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // 2. Upsert profile row (safe even if trigger already created it)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([{ id: data.user.id, full_name: fullName, role, email }], { onConflict: 'id' })

  if (profileError) {
    console.warn('Profile upsert (non-fatal):', profileError.message)
  }

  // 3. If designer → upsert designer row
  if (role === 'designer') {
    const { error: designerError } = await supabase
      .from('designers')
      .upsert(
        [{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }],
        { onConflict: 'id' }
      )
    if (designerError) {
      console.warn('Designer row upsert (non-fatal):', designerError.message)
    }
  }

  // 4. Send welcome email via Resend (non-fatal if not configured yet)
  try {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY
    if (apiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Accra Creatives Hub <noreply@accracreativeshub.com>',
          to:   email,
          subject: role === 'designer'
            ? 'Your designer application is received — Accra Creatives Hub'
            : 'Welcome to Accra Creatives Hub',
          html: role === 'designer' ? designerWelcomeEmail(fullName) : clientWelcomeEmail(fullName),
        }),
      })
    }
  } catch (emailErr) {
    console.warn('Welcome email failed (non-fatal):', emailErr)
  }

  return data.user
}

// ── Handle Google OAuth user (call this after OAuth redirect) ──
// This ensures Google users also get a profile row and welcome email
export const handleGoogleUser = async (user: any) => {
  if (!user) return

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const role     = user.user_metadata?.role || 'client'

  // Upsert profile
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id: user.id, full_name: fullName, role, email: user.email }], { onConflict: 'id' })

  if (error) console.warn('Google user profile upsert:', error.message)

  // Send welcome email once (check if this is first login)
  try {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY
    const isFirstLogin = user.created_at && (new Date().getTime() - new Date(user.created_at).getTime()) < 60000

    if (apiKey && isFirstLogin) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'Accra Creatives Hub <noreply@accracreativeshub.com>',
          to:      user.email,
          subject: 'Welcome to Accra Creatives Hub',
          html:    clientWelcomeEmail(fullName),
        }),
      })
    }
  } catch (err) {
    console.warn('Google welcome email failed:', err)
  }
}

// ── Email templates ──
const clientWelcomeEmail = (name: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#131313;padding:32px;text-align:center;">
    <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:28px;">Accra Creatives Hub</h1>
    <p style="color:#888;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:8px 0 0;">Ghana's Premier Design Marketplace</p>
  </div>
  <div style="background:#fff;padding:40px;">
    <p style="font-size:16px;color:#333;margin:0 0 16px;">Welcome, ${name}! 🎉</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px;">
      You now have access to Ghana's most curated network of verified graphic designers.
      Find your perfect creative partner and bring your vision to life.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://accracreativeshub.com" style="background:#c9a84c;color:#1a1a1a;padding:14px 36px;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:14px;letter-spacing:0.1em;display:inline-block;">
        FIND A DESIGNER →
      </a>
    </div>
    <p style="font-size:13px;color:#777;">All payments are secured by escrow. You only pay when you're satisfied.</p>
  </div>
  <div style="background:#131313;padding:20px;text-align:center;">
    <p style="color:#666;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
  </div>
</div>
`

const designerWelcomeEmail = (name: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#131313;padding:32px;text-align:center;">
    <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:28px;">Accra Creatives Hub</h1>
    <p style="color:#888;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:8px 0 0;">The Sovereign Gallery</p>
  </div>
  <div style="background:#fff;padding:40px;">
    <p style="font-size:16px;color:#333;margin:0 0 16px;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 16px;">
      Your designer application has been received. Our editorial board will review your profile within <strong>3–5 business days</strong>.
    </p>
    <div style="background:#f9f9f9;border-left:3px solid #c9a84c;padding:16px;margin:20px 0;">
      <p style="font-size:13px;color:#444;margin:0;line-height:1.7;">
        <strong>What happens next:</strong><br/>
        1. We review your portfolio and ID<br/>
        2. You receive an approval or feedback email<br/>
        3. Once approved, your profile goes live on the marketplace
      </p>
    </div>
    <p style="font-size:13px;color:#777;">Questions? Reply to this email or contact us at designers@accracreativeshub.com</p>
  </div>
  <div style="background:#131313;padding:20px;text-align:center;">
    <p style="color:#666;font-size:11px;margin:0;">© ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana</p>
  </div>
</div>
`