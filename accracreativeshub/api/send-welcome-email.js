import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, fullName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await resend.emails.send({
      from: "Accra Creatives Hub <noreply@auth.accracativeshub.com>",
      to: email,
      subject: "Welcome to Accra Creatives Hub",
      reply_to: "support@accracreativeshub.com",
      html: `
        <div style="margin:0;padding:0;background:#0a0a0d;font-family:Arial,sans-serif;color:#f5f1e8;">
          <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
            <div style="background:#111115;border:1px solid rgba(212,175,55,0.18);border-radius:14px;overflow:hidden;">
              
              <div style="padding:18px 28px;border-bottom:1px solid rgba(212,175,55,0.12);background:#0d0d10;">
                <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;font-weight:700;">
                  Accra Creatives Hub
                </div>
              </div>

              <div style="padding:42px 28px 36px;">
                <div style="font-size:46px;line-height:1.02;font-weight:300;color:#f5f1e8;margin:0 0 18px;">
                  Welcome to<br/>
                  <span style="font-style:italic;color:#c9a84c;">the Hub.</span>
                </div>

                <div style="width:44px;height:2px;background:#c9a84c;margin:0 0 24px;"></div>

                <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#f1ede4;">
                  Hi ${fullName || "there"},
                </p>

                <p style="margin:0 0 24px;font-size:15px;line-height:1.85;color:#cfc8bb;">
                  Your account has been created successfully on Accra Creatives Hub. 
                  You are now part of a curated platform built for discovering and 
                  working with exceptional Ghanaian creatives.
                </p>

                <a href="https://www.accracreativeshub.com"
                   style="display:inline-block;padding:14px 24px;background:#c9a84c;color:#111115;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;border-radius:8px;">
                  Explore the Platform
                </a>

                <div style="margin-top:34px;padding-top:22px;border-top:1px solid rgba(212,175,55,0.12);">
                  <p style="margin:0;font-size:13px;line-height:1.8;color:#8f887b;">
                    Curated design. Trusted talent. Built for exceptional creative work.
                  </p>
                </div>
              </div>
            </div>

            <div style="text-align:center;padding:18px 8px 0;color:#7d776c;font-size:12px;line-height:1.7;">
              Accra Creatives Hub · Ghanaian creative excellence, digitally curated
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}