import { query, queryOne } from '@/lib/db'
import { redis } from '@/lib/redis'
import type { DBEnrollment, DBPayment, AccessStatus, PaymentStatus } from '@/types'

// ─── Create or get existing enrollment (idempotent) ────────
export async function createEnrollment({
  userId,
  productId,
  paymentId,
  razorpayPaymentId,
}: {
  userId: string
  productId: string
  paymentId: string
  razorpayPaymentId: string
}): Promise<DBEnrollment> {
  // Check if enrollment already exists (idempotency)
  const existing = await queryOne<DBEnrollment>(
    'SELECT * FROM enrollments WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  )

  if (existing) {
    // If already active, just return it
    if (existing.access_status === 'active') return existing

    // Update to active
    const [updated] = await query<DBEnrollment>(
      `UPDATE enrollments
       SET payment_status = 'paid', access_status = 'active',
           payment_id = $1, razorpay_payment_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [paymentId, razorpayPaymentId, existing.id]
    )
    return updated
  }

  // Create new enrollment
  const [enrollment] = await query<DBEnrollment>(
    `INSERT INTO enrollments
       (user_id, product_id, payment_id, payment_status, access_status, razorpay_payment_id)
     VALUES ($1, $2, $3, 'paid', 'active', $4)
     RETURNING *`,
    [userId, productId, paymentId, razorpayPaymentId]
  )

  // Invalidate user enrollments cache
  await redis.del(`enrollments:user:${userId}`)

  return enrollment
}

// ─── Revoke enrollment access (refund) ─────────────────────
export async function revokeAccess(enrollmentId: string): Promise<void> {
  const [enrollment] = await query<DBEnrollment>(
    `UPDATE enrollments
     SET access_status = 'revoked', payment_status = 'refunded', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [enrollmentId]
  )
  if (enrollment) {
    await redis.del(`enrollments:user:${enrollment.user_id}`)
  }
}

// ─── Mark enrollment as completed ──────────────────────────
export async function markCompleted(userId: string, productId: string): Promise<void> {
  await query(
    `UPDATE enrollments
     SET access_status = 'completed', updated_at = NOW()
     WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  )
  await redis.del(`enrollments:user:${userId}`)
}

// ─── Mark Moodle sync done ──────────────────────────────────
export async function markMoodleEnrolled(enrollmentId: string): Promise<void> {
  await query(
    'UPDATE enrollments SET moodle_enrollment_status = TRUE, updated_at = NOW() WHERE id = $1',
    [enrollmentId]
  )
}

// ─── Check if user has active access to a product ──────────
export async function checkAccess(userId: string, productId: string): Promise<boolean> {
  const enrollment = await queryOne<{ access_status: AccessStatus }>(
    `SELECT access_status FROM enrollments
     WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  )
  return enrollment?.access_status === 'active' || enrollment?.access_status === 'completed'
}

// ─── Get all enrollments for a user (with cache) ───────────
export async function getUserEnrollments(userId: string): Promise<DBEnrollment[]> {
  const cacheKey = `enrollments:user:${userId}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const enrollments = await query<DBEnrollment>(
    `SELECT e.*, p.title AS product_title, p.slug AS product_slug,
            p.type AS product_type, d.slug AS domain_slug
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     JOIN domains d ON d.id = p.domain_id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC`,
    [userId]
  )

  await redis.set(cacheKey, JSON.stringify(enrollments), 'EX', 300)
  return enrollments
}

// ─── Update payment status ─────────────────────────────────
export async function updatePaymentStatus(
  razorpayPaymentId: string,
  status: PaymentStatus
): Promise<void> {
  await query(
    'UPDATE payments SET status = $1, updated_at = NOW() WHERE razorpay_payment_id = $2',
    [status, razorpayPaymentId]
  )
}
