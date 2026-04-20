// api/delete-account.js — Vercel serverless function
// Permanently deletes a user account and anonymizes their data.
// Requires env vars: VITE_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js')

const FROM    = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const ALLOWED = [
  'https://accracreativeshub.com',
  'https://www.accracreativeshub.com',
]

function wrap(body) {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
    <p style="margin:0 0 8px;color:#c9a84c;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;">The Sovereign Gallery</p>
    <h1 style="color:#c9a84c;font-family:Georgia,'Times New Roman',serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">ACCRA CREATIVES HUB</h1>
  </td></tr>
  <tr><td style="padding:36px 40px;">${body}</td></tr>
  <tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
    <p style="color:#444;font-size:11px;margin:0 0 4px;">© ${year} Accra Creatives Hub · Accra, Ghana</p>
    <p style="margin:0;">
      <a href="https://www.accracreativeshub.com" style="color:#c9a84c;font-size:11px;text-decoration:none;">accracreativeshub.com</a>
      &nbsp;·&nbsp;
      <a href="https://www.accracreativeshub.com/terms" style="color:#555;font-size:11px;text-decoration:none;">Terms</a>
      &nbsp;·&nbsp;
      <a href="https://www.accracreativeshub.com/privacy" style="color:#555;font-size:11px;text-decoration:none;">Privacy</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function deletionEmailHtml(name) {
  const firstName = (name || '').split(' ')[0] || 'there'
  return wrap(`
    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;line-height:1.2;">
      Your account has been deleted.
    </h2>
    <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
      Hi ${firstName} — this email confirms that your Accra Creatives Hub account has been permanently deleted.
      Your profile and personal data have been removed from our platform.
    </p>
    <div style="background:#0d0d0d;border-left:3px solid rgba(220,85,85,0.6);padding:16px 20px;margin:20px 0;">
      <p style="color:#aaa;font-size:13px;margin:0 0 10px;font-weight:600;color:#f5f5f5;">What was removed:</p>
      <p style="color:#aaa;font-size:12px;margin:0 0 6px;line-height:1.7;">✓ Your account credentials and login access</p>
      <p style="color:#aaa;font-size:12px;margin:0 0 6px;line-height:1.7;">✓ Your profile and personal information</p>
      <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">✓ Your designer portfolio data (if applicable)</p>
    </div>
    <p style="color:#666;font-size:12px;margin:20px 0 0;line-height:1.8;">
      Active orders and transaction history may be retained for legal and business record-keeping purposes.
      If you believe this deletion was made in error, contact us at
      <a href="mailto:support@accracreativeshub.com" style="color:#c9a84c;">support@accracreativeshub.com</a>
    </p>
  `)
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || ''
  const corsOrigin = ALLOWED.includes(origin) ? origin : ALLOWED[1]
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  // Require a valid Bearer token
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice(7)

  const supabaseUrl    = process.env.VITE_SUPABASE_URL    || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verify the JWT and resolve the requesting user
  const { data: { user }, error: authErr } = await admin.auth.getUser(token)
  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const userId    = user.id
  const userEmail = user.email
  const { name }  = req.body || {}

  try {
    // 1. Anonymize profile PII so it isn't retained after cascade
    await admin
      .from('profiles')
      .update({ full_name: '[Deleted User]', bio: null, tagline: null, location: null, avatar_url: null })
      .eq('id', userId)

    // 2. Remove designer from public marketplace immediately
    await admin
      .from('designers')
      .update({ public_visible: false })
      .eq('id', userId)

    // 3. Delete the Supabase auth user — cascades to profiles + related rows per FK constraints
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)
    if (deleteErr) throw deleteErr

    // 4. Confirmation email (fire-and-forget — never block on email failure)
    const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY
    if (resendKey && userEmail) {
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          from:    FROM,
          to:      userEmail,
          subject: 'Your Accra Creatives Hub account has been deleted',
          html:    deletionEmailHtml(name),
        }),
      }).catch(err => console.error('Deletion confirmation email failed:', err))
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Delete account error:', err)
    return res.status(500).json({ error: err.message || 'Failed to delete account. Please contact support.' })
  }
}
