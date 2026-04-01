// ── auth.ts ── Signup logic
import { supabase } from './supabase'

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

  // ── FIX: Supabase returns an existing unconfirmed user instead of erroring.
  // If identities is empty, the email is already registered.
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  // 2. If designer, create designer row
  // ── FIX: Changed .insert() → .upsert() with onConflict: 'id'
  // This means if the row already exists (e.g. user retried signup),
  // it updates instead of throwing a duplicate key error.
  if (role === 'designer') {
    const { error: designerError } = await supabase
      .from('designers')
      .upsert(
        [
          {
            id:             user.id,
            badge:          'under_review',
            verified:       false,
            public_visible: false,
          },
        ],
        { onConflict: 'id' }  // ← key fix: don't crash if row exists
      )

    if (designerError) throw designerError
  }

  // 3. Also upsert the profile row to be safe
  // (in case the handle_new_user trigger didn't fire or ran twice)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      [
        {
          id:        user.id,
          full_name: fullName,
          role,
          email,
        },
      ],
      { onConflict: 'id' }
    )

  // Profile upsert failure is non-fatal — trigger may have already created it
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