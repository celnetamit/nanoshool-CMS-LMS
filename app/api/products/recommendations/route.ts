import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    // If not logged in, return generic popular products
    try {
      const popular = await query(
        `SELECT p.id, p.title, p.slug, p.type, d.name AS domain_name, d.slug AS domain_slug
         FROM products p JOIN domains d ON d.id = p.domain_id
         WHERE p.status = 'published'
         ORDER BY RANDOM() LIMIT 4`, []
      )
      return NextResponse.json({ type: 'popular', products: popular })
    } catch {
      return NextResponse.json({ type: 'popular', products: [] })
    }
  }

  // If logged in, fetch recommendations based on user's domains of interest
  try {
    const recommended = await query(
      `WITH user_domains AS (
         SELECT DISTINCT p.domain_id
         FROM enrollments e
         JOIN products p ON p.id = e.product_id
         WHERE e.user_id = $1
       )
       SELECT p.id, p.title, p.slug, p.type, d.name AS domain_name, d.slug AS domain_slug
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       WHERE p.status = 'published'
       AND p.domain_id IN (SELECT domain_id FROM user_domains)
       AND p.id NOT IN (SELECT product_id FROM enrollments WHERE user_id = $1)
       ORDER BY RANDOM() LIMIT 4`,
      [session.user.id]
    )

    // Fallback if no matching recommendations
    if (Array.isArray(recommended) && recommended.length === 0) {
      const fallback = await query(
        `SELECT p.id, p.title, p.slug, p.type, d.name AS domain_name, d.slug AS domain_slug
         FROM products p JOIN domains d ON d.id = p.domain_id
         WHERE p.status = 'published'
         AND p.id NOT IN (SELECT product_id FROM enrollments WHERE user_id = $1)
         ORDER BY RANDOM() LIMIT 4`, [session.user.id]
      )
      return NextResponse.json({ type: 'discovery', products: fallback })
    }

    return NextResponse.json({ type: 'personalized', products: recommended })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
