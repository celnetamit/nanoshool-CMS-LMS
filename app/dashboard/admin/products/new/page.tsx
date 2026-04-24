import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import { ProductEditorForm } from '../ProductEditorForm'

export const metadata: Metadata = { title: 'Create Product — NSTC' }

export default async function AdminProductNewPage() {
  const domains = await query<{ id: string; name: string; slug: string }>(
    'SELECT id, name, slug FROM domains ORDER BY name ASC',
    []
  )

  return (
    <div>
      <h1>Create Product</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Create and publish products directly from the admin dashboard.
      </p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin/collections/products" className="btn btn-secondary">Open in Payload CMS</Link>
        <Link href="/dashboard/admin/products" className="btn btn-secondary">Back to Products</Link>
      </div>
      <ProductEditorForm
        mode="create"
        domains={domains}
        initialValue={{
          domainId: domains[0]?.id ?? '',
          title: '',
          slug: '',
          type: 'course',
          shortDescription: '',
          longDescription: '',
          price: '0',
          salePrice: '',
          duration: '',
          level: '',
          format: '',
          certificate: false,
          moodleCourseId: '',
          status: 'draft',
        }}
      />
    </div>
  )
}
