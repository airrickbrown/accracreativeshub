// ── src/lib/auth.ts ──
// After signup: calls /api/send-welcome-email to send branded welcome email.
// This runs server-side via Vercel function so the API key is never exposed.

import { supabase } from './supabase'

export const upsertProfile = async (
  userId: string,
  fullName: string,
  role: string,
  email: string
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id: userId, full_name: fullName, role, email }], { onConflict: 'id' })
  if (error) throw new Error(`Could not save your profile: ${error.message}`)
}

// ── Send welcome email via Vercel API route ──────────────────
async function sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
  try {
    const res = await fetch('/api/send-welcome-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, role }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.warn('Welcome email failed:', err)
    }
  } catch (e) {
    // Non-fatal — don't block signup if email fails
    console.warn('Welcome email error (non-fatal):', e)
  }
}

// ── Main signup function ─────────────────────────────────────
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
}): Promise<{ user: any; designerWarning?: string }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) {
    // Map Supabase error codes to clean user-facing messages
    const msg = error.message || ''
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      throw new Error('An account with this email already exists. Please log in instead.')
    }
    if (msg.toLowerCase().includes('over_email_send_rate_limit') || msg.toLowerCase().includes('email rate')) {
      throw new Error('Email verification is temporarily unavailable due to rate limits. Please wait a few minutes and try again.')
    }
    if (msg.toLowerCase().includes('weak_password') || (msg.toLowerCase().includes('password') && msg.toLowerCase().includes('least'))) {
      throw new Error('Your password is too weak. Use at least 8 characters with a mix of letters and numbers.')
    }
    // Pass through any other Supabase error as-is — it's always more useful than a generic fallback
    throw new Error(msg || 'Signup failed. Please try again.')
  }

  if (!data.user) throw new Error('Signup failed — no user returned. Please try again.')

  // Duplicate account: Supabase returns a user with empty identities for existing emails
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // Create profile row — throws if this fails (surfaces real DB/RLS errors)
  await upsertProfile(data.user.id, fullName, role, email)

  // Mark this email as pending verification so AuthContext can detect the callback reliably.
  // localStorage persists across tabs/windows so it works even if the email client
  // opens the verification link in a new tab.
  try { localStorage.setItem('ach_verifying', email.toLowerCase()) } catch { /* ignore */ }

  // Create designer row if applying as designer
  let designerWarning: string | undefined
  if (role === 'designer') {
    const { error: dErr } = await supabase
      .from('designers')
      .upsert(
        [{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }],
        { onConflict: 'id' }
      )
    if (dErr) {
      // Don't throw — auth + profile succeeded, so the account exists.
      // Surface a warning so the user knows to contact support if needed.
      console.error('Designer record creation failed:', dErr.message)
      designerWarning = `Your account was created, but we had trouble setting up your designer profile (${dErr.message}). Please verify your email, then contact support if issues persist.`
    }
  }

  // Send branded welcome email via API route (non-fatal)
  await sendWelcomeEmail(email, fullName, role)

  return { user: data.user, designerWarning }
}

export const handleGoogleUser = async (user: any): Promise<string> => {
  if (!user) return 'client'
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const role     = user.user_metadata?.role || 'client'
  const { data: existing } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
  if (existing) return existing.role
  await upsertProfile(user.id, fullName, role, user.email)
  return role
}