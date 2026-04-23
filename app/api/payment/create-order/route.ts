import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { createPaymentOrder, createFreePayment } from '@/services/payment.service'
import { validateCoupon, applyDiscount, useCoupon } from '@/services/coupon.service'
import { createEnrollment, markMoodleEnrolled } from '@/services/enrollment.service'
import { createInvoice, generateInvoicePdf, linkInvoiceToEnrollment, updateInvoicePdf } from '@/services/invoice.service'
import { syncUserEnrollment } from '@/services/moodle.service'
import { sendEnrollmentConfirmation } from '@/services/email.service'
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
  const product = await queryOne<{
    id: string
    title: string
    price: number
    sale_price: number | null
    status: string
    moodle_course_id: string | null
  }>(
    'SELECT id, title, price, sale_price, status, moodle_course_id FROM products WHERE id = $1',
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
    // Avoid duplicate records if user is already actively enrolled
    const existingEnrollment = await queryOne<{ id: string; access_status: string }>(
      'SELECT id, access_status FROM enrollments WHERE user_id = $1 AND product_id = $2',
      [session.user.id, productId]
    )

    if (existingEnrollment?.access_status === 'active' || existingEnrollment?.access_status === 'completed') {
      return NextResponse.json({
        free: true,
        productId,
        enrolled: true,
        alreadyEnrolled: true,
        redirect: '/dashboard/participant/enrollments',
      })
    }

    const freePayment = await createFreePayment({
      userId: session.user.id,
      amount: 0,
      currency: 'INR',
    })

    const enrollment = await createEnrollment({
      userId: session.user.id,
      productId,
      paymentId: freePayment.id,
      paymentStatus: 'paid',
    })

    if (couponId) {
      await useCoupon(couponId)
    }

    const invoice = await createInvoice({
      userId: session.user.id,
      paymentId: freePayment.id,
      amount: 0,
    })
    await linkInvoiceToEnrollment(enrollment.id, invoice.id)

    generateInvoicePdf({
      invoiceId: invoice.id,
      userName: session.user.name ?? 'Learner',
      userEmail: session.user.email ?? 'learner@nstc.in',
      productTitle: product.title,
      amount: 0,
      currency: 'INR',
      razorpayPaymentId: 'FREE-ENROLLMENT',
      issuedAt: new Date(),
    }).then(async () => {
      const pdfUrl = `/invoices/${invoice.id}.pdf` // placeholder until storage upload is wired
      await updateInvoicePdf(invoice.id, pdfUrl)
    }).catch((error) => {
      console.error('[Free Enrollment] Invoice generation failed:', error)
    })

    if (product.moodle_course_id && session.user.email) {
      syncUserEnrollment({
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name ?? 'Learner',
        moodleCourseId: product.moodle_course_id,
      }).then(async () => {
        await markMoodleEnrolled(enrollment.id)
      }).catch((error) => {
        console.error('[Free Enrollment] Moodle sync failed:', error)
      })
    }

    if (session.user.email) {
      sendEnrollmentConfirmation({
        to: session.user.email,
        userName: session.user.name ?? 'Learner',
        productTitle: product.title,
      }).catch((error) => {
        console.error('[Free Enrollment] Confirmation email failed:', error)
      })
    }

    return NextResponse.json({
      free: true,
      productId,
      enrolled: true,
      enrollmentId: enrollment.id,
      redirect: '/dashboard/participant/enrollments',
    })
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
