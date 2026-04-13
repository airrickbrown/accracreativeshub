// ── api/send-evidence-request.js ──
// Vercel serverless function.
// Called by the admin panel when "Request Evidence" is clicked on a dispute.
// Sends an email to the client and a copy to the disputes inbox.

const FROM          = 'Accra Creatives Hub <noreply@auth.accracreativeshub.com>'
const DISPUTES_INBOX = 'disputes@accracreativeshub.com'

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

function clientEmailHtml({ clientName, orderTitle, orderAmount, orderId }, year) {
  const firstName = clientName.split(' ')[0]
  return wrap(`
    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px;line-height:1.3;">
      Action Required — <em style="color:#c9a84c;">Please submit evidence</em>
    </h2>

    <p style="color:#999;font-size:14px;line-height:1.9;margin:0 0 20px;">
      Hi ${firstName}, our disputes team has reviewed your case and needs you to submit supporting
      evidence before we can make a final decision.
    </p>

    <div style="background:#0d0d0d;border-left:3px solid #c9a84c;padding:16px 20px;margin:0 0 20px;">
      <p style="color:#888;font-size:11px;margin:0 0 6px;letter-spacing:0.15em;text-transform:uppercase;">Order in Dispute</p>
      <p style="color:#f5f5f5;font-size:15px;font-weight:600;margin:0 0 4px;">${orderTitle}</p>
      <p style="color:#c9a84c;font-size:13px;margin:0;">Amount: ${orderAmount}</p>
    </div>

    <p style="color:#aaa;font-size:13px;line-height:1.8;margin:0 0 8px;">
      <strong style="color:#f5f5f5;">What to submit:</strong>
    </p>
    <ul style="color:#aaa;font-size:13px;line-height:2;margin:0 0 20px;padding-left:20px;">
      <li>Screenshots of the original brief and agreed deliverables</li>
      <li>Any messages or files exchanged with the designer</li>
      <li>A written explanation of how the work did not meet requirements</li>
    </ul>

    <p style="color:#aaa;font-size:13px;line-height:1.8;margin:0 0 24px;">
      Log in to your account, open the order chat, and send your evidence directly via the message thread.
      Our team will review within <strong style="color:#f5f5f5;">48 hours</strong>.
    </p>

    ${ctaButton('Go to My Order →', `https://accracreativeshub.com`)}

    <p style="color:#666;font-size:12px;margin:0;line-height:1.7;">
      Questions? Reply to this email or contact us at
      <a href="mailto:disputes@accracreativeshub.com" style="color:#c9a84c;">disputes@accracreativeshub.com</a>
    </p>
  `, year)
}

function adminCopyHtml({ clientName, clientEmail, orderTitle, orderAmount, orderId }, year) {
  return wrap(`
    <h2 style="color:#f5f5f5;font-family:Georgia,serif;font-weight:400;font-size:18px;margin:0 0 16px;">
      Evidence Request Sent — <em style="color:#c9a84c;">Confirmation Copy</em>
    </h2>
    <p style="color:#aaa;font-size:13px;line-height:1.8;margin:0 0 16px;">
      An evidence request email was successfully dispatched to the client.
    </p>
    <div style="background:#0d0d0d;border:1px solid rgba(201,168,76,0.15);border-radius:6px;padding:16px 20px;margin:0 0 16px;">
      <p style="color:#888;font-size:11px;margin:0 0 10px;letter-spacing:0.15em;text-transform:uppercase;">Request Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;font-size:12px;padding:4px 0;width:120px;">Client</td><td style="color:#f5f5f5;font-size:12px;">${clientName}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Email</td><td style="color:#f5f5f5;font-size:12px;">${clientEmail}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Order</td><td style="color:#f5f5f5;font-size:12px;">${orderTitle}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Amount</td><td style="color:#c9a84c;font-size:12px;">${orderAmount}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Order ID</td><td style="color:#f5f5f5;font-size:12px;">#${orderId}</td></tr>
        <tr><td style="color:#888;font-size:12px;padding:4px 0;">Sent at</td><td style="color:#f5f5f5;font-size:12px;">${new Date().toUTCString()}</td></tr>
      </table>
    </div>
    <p style="color:#666;font-size:12px;margin:0;line-height:1.7;">
      The client has been instructed to reply via their order chat within 48 hours.
    </p>
  `, year)
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  'https://accracreativeshub.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { clientEmail, clientName, orderTitle, orderAmount, orderId } = req.body || {}

  if (!clientEmail || !clientName || !orderTitle) {
    return res.status(400).json({ error: 'Missing required fields: clientEmail, clientName, orderTitle' })
  }

  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND API key')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const year    = new Date().getFullYear()
  const payload = { clientName, clientEmail, orderTitle, orderAmount: orderAmount || '', orderId: orderId || '—' }

  try {
    // 1. Email to client
    const clientRes = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM,
        to:      clientEmail,
        subject: 'Action Required — Please submit evidence for your dispute',
        html:    clientEmailHtml(payload, year),
      }),
    })

    if (!clientRes.ok) {
      const detail = await clientRes.text()
      console.error('Resend client email error:', detail)
      return res.status(500).json({ error: 'Failed to send client email', details: detail })
    }

    // 2. Copy to disputes inbox (non-blocking — fire and forget)
    fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM,
        to:      DISPUTES_INBOX,
        subject: `[Evidence Request Sent] ${orderTitle} — ${clientName}`,
        html:    adminCopyHtml(payload, year),
      }),
    }).catch(err => console.error('Admin copy email error (non-fatal):', err))

    return res.status(200).json({ success: true, clientEmail, orderTitle })

  } catch (err) {
    console.error('send-evidence-request error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
