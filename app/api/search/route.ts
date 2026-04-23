import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/search'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const domain = searchParams.get('domain') || undefined
  const type = searchParams.get('type') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)

  if (!q.trim()) {
    return NextResponse.json({ hits: [], query: '', estimatedTotalHits: 0 })
  }

  try {
    const results = await searchProducts(q, { domain, type, page })
    return NextResponse.json(results)
  } catch (error) {
    console.error('[Search] Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
