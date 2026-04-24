import { ProductCard } from '@/components/products/ProductCard'
import type { ProductType } from '@/types'
import styles from './FeaturedPrograms.module.css'

type ProductCardViewModel = {
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

type FeaturedProgramsProps = {
  kicker?: string | null
  heading?: string | null
  body?: string | null
  products: ProductCardViewModel[]
}

export function FeaturedPrograms({
  kicker,
  heading = 'Featured Programs',
  body,
  products,
}: FeaturedProgramsProps) {
  if (products.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          {kicker ? <span className="badge badge-neutral">{kicker}</span> : null}
          <h2 className="text-h2">{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              type={product.type}
              domain={product.domainName}
              domainSlug={product.domainSlug}
              shortDescription={product.shortDescription}
              price={product.price}
              salePrice={product.salePrice}
              duration={product.duration}
              level={product.level}
              certificate={product.certificate}
              format={product.format}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
