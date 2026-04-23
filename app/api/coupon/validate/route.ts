import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon, applyDiscount } from '@/services/coupon.service'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  originalAmount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { code, originalAmount } = parsed.data
  const result = await validateCoupon(code)

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason })
  }

  const discountedAmount = applyDiscount(originalAmount, result.coupon)
  const discount = originalAmount - discountedAmount

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    discountType: result.coupon.discount_type,
    discountValue: result.coupon.discount_value,
    discount,
    finalAmount: discountedAmount,
  })
}
