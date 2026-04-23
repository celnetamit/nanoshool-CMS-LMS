import { query, queryOne } from '@/lib/db'

interface Coupon {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  uses_count: number
  expires_at: Date | null
  active: boolean
}

// ─── Validate a coupon ─────────────────────────────────────
export async function validateCoupon(
  code: string
): Promise<{ valid: true; coupon: Coupon } | { valid: false; reason: string }> {
  const coupon = await queryOne<Coupon>(
    'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)',
    [code]
  )

  if (!coupon) return { valid: false, reason: 'Coupon not found.' }
  if (!coupon.active) return { valid: false, reason: 'Coupon is no longer active.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, reason: 'Coupon has expired.' }
  }
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, reason: 'Coupon usage limit reached.' }
  }

  return { valid: true, coupon }
}

// ─── Apply discount to amount ─────────────────────────────
export function applyDiscount(originalAmount: number, coupon: Coupon): number {
  if (coupon.discount_type === 'percent') {
    const discount = Math.round((originalAmount * coupon.discount_value) / 100)
    return Math.max(0, originalAmount - discount)
  }
  return Math.max(0, originalAmount - coupon.discount_value)
}

// ─── Record coupon usage ──────────────────────────────────
export async function useCoupon(couponId: string): Promise<void> {
  await query(
    'UPDATE coupons SET uses_count = uses_count + 1 WHERE id = $1',
    [couponId]
  )
}
