// ── api/send-welcome-email.js ──
// Vercel serverless function.
// Called automatically after a user verifies their email.
// Sends a branded welcome email based on role (client or designer).

const FROM = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'

// ── Shared HTML wrapper ──────────────────────────────────────
function wrap(body, year) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">

  <!-- Header -->
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
    <p style="margin:0 0 8px;color:#c9a84c;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;">The Sovereign Gallery</p>
    <h1 style="color:#c9a84c;font-family:Georgia,'Times New Roman',serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">
      ACCRA CREATIVES HUB
    </h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">${body}</td></tr>

  <!-- Footer -->
  <tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
    <p style="color:#444;font-size:11px;margin:0 0 4px;">
      © ${year} Accra Creatives Hub · Accra, Ghana
    </p>
    <p style="margin:0;">
      <a href="https://accracreativeshub.com" style="color:#c9a84c;font-size:11px;text-decoration:none;">accracreativeshub.com</a>
      &nbsp;·&nbsp;
      <a href="https://accracreativeshub.com/terms" style="color:#555;font-size:11px;text-decoration:none;">Terms</a>
      &nbsp;·&nbsp;
      <a href="https://accracreativeshub.com/privacy" style="color:#555;font-size:11px;text-decoration:none;">Privacy</a>
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}

function ctaButton(label, href) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr><td align="center">
        <a href="${href}"
           style="display:inline-block;background:#c9a84c;color:#131313;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:8px;">
          ${label}
        </a>
      </td></tr>
    </table>`
}

// ── Client welcome email ─────────────────────────────────────
function clientEmailHtml(name, year) {
  const firstName = name.split(' ')[0]
  return wrap(`
    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 16px;line-height:1.2;">
      You're in, <em style="color:#c9a84c;">${firstName}.</em>
    </h2>

    <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">
      Welcome to Accra Creatives Hub — Ghana's first curated marketplace for verified creative talent.
      You now have access to Ghana's most talented graphic designers, UI/UX designers, and motion artists.
    </p>

    <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:16px 20px;margin:20px 0;">
      <p style="color:#aaa;font-size:13px;margin:0 0 10px;font-weight:600;color:#f5f5f5;">Here's how to get started:</p>
      <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;">
        <strong style="color:#f5f5f5;">1.</strong> Browse our verified designers and find the right fit for your project.
      </p>
      <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;">
        <strong style="color:#f5f5f5;">2.</strong> Click "Hire" to build a structured brief — it takes 3 minutes.
      </p>
      <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">
        <strong style="color:#f5f5f5;">3.</strong> Your payment is held in escrow and only released when you approve the final work.
      </p>
    </div>

    ${ctaButton('Explore Designers →', 'https://accracreativeshub.com')}

    <p style="color:#666;font-size:12px;margin:0;line-height:1.7;">
      Questions? We're here at
      <a href="mailto:clients@accracreativeshub.com" style="color:#c9a84c;">clients@accracreativeshub.com</a>
    </p>
  `, year)
}

// ── Designer welcome email ───────────────────────────────────
function designerEmailHtml(name, year) {
  const firstName = name.split(' ')[0]
  return wrap(`
    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 16px;line-height:1.2;">
      Your application is in, <em style="color:#c9a84c;">${firstName}.</em>
    </h2>

    <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 16px;">
      Thank you for applying to join Accra Creatives Hub. Your account has been created and your
      application is now with our editorial board for review.
    </p>

    <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:16px 20px;margin:20px 0;">
      <p style="color:#f5f5f5;font-size:13px;margin:0 0 12px;font-weight:600;">What happens next:</p>
      <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;">
        <strong style="color:#f5f5f5;">1.</strong> Our editorial board reviews your application within <strong style="color:#f5f5f5;">3–5 business days</strong>.
      </p>
      <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;">
        <strong style="color:#f5f5f5;">2.</strong> Log in and complete your designer profile — add your portfolio, set your rates, and write your bio.
      </p>
      <p style="color:#aaa;font-size:12px;margin:0;line-height:1.7;">
        <strong style="color:#f5f5f5;">3.</strong> Once approved, your profile goes live and clients can find and hire you.
      </p>
    </div>

    <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:14px 18px;margin:16px 0;">
      <p style="color:#c9a84c;font-size:12px;margin:0;line-height:1.7;">
        💡 <strong>Tip:</strong> Designers with complete profiles (portfolio, bio, pricing) are approved faster and get more client enquiries.
      </p>
    </div>

    ${ctaButton('Complete Your Application →', 'https://accracreativeshub.com')}

    <p style="color:#666;font-size:12px;margin:0;line-height:1.7;">
      Questions about your application?
      <a href="mailto:designers@accracreativeshub.com" style="color:#c9a84c;">designers@accracreativeshub.com</a>
    </p>
  `, year)
}

// ── Main handler ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin',  'https://accracreativeshub.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name, role } = req.body || {}

  // Validate inputs
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, name, role' })
  }
  if (!['client', 'designer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be client or designer' })
  }

  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND API key')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const year    = new Date().getFullYear()
  const subject = role === 'designer'
    ? 'Your designer application is in — Accra Creatives Hub'
    : 'Welcome to Accra Creatives Hub'
  const html = role === 'designer'
    ? designerEmailHtml(name, year)
    : clientEmailHtml(name, year)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: email, subject, html }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend error:', errorText)
      return res.status(500).json({ error: 'Failed to send email', details: errorText })
    }

    return res.status(200).json({ success: true, role, email })

  } catch (err) {
    console.error('Send welcome email error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}