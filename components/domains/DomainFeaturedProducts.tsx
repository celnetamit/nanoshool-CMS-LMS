import { FeaturedPrograms } from '@/components/marketing/FeaturedPrograms'
import type { ProductType } from '@/types'

type DomainProduct = {
  id: string
  title: string
  slug: string
  type: ProductType
  domainName: string
  domainSlug: string
  shortDescription?: string
  price: number
  salePrice?: number
  duration?: string
  level?: string
  format?: string
  certificate: boolean
}

type DomainFeaturedProductsProps = {
  domainName: string
  products: DomainProduct[]
}

export function DomainFeaturedProducts({
  domainName,
  products,
}: DomainFeaturedProductsProps) {
  return (
    <FeaturedPrograms
      kicker="Featured products"
      heading={`Featured products in ${domainName}`}
      body="Browse a curated set of live products currently surfaced for this domain."
      products={products}
    />
  )
}
