import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { queryOne, query } from '@/lib/db'
import { auth } from '@/lib/auth'
import { CheckoutTrigger } from '@/components/checkout/CheckoutTrigger'
import styles from './product.module.css'
import type { DBProduct } from '@/types'

const TYPE_MAP: Record<string, string> = {
  course: 'course', workshop: 'workshop', internship: 'internship',
  'flagship-program': 'flagship_program', package: 'package',
}

type Props = { params: Promise<{ domain: string; type: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug.replace(/-/g, ' ') }
}

export default async function ProductDetailPage({ params }: Props) {
  const { domain, type, slug } = await params
  const dbType = TYPE_MAP[type]
  if (!dbType) notFound()

  let product: (DBProduct & { domain_name: string; domain_slug: string }) | null = null
  try {
    product = await queryOne<DBProduct & { domain_name: string; domain_slug: string }>(
      `SELECT p.*, d.name AS domain_name, d.slug AS domain_slug
       FROM products p JOIN domains d ON d.id = p.domain_id
       WHERE d.slug = $1 AND p.type = $2 AND p.slug = $3 AND p.status = 'published'`,
      [domain, dbType, slug]
    )
  } catch { /* DB unavailable */ }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
          <h1>Program Not Found</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0 2rem' }}>
            This program may have been removed or is not yet published.
          </p>
          <Link href={`/${domain}`} className="btn btn-primary">
            ← Back to {domain}
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = product.sale_price ?? product.price
  const hasDiscount = product.sale_price && product.price > product.sale_price
  const discountPct = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : null
  const session = await auth()

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={`container ${styles.breadcrumbRow}`}>
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link> <span>/</span>
          <Link href={`/${domain}`}>{product.domain_name}</Link> <span>/</span>
          <Link href={`/${domain}/${type}s`}>{type}s</Link> <span>/</span>
          <span>{product.title}</span>
        </nav>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Left Column — Main Content */}
          <div className={styles.mainCol}>
            {/* Hero */}
            <div className={styles.hero}>
              <div className={styles.heroBadges}>
                <span className="badge badge-primary">{product.type.replace('_', ' ')}</span>
                {product.certificate && <span className="badge badge-success">🎓 Certificate</span>}
                {product.level && <span className="badge badge-neutral">{product.level}</span>}
                {product.format && <span className="badge badge-neutral">{product.format.replace('_', ' ')}</span>}
              </div>
              <h1 className={styles.title}>{product.title}</h1>
              {product.short_description && (
                <p className={styles.shortDesc}>{product.short_description}</p>
              )}
              <div className={styles.metaRow}>
                {product.duration && <span>⏱ {product.duration}</span>}
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {['Overview', 'Curriculum', 'FAQ'].map((t) => (
                <button key={t} className={`${styles.tab} ${t === 'Overview' ? styles.tabActive : ''}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Overview */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About this Program</h2>
              <p className={styles.bodyText}>
                {product.long_description || product.short_description || 'Full program details coming soon.'}
              </p>
            </section>

            {/* Outcomes */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What You'll Learn</h2>
              <div className={styles.outcomesList}>
                {['Master core concepts and practical applications',
                  'Work on real-world projects and case studies',
                  'Get mentored by industry experts',
                  'Earn a verified certificate upon completion'].map((o) => (
                  <div key={o} className={styles.outcomeItem}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum placeholder */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Curriculum</h2>
              <div className={styles.curriculumPlaceholder}>
                <span>📋</span>
                <p>Detailed curriculum will be available after enrollment.</p>
              </div>
            </section>
          </div>

          {/* Right Column — Sticky Enroll Card */}
          <aside className={styles.enrollCard}>
            <div className={styles.enrollCardInner}>
              {/* Pricing */}
              <div className={styles.pricing}>
                {hasDiscount && (
                  <div className={styles.discountBadge}>{discountPct}% OFF — Limited Time</div>
                )}
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    {displayPrice === 0 ? 'Free' : `₹${Number(displayPrice).toLocaleString('en-IN')}`}
                  </span>
                  {hasDiscount && (
                    <span className={styles.strikePrice}>₹{Number(product.price).toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <CheckoutTrigger
                productId={product.id}
                productTitle={product.title}
                price={Number(product.price)}
                salePrice={product.sale_price ? Number(product.sale_price) : undefined}
                isAuthenticated={Boolean(session?.user)}
                userName={session?.user?.name ?? undefined}
                userEmail={session?.user?.email ?? undefined}
                className={`btn btn-primary ${styles.enrollBtn}`}
                label="Enroll Now ->"
              />
              <p className={styles.enrollNote}>30-day money-back guarantee</p>

              {/* Highlights */}
              <div className={styles.highlights}>
                {[
                  product.duration && `⏱ ${product.duration}`,
                  product.level && `📊 ${product.level} level`,
                  product.format && `🎯 ${product.format.replace('_', ' ')}`,
                  product.certificate && '🎓 Verified certificate',
                  'Lifetime access',
                ].filter(Boolean).map((h) => (
                  <div key={h as string} className={styles.highlight}>{h}</div>
                ))}
              </div>

              <div className={styles.divider} />

              <Link href="/enterprise" className={styles.enterpriseLink}>
                Looking for enterprise pricing? →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className={styles.mobileCtaBar}>
        <div className={styles.mobilePricing}>
          <span className={styles.mobilePrice}>
            {displayPrice === 0 ? 'Free' : `₹${Number(displayPrice).toLocaleString('en-IN')}`}
          </span>
          {hasDiscount && <span className={styles.mobileDiscount}>{discountPct}% off</span>}
        </div>
        <CheckoutTrigger
          productId={product.id}
          productTitle={product.title}
          price={Number(product.price)}
          salePrice={product.sale_price ? Number(product.sale_price) : undefined}
          isAuthenticated={Boolean(session?.user)}
          userName={session?.user?.name ?? undefined}
          userEmail={session?.user?.email ?? undefined}
          className="btn btn-primary"
          label="Enroll Now ->"
        />
      </div>
    </div>
  )
}
