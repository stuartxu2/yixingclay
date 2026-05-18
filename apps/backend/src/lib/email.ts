import { Resend } from "resend"

// Until yixingclay.com is verified on Resend, fall back to Resend's shared
// sender. In production set RESEND_FROM="PO/ET Studio <orders@yixingclay.com>".
const FROM = process.env.RESEND_FROM || "PO/ET Studio <onboarding@resend.dev>"

/** Format a minor-unit (cents) amount as a display price. */
export function formatMoney(amount: number, currency = "usd"): string {
  return `$${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
}

/** Wrap email body content in the shared, branded PO/ET shell. */
export function renderEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#fcfaf2;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1e1915;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:500;letter-spacing:0.16em;color:#fcfaf2;">
                PO/ET
              </p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:0.08em;color:#9b8e85;">
                YIXING CLAY STUDIO
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">${bodyHtml}</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e8e3d8;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0a49b;">
                Questions? Reply to this email or write to
                <a href="mailto:studio@yixingclay.com" style="color:#c47a52;">studio@yixingclay.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#c8bfb8;">
                © ${new Date().getFullYear()} PO/ET — Yixing Clay Studio · yixingclay.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Send an email through Resend. Never throws — a missing API key or a Resend
 * error is logged and returns false, so a notification failure never breaks
 * the order/fulfillment workflow that triggered it.
 */
export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
  tag?: string
}): Promise<boolean> {
  const tag = opts.tag ?? "email"
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[${tag}] RESEND_API_KEY not set — skipping email`)
    return false
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
  })

  if (error) {
    console.error(`[${tag}] Resend error:`, error)
    return false
  }
  return true
}
