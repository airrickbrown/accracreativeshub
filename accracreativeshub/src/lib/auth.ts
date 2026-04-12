// ── src/lib/auth.ts ──
// After signup: calls /api/send-welcome-email to send branded welcome email.
// This runs server-side via Vercel function so the API key is never exposed.

// @ts-ignore
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
  if (error) console.warn('Profile upsert:', error.message)
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

  // Duplicate account check
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // Create profile row
  await upsertProfile(data.user.id, fullName, role, email)

  // Create designer row if applying as designer
  if (role === 'designer') {
    await supabase
      .from('designers')
      .upsert(
        [{ id: data.user.id, badge: 'under_review', verified: false, public_visible: false }],
        { onConflict: 'id' }
      )
  }

  // Send branded welcome email via API route
  await sendWelcomeEmail(email, fullName, role)

  return data.user
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