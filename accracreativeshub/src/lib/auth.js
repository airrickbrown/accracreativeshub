// signup logic (core)
import { supabase } from './supabase'

export const signUpUser = async ({ email, password, fullName, role }) => {
  // 1. Create auth user and store profile data in metadata
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

  if (!user) {
    throw new Error('Signup failed. No user returned.')
  }

  // 2. If designer, create designer row
  if (role === 'designer') {
    const { error: designerError } = await supabase
      .from('designers')
      .insert([
        {
          id: user.id,
          badge: 'under_review',
          verified: false,
          public_visible: false,
        },
      ])

    if (designerError) throw designerError
  }

  // 3. Send welcome email
  try {
    await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fullName }),
    })
  } catch (emailError) {
    console.error('Welcome email failed:', emailError)
  }

  return user
}