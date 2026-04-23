import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { initiateRefund } from '@/services/payment.service'
import { z } from 'zod'

const schema = z.object({ enrollmentId: z.string().uuid() })

export async function POST(req: NextRequest) {
  // Admin only
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { enrollmentId } = parsed.data

  // Get enrollment with payment details
  const enrollment = await queryOne<{
    id: string; user_id: string; product_id: string;
    payment_status: string; razorpay_payment_id: string;
  }>(
    'SELECT id, user_id, product_id, payment_status, razorpay_payment_id FROM enrollments WHERE id = $1',
    [enrollmentId]
  )

  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  if (enrollment.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Enrollment is not in paid state' }, { status: 400 })
  }

  if (!enrollment.razorpay_payment_id) {
    return NextResponse.json({ error: 'No payment ID found for this enrollment' }, { status: 400 })
  }

  // Initiate refund via Razorpay
  // Webhook (refund.created) will handle DB updates and email
  const { refundId } = await initiateRefund({
    razorpayPaymentId: enrollment.razorpay_payment_id,
    notes: { enrollmentId, reason: 'Admin initiated refund' },
  })

  return NextResponse.json({ success: true, refundId })
}
