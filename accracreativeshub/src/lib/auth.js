// signup logic (core)
import { supabase } from './supabase'

export const signUpUser = async ({ email, password, fullName, role }) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error

  const user = data.user

  // 2. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email,
        full_name: fullName,
        role
      }
    ])

  if (profileError) throw profileError

  // 3. If designer → create designer row
  if (role === 'designer') {
    const { error: designerError } = await supabase
      .from('designers')
      .insert([
        {
          id: user.id,
          badge: 'under_review',
          verified: false,
          public_visible: false
        }
      ])

    if (designerError) throw designerError
  }

  return user
}