import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { queryOne } from '@/lib/db'
import { confirmPayment, markPaymentFailed, markPaymentRefunded } from '@/services/payment.service'
import { createEnrollment, revokeAccess, markMoodleEnrolled } from '@/services/enrollment.service'
import { createInvoice, generateInvoicePdf, updateInvoicePdf, linkInvoiceToEnrollment } from '@/services/invoice.service'
import { syncUserEnrollment } from '@/services/moodle.service'
import { sendEnrollmentConfirmation, sendPaymentFailedEmail, sendRefundEmail } from '@/services/email.service'

// ─── HMAC Signature Verification ──────────────────────────
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  // ─── Verify signature ────────────────────────────
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[Webhook] Invalid signature received')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let payload: {
    event: string
    payload: {
      payment?: { entity: { id: string; order_id: string; amount: number; email: string; notes: Record<string, string> } }
      refund?: { entity: { payment_id: string; amount: number } }
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event } = payload

  // ─── Always return 200 quickly, process async ───
  // (Razorpay retries if we don't return 200 fast enough)
  processWebhookEvent(event, payload.payload).catch((err) => {
    console.error(`[Webhook] Processing error for event ${event}:`, err)
  })

  return NextResponse.json({ received: true })
}

async function processWebhookEvent(
  event: string,
  data: {
    payment?: { entity: { id: string; order_id: string; amount: number; email: string; notes: Record<string, string> } }
    refund?: { entity: { payment_id: string; amount: number } }
  }
) {
  // ─── payment.captured ────────────────────────────
  if (event === 'payment.captured') {
    const payment = data.payment?.entity
    if (!payment) return

    const { id: razorpayPaymentId, order_id: razorpayOrderId, amount, notes } = payment
    const userId = notes?.userId
    const productId = notes?.productId

    if (!userId || !productId) {
      console.error('[Webhook] Missing userId or productId in payment notes')
      return
    }

    // ─── Idempotency check ────────────────────────
    const existingPayment = await queryOne<{ status: string }>(
      'SELECT status FROM payments WHERE razorpay_payment_id = $1',
      [razorpayPaymentId]
    )
    if (existingPayment?.status === 'paid') {
      console.log(`[Webhook] payment.captured already processed: ${razorpayPaymentId}`)
      return
    }

    // ─── Confirm payment ──────────────────────────
    const confirmedPayment = await confirmPayment({ razorpayOrderId, razorpayPaymentId })
    if (!confirmedPayment) {
      console.error(`[Webhook] Payment record not found for order: ${razorpayOrderId}`)
      return
    }

    // ─── Create enrollment ────────────────────────
    const enrollment = await createEnrollment({
      userId,
      productId,
      paymentId: confirmedPayment.id,
      razorpayPaymentId,
    })

    // ─── Generate invoice ─────────────────────────
    const user = await queryOne<{ name: string; email: string }>(
      'SELECT name, email FROM users WHERE id = $1',
      [userId]
    )
    const product = await queryOne<{ title: string; moodle_course_id: string | null }>(
      'SELECT title, moodle_course_id FROM products WHERE id = $1',
      [productId]
    )

    const invoice = await createInvoice({
      userId,
      paymentId: confirmedPayment.id,
      amount: amount / 100,
    })

    await linkInvoiceToEnrollment(enrollment.id, invoice.id)

    // ─── Generate PDF (non-blocking) ──────────────
    generateInvoicePdf({
      invoiceId: invoice.id,
      userName: user?.name ?? 'Learner',
      userEmail: user?.email ?? payment.email,
      productTitle: product?.title ?? 'NSTC Program',
      amount: amount / 100,
      currency: 'INR',
      razorpayPaymentId,
      issuedAt: new Date(),
    }).then(async (pdfBuffer) => {
      // TODO: Upload pdfBuffer to S3 and get URL
      const pdfUrl = `/invoices/${invoice.id}.pdf` // placeholder
      await updateInvoicePdf(invoice.id, pdfUrl)
    }).catch(console.error)

    // ─── Moodle sync (non-blocking, retriable) ────
    if (product?.moodle_course_id && user) {
      syncUserEnrollment({
        userId,
        userEmail: user.email,
        userName: user.name,
        moodleCourseId: product.moodle_course_id,
      }).then(async (moodleUserId) => {
        await markMoodleEnrolled(enrollment.id)
        // Store moodle user ID
        await queryOne(
          'UPDATE users SET moodle_user_id = $1 WHERE id = $2',
          [String(moodleUserId), userId]
        )
      }).catch((err) => {
        console.error('[Webhook] Moodle sync failed:', err)
        // TODO: Add to retry queue (BullMQ)
      })
    }

    // ─── Send confirmation email ──────────────────
    if (user) {
      sendEnrollmentConfirmation({
        to: user.email,
        userName: user.name,
        productTitle: product?.title ?? 'NSTC Program',
      }).catch(console.error)
    }

    console.log(`[Webhook] payment.captured processed: enrollment ${enrollment.id}`)
  }

  // ─── payment.failed ────────────────────────────
  if (event === 'payment.failed') {
    const payment = data.payment?.entity
    if (!payment) return

    await markPaymentFailed(payment.order_id)

    const user = await queryOne<{ name: string; email: string }>(
      'SELECT name, email FROM users WHERE id = $1',
      [payment.notes?.userId]
    )
    const product = await queryOne<{ title: string }>(
      'SELECT title FROM products WHERE id = $1',
      [payment.notes?.productId]
    )

    if (user && product) {
      sendPaymentFailedEmail({
        to: user.email,
        userName: user.name,
        productTitle: product.title,
      }).catch(console.error)
    }

    console.log(`[Webhook] payment.failed: order ${payment.order_id}`)
  }

  // ─── refund.created ────────────────────────────
  if (event === 'refund.created') {
    const refund = data.refund?.entity
    if (!refund) return

    const { payment_id: razorpayPaymentId, amount } = refund

    // Update payment status
    await markPaymentRefunded(razorpayPaymentId)

    // Revoke enrollment
    const enrollment = await queryOne<{ id: string; user_id: string; product_id: string }>(
      'SELECT id, user_id, product_id FROM enrollments WHERE razorpay_payment_id = $1',
      [razorpayPaymentId]
    )

    if (enrollment) {
      await revokeAccess(enrollment.id)

      // Get user and product for email
      const user = await queryOne<{ name: string; email: string }>(
        'SELECT name, email FROM users WHERE id = $1', [enrollment.user_id]
      )
      const product = await queryOne<{ title: string }>(
        'SELECT title FROM products WHERE id = $1', [enrollment.product_id]
      )

      if (user && product) {
        sendRefundEmail({
          to: user.email,
          userName: user.name,
          productTitle: product.title,
          amount: amount / 100,
          currency: 'INR',
        }).catch(console.error)
      }
    }

    console.log(`[Webhook] refund.created processed: ${razorpayPaymentId}`)
  }
}
