import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { createPaymentOrder } from '@/services/payment.service'
import { validateCoupon, applyDiscount } from '@/services/coupon.service'
import { z } from 'zod'

const schema = z.object({
  productId: z.string().uuid(),
  couponCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // ─── Auth ───────────────────────────────────────
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ─── Validate body ──────────────────────────────
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { productId, couponCode } = parsed.data

  // ─── Get product ────────────────────────────────
  const product = await queryOne<{ id: string; title: string; price: number; sale_price: number | null; status: string }>(
    'SELECT id, title, price, sale_price, status FROM products WHERE id = $1',
    [productId]
  )

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (product.status !== 'published') {
    return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
  }

  // ─── Calculate amount ───────────────────────────
  let baseAmount = Number(product.sale_price ?? product.price)
  let couponApplied: { code: string; discount: number } | undefined
  let couponId: string | undefined

  // Apply coupon if provided
  if (couponCode) {
    const result = await validateCoupon(couponCode)
    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 })
    }
    const discountedAmount = applyDiscount(baseAmount, result.coupon)
    couponApplied = {
      code: result.coupon.code,
      discount: baseAmount - discountedAmount,
    }
    couponId = result.coupon.id
    baseAmount = discountedAmount
  }

  // Handle free products
  if (baseAmount === 0) {
    // TODO: For free products, create enrollment directly without payment
    return NextResponse.json({ free: true, productId })
  }

  // ─── Create Razorpay order ──────────────────────
  const order = await createPaymentOrder({
    userId: session.user.id,
    productId,
    amount: Math.round(baseAmount * 100), // paise
    notes: {
      userId: session.user.id,
      productId,
      productTitle: product.title,
      ...(couponId ? { couponId } : {}),
    },
  })

  return NextResponse.json({
    ...order,
    productTitle: product.title,
    finalAmount: baseAmount,
    couponApplied,
  })
}
