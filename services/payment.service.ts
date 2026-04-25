import Razorpay from 'razorpay'
import { query, queryOne } from '@/lib/db'
import type { DBPayment } from '@/types'

export type UserPayment = DBPayment & {
  product_id?: string | null
  product_title?: string | null
  product_slug?: string | null
  product_type?: string | null
  domain_slug?: string | null
}

// Lazy-init: avoid constructor throwing during Next.js build when env vars aren't set
let _razorpay: Razorpay | null = null
function getRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('[Payments] Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
  }

  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  }
  return _razorpay
}

// ─── Create Razorpay Order + DB Payment record ─────────────
export async function createPaymentOrder({
  userId,
  productId,
  amount,        // in paise (INR × 100)
  currency = 'INR',
  notes = {},
}: {
  userId: string
  productId: string
  amount: number
  currency?: string
  notes?: Record<string, string>
}): Promise<{ orderId: string; amount: number; currency: string; keyId: string; paymentId: string }> {
  // Create Razorpay order
  const order = await getRazorpay().orders.create({
    amount,
    currency,
    notes: { userId, productId, ...notes },
  })

  // Store payment record in DB
  const [payment] = await query<DBPayment>(
    `INSERT INTO payments (user_id, amount, currency, razorpay_order_id, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id`,
    [userId, amount / 100, currency, order.id]
  )

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID || '',
    paymentId: payment.id,
  }
}

// ─── Create zero-amount payment record (free enrollments) ─
export async function createFreePayment({
  userId,
  amount = 0,
  currency = 'INR',
}: {
  userId: string
  amount?: number
  currency?: string
}): Promise<DBPayment> {
  const [payment] = await query<DBPayment>(
    `INSERT INTO payments (user_id, amount, currency, status)
     VALUES ($1, $2, $3, 'paid')
     RETURNING *`,
    [userId, amount, currency]
  )

  return payment
}

// ─── Check idempotency — has this payment been processed? ──
export async function isPaymentProcessed(razorpayPaymentId: string): Promise<boolean> {
  const payment = await queryOne<{ status: string }>(
    `SELECT status FROM payments WHERE razorpay_payment_id = $1`,
    [razorpayPaymentId]
  )
  return payment?.status === 'paid'
}

// ─── Update payment record to paid ─────────────────────────
export async function confirmPayment({
  razorpayOrderId,
  razorpayPaymentId,
}: {
  razorpayOrderId: string
  razorpayPaymentId: string
}): Promise<DBPayment | null> {
  const [payment] = await query<DBPayment>(
    `UPDATE payments
     SET razorpay_payment_id = $1, status = 'paid', updated_at = NOW()
     WHERE razorpay_order_id = $2
     RETURNING *`,
    [razorpayPaymentId, razorpayOrderId]
  )
  return payment ?? null
}

// ─── Mark payment as failed ────────────────────────────────
export async function markPaymentFailed(razorpayOrderId: string): Promise<void> {
  await query(
    `UPDATE payments SET status = 'failed', updated_at = NOW()
     WHERE razorpay_order_id = $1`,
    [razorpayOrderId]
  )
}

// ─── Initiate Razorpay refund ──────────────────────────────
export async function initiateRefund({
  razorpayPaymentId,
  amount,
  notes = {},
}: {
  razorpayPaymentId: string
  amount?: number
  notes?: Record<string, string>
}): Promise<{ refundId: string }> {
  const refund = await getRazorpay().payments.refund(razorpayPaymentId, {
    amount,
    notes,
  })
  return { refundId: refund.id }
}

// ─── Mark payment as refunded in DB ───────────────────────
export async function markPaymentRefunded(razorpayPaymentId: string): Promise<void> {
  await query(
    `UPDATE payments SET status = 'refunded', updated_at = NOW()
     WHERE razorpay_payment_id = $1`,
    [razorpayPaymentId]
  )
}

export async function getUserPayments(userId: string): Promise<UserPayment[]> {
  return query<UserPayment>(
    `SELECT pay.*, prod.id AS product_id, prod.title AS product_title, prod.slug AS product_slug,
            prod.type AS product_type, d.slug AS domain_slug
     FROM payments pay
     LEFT JOIN enrollments e ON e.payment_id = pay.id
     LEFT JOIN products prod ON prod.id = e.product_id
     LEFT JOIN domains d ON d.id = prod.domain_id
     WHERE pay.user_id = $1
     ORDER BY pay.created_at DESC`,
    [userId]
  )
}
