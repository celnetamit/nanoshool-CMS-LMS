import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Coupons — NSTC' }

export default async function AdminCouponsPage() {
  let coupons: {
    id: string
    code: string
    discount_type: string
    discount_value: number
    active: boolean
    uses_count: number
    max_uses: number | null
  }[] = []

  try {
    coupons = await query(
      `SELECT id, code, discount_type, discount_value, active, uses_count, max_uses
       FROM coupons
       ORDER BY created_at DESC
       LIMIT 50`,
      []
    )
  } catch {
    coupons = []
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <h1>Coupons</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Manage active and historical discount codes.
          </p>
        </div>
        <Link href="/dashboard/admin/coupons/new" className="btn btn-primary">Create Coupon</Link>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {coupons.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>No coupons found.</div>
        ) : (
          coupons.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <strong>{item.code}</strong>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {item.discount_type} · {Number(item.discount_value)} · uses {item.uses_count}
                {item.max_uses ? `/${item.max_uses}` : ''}
                {' '}· {item.active ? 'active' : 'inactive'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

