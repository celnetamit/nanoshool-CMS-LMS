import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { adminProductInputSchema } from '@/lib/products/admin-product-schema'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = adminProductInputSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data
  if (input.salePrice != null && input.salePrice > input.price) {
    return NextResponse.json({ error: 'Sale price cannot be greater than price' }, { status: 400 })
  }

  try {
    const rows = await query<{ id: string; slug: string }>(
      `UPDATE products
       SET domain_id = $1,
           title = $2,
           slug = $3,
           type = $4,
           short_description = $5,
           long_description = $6,
           price = $7,
           sale_price = $8,
           duration = $9,
           level = $10,
           format = $11,
           certificate = $12,
           moodle_course_id = $13,
           status = $14,
           updated_at = NOW()
       WHERE id = $15
       RETURNING id, slug`,
      [
        input.domainId,
        input.title,
        input.slug,
        input.type,
        input.shortDescription ?? null,
        input.longDescription ?? null,
        input.price,
        input.salePrice ?? null,
        input.duration ?? null,
        input.level ?? null,
        input.format ?? null,
        input.certificate,
        input.moodleCourseId ?? null,
        input.status,
        id,
      ]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: rows[0] })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A product with this slug/type already exists for the selected domain' },
        { status: 409 }
      )
    }

    console.error('[Admin Product Update] Failed:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const rows = await query<{ id: string }>(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Admin Product Delete] Failed:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
