import Link from 'next/link'
import styles from './ProductCard.module.css'
import { PRODUCT_TYPE_SLUGS } from '@/types/routes'
import type { ProductType } from '@/types'

interface ProductCardProps {
  id: string
  title: string
  slug: string
  type: ProductType
  domain: string
  domainSlug: string
  shortDescription?: string
  price: number
  salePrice?: number
  duration?: string
  level?: string
  certificate: boolean
  format?: string
}

export function ProductCard({
  title, slug, type, domainSlug, shortDescription,
  price, salePrice, duration, level, certificate, format,
}: ProductCardProps) {
  const href = `/${domainSlug}/${PRODUCT_TYPE_SLUGS[type].detail}/${slug}`

  const TYPE_COLORS: Record<ProductType, string> = {
    course: '#6366f1',
    workshop: '#f59e0b',
    internship: '#22c55e',
    flagship_program: '#ec4899',
    package: '#22d3ee',
  }

  const TYPE_LABELS: Record<ProductType, string> = {
    course: 'Course',
    workshop: 'Workshop',
    internship: 'Internship',
    flagship_program: 'Flagship Program',
    package: 'Package',
  }

  const discount = salePrice && price > 0
    ? Math.round(((price - salePrice) / price) * 100)
    : null

  return (
    <Link href={href} className={styles.card}>
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        <div className={styles.thumbnailBg} style={{ background: `linear-gradient(135deg, ${TYPE_COLORS[type]}20, ${TYPE_COLORS[type]}08)` }} />
        <span className={styles.thumbnailIcon}>
          {type === 'course' ? '📚' : type === 'workshop' ? '🛠️' : type === 'internship' ? '💼' : type === 'flagship_program' ? '🏆' : '📦'}
        </span>
        <span className={styles.typeBadge} style={{ background: `${TYPE_COLORS[type]}20`, color: TYPE_COLORS[type] }}>
          {TYPE_LABELS[type]}
        </span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {shortDescription && <p className={styles.desc}>{shortDescription}</p>}

        <div className={styles.meta}>
          {duration && <span className={styles.metaItem}>⏱ {duration}</span>}
          {level && <span className={styles.metaItem}>📊 {level}</span>}
          {format && <span className={styles.metaItem}>🎯 {format.replace('_', ' ')}</span>}
          {certificate && <span className={styles.metaItem} style={{ color: '#22c55e' }}>🎓 Certificate</span>}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.pricing}>
          {salePrice != null ? (
            <>
              <span className={styles.salePrice}>₹{salePrice.toLocaleString('en-IN')}</span>
              <span className={styles.originalPrice}>₹{price.toLocaleString('en-IN')}</span>
              {discount && <span className={styles.discount}>{discount}% off</span>}
            </>
          ) : (
            <span className={styles.price}>{price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}</span>
          )}
        </div>
        <span className={styles.cta}>Enroll →</span>
      </div>
    </Link>
  )
}
