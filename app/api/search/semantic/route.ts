import { NextRequest, NextResponse } from 'next/server'

// MOCK: In a real implementation, this would connect to Pinecone/Weaviate
// or use pgvector to do similarity search based on text embeddings.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (!q.trim()) {
    return NextResponse.json({ hits: [] })
  }

  // Artificial delay to simulate vector search
  await new Promise((r) => setTimeout(r, 600))

  return NextResponse.json({
    mode: 'semantic',
    query: q,
    hits: [
      {
        id: 'mock-1',
        title: 'Introduction to AI and Machine Learning',
        relevance_score: 0.92,
        slug: 'intro-to-ai',
        domain: 'ai',
        type: 'course',
      },
      {
        id: 'mock-2',
        title: 'Deep Learning Workshop',
        relevance_score: 0.85,
        slug: 'deep-learning-workshop',
        domain: 'ai',
        type: 'workshop',
      }
    ],
    message: 'This is a mocked semantic search response. Implement pgvector or Pinecone in production.'
  })
}
