// ── src/lib/auth.ts ──

// @ts-ignore
import { supabase } from './supabase'

const FROM_EMAIL = 'noreply@auth.accracreativeshub.com'

// ───────────────────────────────────────
// Resend config
// ───────────────────────────────────────
const getResendKey = (): string => import.meta.env.VITE_RESEND_API_KEY || ''

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const key = getResendKey()
  if (!key) {
    console.warn('VITE_RESEND_API_KEY not set')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Accra Creatives Hub <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      console.warn('Resend error:', await res.text())
    }
  } catch (e) {
    console.warn('Email send failed (non-fatal):', e)
  }
}

const REDIRECT_URL = `${window.location.origin}/auth/callback`

// ───────────────────────────────────────
// EMAIL SIGNUP
// ───────────────────────────────────────
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
      data: {
        full_name: fullName,
        role,
      },
      emailRedirectTo: REDIRECT_URL,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Signup failed. Please try again.')

  // Prevent duplicate accounts
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // Create profile
  await supabase.from('profiles').upsert(
    [
      {
        id: data.user.id,
        full_name: fullName,
        role,
        email,
      },
    ],
    { onConflict: 'id' }
  )

  // If designer → create designer row
  if (role === 'designer') {
    await supabase.from('designers').upsert(
      [
        {
          id: data.user.id,
          badge: 'under_review',
          verified: false,
          public_visible: false,
        },
      ],
      { onConflict: 'id' }
    )
  }

  // Send branded email
  await sendEmail(
    email,
    role === 'designer'
      ? 'Your designer application — Accra Creatives Hub'
      : 'Welcome to Accra Creatives Hub — Please verify your email',
    role === 'designer' ? designerEmail(fullName) : clientEmail(fullName)
  )

  return data.user
}

// ───────────────────────────────────────
// EMAIL LOGIN
// ───────────────────────────────────────
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

// ───────────────────────────────────────
// GOOGLE LOGIN / SIGNUP
// ───────────────────────────────────────
export const signInWithGoogle = async (role: 'client' | 'designer' = 'client') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
      data: {
        role,
      },
    },
  })

  if (error) throw error
  return data
}

// ───────────────────────────────────────
// GOOGLE USER HANDLER
// ───────────────────────────────────────
export const handleGoogleUser = async (user: any): Promise<void> => {
  if (!user) return

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  const role = user.user_metadata?.role || 'client'

  // Check profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  // Create profile if not exists
  if (!existingProfile) {
    await supabase.from('profiles').upsert(
      [
        {
          id: user.id,
          full_name: fullName,
          role,
          email: user.email,
        },
      ],
      { onConflict: 'id' }
    )
  }

  // If designer → ensure designer row exists
  if (role === 'designer') {
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingDesigner) {
      await supabase.from('designers').upsert(
        [
          {
            id: user.id,
            badge: 'under_review',
            verified: false,
            public_visible: false,
          },
        ],
        { onConflict: 'id' }
      )
    }
  }

  // Send welcome email only once
  if (!existingProfile) {
    await sendEmail(
      user.email,
      role === 'designer'
        ? 'Your designer application — Accra Creatives Hub'
        : 'Welcome to Accra Creatives Hub',
      role === 'designer' ? designerEmail(fullName) : clientEmail(fullName)
    )
  }
}

// ───────────────────────────────────────
// EMAIL TEMPLATES
// ───────────────────────────────────────
const emailWrapper = (content: string): string => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background:#0a0a0a;color:#fff;font-family:Arial;">
  <div style="max-width:560px;margin:auto;background:#131313;padding:30px;border:1px solid rgba(201,168,76,0.2);">
    ${content}
  </div>
</body>
</html>
`

export const clientEmail = (name: string): string =>
  emailWrapper(`
    <h2 style="color:#c9a84c;">Welcome ${name}</h2>
    <p>Verify your email to start using Accra Creatives Hub.</p>
  `)

export const designerEmail = (name: string): string =>
  emailWrapper(`
    <h2 style="color:#c9a84c;">Hi ${name}</h2>
    <p>Your application has been received and is under review.</p>
  `)