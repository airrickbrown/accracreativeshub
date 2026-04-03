// ── src/lib/auth.ts ──

// @ts-ignore
import { supabase } from './supabase'

const FROM_EMAIL = 'noreply@auth.accracreativeshub.com'

// @ts-ignore
const getResendKey = (): string => import.meta.env.VITE_RESEND_API_KEY || ''

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const key = getResendKey()
  if (!key) { console.warn('VITE_RESEND_API_KEY not set'); return }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Accra Creatives Hub <${FROM_EMAIL}>`, to, subject, html }),
    })
    if (!res.ok) console.warn('Resend error:', await res.text())
  } catch (e) { console.warn('Email send failed (non-fatal):', e) }
}

export const signUpUser = async ({
  email, password, fullName, role,
}: {
  email: string; password: string; fullName: string; role: 'client' | 'designer'
}) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
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

  await supabase.from('profiles')
    .upsert([{ id: data.user.id, full_name: fullName, role, email }], { onConflict: 'id' })

  if (role === 'designer') {
    await supabase.from('designers')
      .upsert([{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }], { onConflict: 'id' })
  }

  await sendEmail(
    email,
    role === 'designer' ? 'Your designer application — Accra Creatives Hub' : 'Welcome to Accra Creatives Hub — Please verify your email',
    role === 'designer' ? designerEmail(fullName) : clientEmail(fullName)
  )

  return data.user
}

export const handleGoogleUser = async (user: any): Promise<void> => {
  if (!user) return
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const role = user.user_metadata?.role || 'client'

  const { data: existing } = await supabase
    .from('profiles').select('id').eq('id', user.id).single()

  if (!existing) {
    await supabase.from('profiles')
      .upsert([{ id: user.id, full_name: fullName, role, email: user.email }], { onConflict: 'id' })
    await sendEmail(user.email, 'Welcome to Accra Creatives Hub', clientEmail(fullName))
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── Premium branded email templates ──
// Black + gold theme, mobile-first, clean
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const emailWrapper = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Accra Creatives Hub</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#131313 0%,#1a1a1a 100%);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15);">
            <div style="display:inline-block;width:48px;height:2px;background:#c9a84c;margin-bottom:16px;"></div>
            <h1 style="color:#c9a84c;font-family:Georgia,serif;font-weight:400;margin:0;font-size:22px;letter-spacing:0.08em;">ACCRA CREATIVES HUB</h1>
            <p style="color:#666;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:8px 0 0;font-family:Arial,sans-serif;">Ghana's Premier Design Marketplace</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d0d;padding:24px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
            <p style="color:#444;font-size:11px;margin:0 0 8px;font-family:Arial,sans-serif;line-height:1.7;">
              © ${new Date().getFullYear()} Accra Creatives Hub · Accra, Ghana
            </p>
            <p style="margin:0;">
              <a href="https://accracreativeshub.com" style="color:#c9a84c;font-size:11px;font-family:Arial,sans-serif;text-decoration:none;letter-spacing:0.1em;">accracreativeshub.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

export const clientEmail = (name: string): string => emailWrapper(`
  <p style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;">Welcome</p>
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 20px;line-height:1.3;">
    Welcome to the Hub,<br/><em style="color:#c9a84c;">${name}.</em>
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;font-family:Arial,sans-serif;">
    You're one step away from connecting with Ghana's most curated network of verified graphic designers.
  </p>
  <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:16px 20px;margin:24px 0;border-radius:0 4px 4px 0;">
    <p style="color:#aaa;font-size:13px;margin:0;font-family:Arial,sans-serif;line-height:1.7;">
      📬 Please check your <strong style="color:#f5f5f5;">inbox and spam/junk folder</strong> for a separate verification email. You must verify before logging in.
    </p>
  </div>
  <p style="color:#777;font-size:13px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
    Once verified, browse verified designers, submit project briefs, and manage everything with secure escrow — built for Ghana.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://accracreativeshub.com" style="display:inline-block;background:#c9a84c;color:#131313;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:16px 40px;">
          FIND YOUR DESIGNER →
        </a>
      </td>
    </tr>
  </table>
  <p style="color:#555;font-size:11px;margin:24px 0 0;text-align:center;font-family:Arial,sans-serif;">
    All payments secured by escrow · 10% commission only · Verified designers
  </p>
`)

export const designerEmail = (name: string): string => emailWrapper(`
  <p style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;">Application Received</p>
  <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 20px;line-height:1.3;">
    Hi <em style="color:#c9a84c;">${name}</em>,<br/>your application is in.
  </h2>
  <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;font-family:Arial,sans-serif;">
    Thank you for applying to join the Sovereign Gallery. Our editorial board will review your portfolio and get back to you.
  </p>
  <div style="background:#0d0d0d;border:1px solid rgba(201,168,76,0.2);padding:24px;margin:24px 0;">
    <p style="color:#c9a84c;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 14px;font-family:Arial,sans-serif;">What Happens Next</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${[
        ['01', 'Verify your email', 'Check inbox and spam for the verification link'],
        ['02', 'Editorial review', 'Our board reviews your portfolio within 3–5 business days'],
        ['03', 'Go live', 'Once approved, your profile appears on the marketplace'],
      ].map(([n, t, d]) => `
        <tr>
          <td style="padding:8px 0;vertical-align:top;">
            <span style="color:#c9a84c;font-size:10px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.1em;">${n}</span>
          </td>
          <td style="padding:8px 0 8px 16px;vertical-align:top;">
            <p style="color:#f5f5f5;font-size:13px;margin:0 0 2px;font-family:Arial,sans-serif;font-weight:600;">${t}</p>
            <p style="color:#666;font-size:12px;margin:0;font-family:Arial,sans-serif;">${d}</p>
          </td>
        </tr>
      `).join('')}
    </table>
  </div>
  <p style="color:#666;font-size:12px;margin:0;font-family:Arial,sans-serif;line-height:1.7;">
    Questions? Reply to this email or contact <a href="mailto:designers@accracreativeshub.com" style="color:#c9a84c;">designers@accracreativeshub.com</a>
  </p>
`)