import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (!q.trim()) {
    return NextResponse.json({ hits: [] })
  }

  try {
    const normalized = q.trim()
    const rows = await query<{
      id: string
      title: string
      slug: string
      type: string
      domain: string
      relevance_score: string | number
    }>(
      `SELECT
         p.id,
         p.title,
         p.slug,
         p.type,
         d.slug AS domain,
         ts_rank(
           setweight(to_tsvector('simple', COALESCE(p.title, '')), 'A') ||
           setweight(to_tsvector('simple', COALESCE(p.short_description, '')), 'B') ||
           setweight(to_tsvector('simple', COALESCE(p.long_description, '')), 'C'),
           plainto_tsquery('simple', $1)
         ) AS relevance_score
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       WHERE p.status = 'published'
         AND (
           setweight(to_tsvector('simple', COALESCE(p.title, '')), 'A') ||
           setweight(to_tsvector('simple', COALESCE(p.short_description, '')), 'B') ||
           setweight(to_tsvector('simple', COALESCE(p.long_description, '')), 'C')
         ) @@ plainto_tsquery('simple', $1)
       ORDER BY relevance_score DESC, p.created_at DESC
       LIMIT 10`,
      [normalized]
    )

    const hits = rows.map((row) => ({
      ...row,
      relevance_score: Number(row.relevance_score) || 0,
    }))

    return NextResponse.json({
      mode: 'semantic',
      query: normalized,
      hits,
      message: 'Semantic search is powered by weighted Postgres full-text ranking.',
    })
  } catch (error) {
    console.error('[SemanticSearch] Error:', error)
    return NextResponse.json({ error: 'Semantic search failed', hits: [] }, { status: 500 })
  }
}
