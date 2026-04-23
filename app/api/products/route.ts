import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  const type = searchParams.get('type')
  const audience = searchParams.get('audience')

  let sql = `
    SELECT
      p.id, p.title, p.slug, p.type, p.short_description,
      p.price, p.sale_price, p.duration, p.level, p.format,
      p.certificate, p.status,
      d.name AS domain_name, d.slug AS domain_slug
    FROM products p
    JOIN domains d ON d.id = p.domain_id
    WHERE p.status = 'published'
  `
  const params: unknown[] = []

  if (domain) {
    params.push(domain)
    sql += ` AND d.slug = $${params.length}`
  }
  if (type) {
    params.push(type)
    sql += ` AND p.type = $${params.length}`
  }

  sql += ' ORDER BY p.created_at DESC'

  const products = await query(sql, params)
  return NextResponse.json({ products })
}
