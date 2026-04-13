// ── api/notify-dispute-response.js ──
// Vercel serverless function.
// Called when a new message arrives on a disputed order (via Supabase realtime).
// Notifies the disputes inbox so the admin team knows the client has responded.

const FROM          = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const DISPUTES_INBOX = 'disputes@accracreativeshub.com'

function wrap(body, year) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#131313;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
    <p style="margin:0 0 8px;color:#c9a84c;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;">Disputes · Admin Notification</p>
    <h1 style="color:#c9a84c;font-family:Georgia,'Times New Roman',serif;font-weight:400;margin:0;font-size:20px;letter-spacing:0.05em;">
      ACCRA CREATIVES HUB
    </h1>
  </td></tr>
  <tr><td style="padding:36px 40px;">${body}</td></tr>
  <tr><td style="background:#0d0d0d;padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
    <p style="color:#444;font-size:11px;margin:0;">
      © ${year} Accra Creatives Hub · This is an automated admin notification.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  'https://accracreativeshub.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientName, orderTitle, orderId } = req.body || {}

  if (!clientName || !orderTitle) {
    return res.status(400).json({ error: 'Missing required fields: clientName, orderTitle' })
  }

  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND API key')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const year = new Date().getFullYear()
  const html = wrap(`
    <div style="background:rgba(22,163,74,0.08);border-left:3px solid #4ade80;padding:12px 16px;margin:0 0 20px;border-radius:0 6px 6px 0;">
      <p style="color:#4ade80;font-size:11px;font-weight:700;margin:0 0 4px;letter-spacing:0.12em;text-transform:uppercase;">New Evidence Response Received</p>
      <p style="color:#aaa;font-size:12px;margin:0;">${new Date().toUTCString()}</p>
    </div>

    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:18px;margin:0 0 16px;">
      ${clientName} has responded to the evidence request
    </h2>

    <div style="background:#0d0d0d;border:1px solid rgba(201,168,76,0.15);border-radius:6px;padding:16px 20px;margin:0 0 20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;font-size:12px;padding:4px 0;width:100px;">Client</td><td style="color:#f5f5f5;font-size:12px;">${clientName}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Order</td><td style="color:#f5f5f5;font-size:12px;">${orderTitle}</td></tr>
        ${orderId ? `<tr><td style="color:#888;font-size:12px;padding:4px 0;">Order ID</td><td style="color:#f5f5f5;font-size:12px;">#${orderId}</td></tr>` : ''}
      </table>
    </div>

    <p style="color:#aaa;font-size:13px;line-height:1.8;margin:0;">
      Log in to the admin panel and open the order chat to review the client's submitted evidence
      before making a final dispute decision.
    </p>
  `, year)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM,
        to:      DISPUTES_INBOX,
        subject: `[Dispute Response] ${clientName} replied — ${orderTitle}`,
        html,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Resend error:', detail)
      return res.status(500).json({ error: 'Failed to send notification', details: detail })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('notify-dispute-response error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
