import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Create Coupon — NSTC' }

export default function AdminCouponNewPage() {
  return (
    <div>
      <h1>Create Coupon</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Coupon creation UI is pending. Use SQL or backend tooling for now.
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/dashboard/admin/payments" className="btn btn-secondary">Back to Payments</Link>
      </div>
    </div>
  )
}

