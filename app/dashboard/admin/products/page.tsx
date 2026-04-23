import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Admin Products — NSTC' }

export default async function AdminProductsPage() {
  let products: { id: string; title: string; status: string; type: string; domain_name: string }[] = []
  try {
    products = await query(
      `SELECT p.id, p.title, p.status, p.type, d.name AS domain_name
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       ORDER BY p.updated_at DESC
       LIMIT 50`,
      []
    )
  } catch {
    products = []
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <h1>Products</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Manage published and draft programs.
          </p>
        </div>
        <Link href="/dashboard/admin/products/new" className="btn btn-primary">Add Product</Link>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {products.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>No products found.</div>
        ) : (
          products.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <strong>{item.title}</strong>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {item.domain_name} · {item.type} · {item.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

