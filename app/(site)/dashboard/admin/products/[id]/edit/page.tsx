import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query, queryOne } from '@/lib/db'
import { ProductEditorForm } from '../../ProductEditorForm'
import type { ProductFormat, ProductLevel, ProductStatus, ProductType } from '@/types'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Product — NSTC' }

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params

  const [product, domains] = await Promise.all([
    queryOne<{
      id: string
      domain_id: string
      title: string
      slug: string
      type: ProductType
      short_description: string | null
      long_description: string | null
      price: number
      sale_price: number | null
      duration: string | null
      level: ProductLevel | null
      format: ProductFormat | null
      certificate: boolean
      moodle_course_id: string | null
      status: ProductStatus
    }>(
      `SELECT id, domain_id, title, slug, type, short_description, long_description,
              price, sale_price, duration, level, format, certificate, moodle_course_id, status
       FROM products
       WHERE id = $1`,
      [id]
    ),
    query<{ id: string; name: string; slug: string }>(
      'SELECT id, name, slug FROM domains ORDER BY name ASC',
      []
    ),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1>Edit Product</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Update product details, pricing, and publication status.
      </p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/dashboard/admin/products" className="btn btn-secondary">Back to Products</Link>
      </div>
      <ProductEditorForm
        mode="edit"
        productId={product.id}
        domains={domains}
        initialValue={{
          domainId: product.domain_id,
          title: product.title,
          slug: product.slug,
          type: product.type,
          shortDescription: product.short_description ?? '',
          longDescription: product.long_description ?? '',
          price: String(Number(product.price ?? 0)),
          salePrice: product.sale_price != null ? String(Number(product.sale_price)) : '',
          duration: product.duration ?? '',
          level: product.level ?? '',
          format: product.format ?? '',
          certificate: product.certificate,
          moodleCourseId: product.moodle_course_id ?? '',
          status: product.status,
        }}
      />
    </div>
  )
}
