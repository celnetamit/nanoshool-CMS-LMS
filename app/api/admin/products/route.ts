import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { adminProductInputSchema } from '@/lib/products/admin-product-schema'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
      `INSERT INTO products (
         domain_id, title, slug, type, short_description, long_description,
         price, sale_price, duration, level, format, certificate,
         moodle_course_id, status, updated_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12,
         $13, $14, NOW()
       )
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
      ]
    )

    return NextResponse.json({ product: rows[0] }, { status: 201 })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A product with this slug/type already exists for the selected domain' },
        { status: 409 }
      )
    }

    console.error('[Admin Product Create] Failed:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
