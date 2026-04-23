import { NextRequest, NextResponse } from 'next/server'
import { searchFullSite } from '@/lib/search'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (!q.trim()) {
    return NextResponse.json({ products: [], domains: [], mentors: [], totalHits: 0 })
  }

  try {
    const results = await searchFullSite(q)
    return NextResponse.json(results)
  } catch (error) {
    console.error('[GlobalSearch] Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
