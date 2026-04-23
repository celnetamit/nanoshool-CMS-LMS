import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Create Product — NSTC' }

export default function AdminProductNewPage() {
  return (
    <div>
      <h1>Create Product</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Product creation is currently managed via Payload CMS.
      </p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin" className="btn btn-primary">Open Payload CMS</Link>
        <Link href="/dashboard/admin/products" className="btn btn-secondary">Back to Products</Link>
      </div>
    </div>
  )
}

