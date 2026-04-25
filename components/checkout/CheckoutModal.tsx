'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CheckoutModal.module.css'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void }
  }
}

interface RazorpayOptions {
  key: string; amount: number; currency: string; order_id: string; name: string;
  description: string; prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}

interface Props {
  productId: string
  productTitle: string
  price: number
  salePrice?: number
  onClose: () => void
  userName?: string
  userEmail?: string
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function CheckoutModal({ productId, productTitle, price, salePrice, onClose, userName, userEmail }: Props) {
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<{
    valid: boolean; discount?: number; finalAmount?: number; reason?: string
  } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseAmount = salePrice ?? price
  const finalAmount = couponResult?.valid ? (couponResult.finalAmount ?? baseAmount) : baseAmount

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, originalAmount: baseAmount }),
      })
      const data = await res.json()
      setCouponResult(data)
    } catch {
      setCouponResult({ valid: false, reason: 'Failed to validate coupon.' })
    }
    setValidatingCoupon(false)
  }

  const handlePay = async () => {
    setError('')
    setLoading(true)
    try {
      // Ask the backend for the authoritative next step before loading payment SDK.
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, couponCode: couponResult?.valid ? couponCode : undefined }),
      })

      const order = await orderRes.json()

      if (!orderRes.ok) {
        setError(order.error || 'Failed to create order.')
        setLoading(false)
        return
      }

      if (order.alreadyEnrolled && order.redirect) {
        router.push(order.redirect)
        onClose()
        return
      }

      if (order.free) {
        router.push(order.redirect || '/dashboard/participant/enrollments')
        onClose()
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Failed to load payment SDK. Please try again.')
        setLoading(false)
        return
      }

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'NSTC',
        description: productTitle,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#6366f1' },
        handler: () => {
          // DO NOT grant access here — webhook handles it
          router.push('/dashboard/participant/enrollments?status=payment-processing')
          onClose()
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      })

      rzp.open()
      setLoading(false)
    } catch {
      setError('Failed to create order.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Complete Enrollment</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Product Summary */}
        <div className={styles.productSummary}>
          <div className={styles.productIcon}>📚</div>
          <div className={styles.productInfo}>
            <h3 className={styles.productTitle}>{productTitle}</h3>
            <div className={styles.productPricing}>
              {salePrice != null && price > salePrice && (
                <span className={styles.originalPrice}>₹{price.toLocaleString('en-IN')}</span>
              )}
              <span className={styles.currentPrice}>₹{baseAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Coupon */}
        <div className={styles.couponSection}>
          <h4 className={styles.couponLabel}>Have a coupon?</h4>
          <div className={styles.couponRow}>
            <input
              className="input"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
            />
            <button
              className="btn btn-secondary"
              onClick={validateCoupon}
              disabled={validatingCoupon || !couponCode.trim()}
            >
              {validatingCoupon ? '...' : 'Apply'}
            </button>
          </div>
          {couponResult && (
            <p className={couponResult.valid ? styles.couponSuccess : styles.couponError}>
              {couponResult.valid
                ? `✓ Coupon applied! You save ₹${couponResult.discount?.toLocaleString('en-IN')}`
                : `✕ ${couponResult.reason}`}
            </p>
          )}
        </div>

        <div className={styles.divider} />

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <div className={styles.orderRow}>
            <span>Program Price</span>
            <span>₹{baseAmount.toLocaleString('en-IN')}</span>
          </div>
          {couponResult?.valid && couponResult.discount && (
            <div className={`${styles.orderRow} ${styles.discountRow}`}>
              <span>Coupon Discount</span>
              <span>- ₹{couponResult.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className={`${styles.orderRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* CTA */}
        <button
          className={`btn btn-primary ${styles.payBtn}`}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? 'Processing...' : finalAmount === 0 ? 'Enroll Free ->' : `Pay ₹${finalAmount.toLocaleString('en-IN')} ->`}
        </button>

        <p className={styles.guarantee}>🔒 Secure payment · 30-day money-back guarantee</p>
      </div>
    </div>
  )
}
