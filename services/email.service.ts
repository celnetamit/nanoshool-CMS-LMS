import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'noreply@nstc.in'

// ─── Enrollment Confirmation ───────────────────────────────
export async function sendEnrollmentConfirmation({
  to,
  userName,
  productTitle,
  invoicePdfUrl,
  moodleAccessUrl,
}: {
  to: string
  userName: string
  productTitle: string
  invoicePdfUrl?: string
  moodleAccessUrl?: string
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're enrolled: ${productTitle} — NSTC`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <div style="background: #6366f1; padding: 1.5rem; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">NSTC</h1>
        </div>
        <div style="background: #111113; border: 1px solid #27272a; border-top: none; padding: 2rem; border-radius: 0 0 12px 12px;">
          <h2 style="color: #fafafa; margin-bottom: 1rem;">Hi ${userName},</h2>
          <p style="color: #a1a1aa; line-height: 1.7;">
            Congratulations! You are now enrolled in <strong style="color: #fafafa;">${productTitle}</strong>.
          </p>
          ${moodleAccessUrl ? `
          <a href="${moodleAccessUrl}" style="display: inline-block; margin: 1.5rem 0; padding: 0.875rem 1.75rem; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Start Learning →
          </a>` : ''}
          ${invoicePdfUrl ? `
          <p style="color: #a1a1aa;">
            <a href="${invoicePdfUrl}" style="color: #818cf8;">Download your invoice</a>
          </p>` : ''}
          <hr style="border: none; border-top: 1px solid #27272a; margin: 1.5rem 0;" />
          <p style="color: #71717a; font-size: 0.875rem;">
            Questions? Email us at support@nstc.in
          </p>
        </div>
      </div>
    `,
  })
}

// ─── Payment Failed ────────────────────────────────────────
export async function sendPaymentFailedEmail({
  to,
  userName,
  productTitle,
}: {
  to: string
  userName: string
  productTitle: string
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment failed for ${productTitle} — NSTC`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <h2>Hi ${userName},</h2>
        <p>Your payment for <strong>${productTitle}</strong> was not successful.</p>
        <p>Please try again or contact us at support@nstc.in for assistance.</p>
      </div>
    `,
  })
}

// ─── Refund Confirmation ───────────────────────────────────
export async function sendRefundEmail({
  to,
  userName,
  productTitle,
  amount,
  currency,
}: {
  to: string
  userName: string
  productTitle: string
  amount: number
  currency: string
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Refund processed for ${productTitle} — NSTC`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <h2>Hi ${userName},</h2>
        <p>Your refund of <strong>${currency} ${amount.toLocaleString('en-IN')}</strong> for <strong>${productTitle}</strong> has been processed.</p>
        <p>It will reflect in your account within 5–7 business days.</p>
        <p>We're sorry to see you go. If you have feedback, reply to this email.</p>
      </div>
    `,
  })
}
