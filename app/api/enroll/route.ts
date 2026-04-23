import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'

const schema = z.object({
  productId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = schema.safeParse({ productId: searchParams.get('productId') })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid or missing productId' }, { status: 400 })
  }

  const { productId } = parsed.data
  const checkoutPath = `/checkout?productId=${productId}`
  const session = await auth()

  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', checkoutPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(new URL(checkoutPath, req.url))
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid or missing productId' }, { status: 400 })
  }

  const checkoutPath = `/checkout?productId=${parsed.data.productId}`
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ redirect: `/login?callbackUrl=${encodeURIComponent(checkoutPath)}` }, { status: 401 })
  }

  return NextResponse.json({ redirect: checkoutPath }, { status: 200 })
}

