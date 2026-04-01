// ── auth.ts ── Signup logic
import { supabase } from './supabase'

type SignUpUserParams = {
  email: string
  password: string
  fullName: string
  role: 'client' | 'designer'
}

export const signUpUser = async ({
  email,
  password,
  fullName,
  role,
}: SignUpUserParams) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (error) throw error

  const user = data.user
  if (!user) throw new Error('Signup failed. No user returned.')

  // Supabase may return an existing unconfirmed user instead of throwing
  if (user.identities && user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // 2. If designer, create or update designer row
  if (role === 'designer') {
    const { error: designerError } = await supabase
      .from('designers')
      .upsert(
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

    if (designerError) throw designerError
  }

  // 3. Upsert profile row as a fallback
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      [
        {
          id: user.id,
          full_name: fullName,
          role,
          email,
        },
      ],
      { onConflict: 'id' }
    )

  if (profileError) {
    console.warn('Profile upsert warning (non-fatal):', profileError.message)
  }

  // 4. Send welcome email (non-fatal if it fails)
  try {
    await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName }),
    })
  } catch (emailError) {
    console.error('Welcome email failed (non-fatal):', emailError)
  }

  return user
}