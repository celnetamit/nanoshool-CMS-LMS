import { query, queryOne } from '@/lib/db'
import { redis } from '@/lib/redis'
import type { DBEnrollment, AccessStatus, PaymentStatus } from '@/types'

export type EnrollmentWithProduct = DBEnrollment & {
  product_title: string
  product_slug: string
  product_type: string
  domain_slug: string
}

// ─── Create or get existing enrollment (idempotent) ────────
export async function createEnrollment({
  userId,
  productId,
  paymentId,
  razorpayPaymentId,
  paymentStatus = 'paid',
}: {
  userId: string
  productId: string
  paymentId?: string | null
  razorpayPaymentId?: string | null
  paymentStatus?: PaymentStatus
}): Promise<DBEnrollment> {
  // Check if enrollment already exists (idempotency)
  const existing = await queryOne<DBEnrollment>(
    'SELECT * FROM enrollments WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  )

  if (existing) {
    // Replays or duplicate purchase attempts should not downgrade completed access.
    if (existing.access_status === 'active' || existing.access_status === 'completed') return existing

    // Update to active
    const [updated] = await query<DBEnrollment>(
      `UPDATE enrollments
       SET payment_status = $1, access_status = 'active',
           payment_id = $2, razorpay_payment_id = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [paymentStatus, paymentId ?? null, razorpayPaymentId ?? null, existing.id]
    )
    await redis.del(`enrollments:user:${userId}`)
    return updated
  }

  // Create new enrollment
  const [enrollment] = await query<DBEnrollment>(
    `INSERT INTO enrollments
       (user_id, product_id, payment_id, payment_status, access_status, razorpay_payment_id)
     VALUES ($1, $2, $3, $4, 'active', $5)
     RETURNING *`,
    [userId, productId, paymentId ?? null, paymentStatus, razorpayPaymentId ?? null]
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
export async function getUserEnrollments(userId: string): Promise<EnrollmentWithProduct[]> {
  const cacheKey = `enrollments:user:${userId}`

  // Try Redis cache — gracefully skip if Redis is unavailable
  try {
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch { /* Redis unavailable — fall through to DB */ }

  const enrollments = await query<EnrollmentWithProduct>(
    `SELECT e.*, p.title AS product_title, p.slug AS product_slug,
            p.type AS product_type, d.slug AS domain_slug
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     JOIN domains d ON d.id = p.domain_id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC`,
    [userId]
  )

  // Try to write to cache — skip if Redis is unavailable
  try {
    await redis.set(cacheKey, JSON.stringify(enrollments), 'EX', 300)
  } catch { /* Redis unavailable */ }

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
