import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const domainId = searchParams.get('domainId')

  if (!productId || !domainId) {
    return NextResponse.json({ error: 'productId and domainId required' }, { status: 400 })
  }

  try {
    const related = await query(
      `SELECT p.id, p.title, p.slug, p.type, p.price, p.sale_price,
              p.short_description, d.name AS domain_name, d.slug AS domain_slug
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       WHERE p.domain_id = $1 AND p.id != $2 AND p.status = 'published'
       ORDER BY RANDOM()
       LIMIT 3`,
      [domainId, productId]
    )
    return NextResponse.json(related)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
  }
}
