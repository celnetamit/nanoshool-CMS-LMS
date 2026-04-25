import Link from 'next/link'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { checkAccess } from '@/services/enrollment.service'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string
  }>
}

const schema = z.object({
  productId: z.string().uuid(),
})

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId } = await searchParams
  const parsed = schema.safeParse({ productId })

  if (!parsed.success) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1>Invalid checkout link</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          We could not validate the selected program.
        </p>
        <Link href="/ai/courses" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Browse Programs
        </Link>
      </div>
    )
  }

  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout?productId=${parsed.data.productId}`)}`)
  }

  const product = await queryOne<{
    id: string
    title: string
    price: number
    sale_price: number | null
    status: string
  }>(
    `SELECT id, title, price, sale_price, status
     FROM products
     WHERE id = $1`,
    [parsed.data.productId]
  )

  if (!product || product.status !== 'published') {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1>Program unavailable</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          This program is not available for enrollment right now.
        </p>
        <Link href="/ai/courses" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Browse Programs
        </Link>
      </div>
    )
  }

  const alreadyEnrolled = await checkAccess(session.user.id, product.id)
  if (alreadyEnrolled) {
    redirect('/dashboard/participant/enrollments?status=already-enrolled')
  }

  return (
    <CheckoutFlow
      productId={product.id}
      productTitle={product.title}
      price={Number(product.price)}
      salePrice={product.sale_price == null ? undefined : Number(product.sale_price)}
      userName={session.user.name ?? undefined}
      userEmail={session.user.email ?? undefined}
    />
  )
}
