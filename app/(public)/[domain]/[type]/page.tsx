import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { query } from '@/lib/db'
import styles from './listing.module.css'
import type { DBProduct, ProductType } from '@/types'

const VALID_DOMAINS = ['ai', 'biotechnology', 'nanotechnology']
const AUDIENCE_LABELS: Record<string, string> = {
  enterprise: 'Enterprise',
  university: 'University',
  students: 'Students',
  'phd-professors': 'PhD & Professors',
  'hiring-partners': 'Hiring Partners',
  mentors: 'Mentors',
}
const TYPE_MAP: Record<string, ProductType> = {
  courses: 'course', workshops: 'workshop', internships: 'internship',
  'flagship-programs': 'flagship_program', packages: 'package',
}
const TYPE_LABELS: Record<string, string> = {
  courses: 'Courses', workshops: 'Workshops', internships: 'Internships',
  'flagship-programs': 'Flagship Programs', packages: 'Packages',
}

type Props = { params: Promise<{ domain: string; type: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, type } = await params
  if (AUDIENCE_LABELS[type]) {
    const audience = AUDIENCE_LABELS[type]
    return {
      title: `${audience} Programs in ${domain.charAt(0).toUpperCase() + domain.slice(1)}`,
      description: `Explore NSTC offerings for ${audience.toLowerCase()} in ${domain}.`,
    }
  }

  const label = TYPE_LABELS[type] || type
  return {
    title: `${label} in ${domain.charAt(0).toUpperCase() + domain.slice(1)}`,
    description: `Browse ${label.toLowerCase()} in the ${domain} domain at NSTC.`,
  }
}

export default async function ProductListingPage({ params }: Props) {
  const { domain, type } = await params
  if (!VALID_DOMAINS.includes(domain)) notFound()
  if (!TYPE_MAP[type] && !AUDIENCE_LABELS[type]) notFound()

  const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1)

  if (AUDIENCE_LABELS[type]) {
    const audience = AUDIENCE_LABELS[type]
    let audienceProducts: (DBProduct & { domain_name: string; domain_slug: string })[] = []

    try {
      audienceProducts = await query<DBProduct & { domain_name: string; domain_slug: string }>(
        `SELECT p.*, d.name AS domain_name, d.slug AS domain_slug
         FROM products p
         JOIN domains d ON d.id = p.domain_id
         JOIN product_audiences pa ON pa.product_id = p.id
         JOIN audiences a ON a.id = pa.audience_id
         WHERE d.slug = $1 AND a.slug = $2 AND p.status = 'published'
         ORDER BY p.created_at DESC`,
        [domain, type]
      )
    } catch {
      audienceProducts = []
    }

    return (
      <div>
        <section className={styles.header}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">Home</Link> <span>/</span>
              <Link href={`/${domain}`}>{domainLabel}</Link>
              <span>/</span> <span>{audience}</span>
            </nav>
            <h1 className={styles.title}>{audience} in {domainLabel}</h1>
            <p className={styles.subtitle}>
              {audienceProducts.length} program{audienceProducts.length !== 1 ? 's' : ''} tailored for {audience.toLowerCase()} in {domainLabel}.
            </p>
          </div>
        </section>

        <div className="container">
          <div className={styles.main} style={{ paddingBottom: '4rem' }}>
            {audienceProducts.length > 0 ? (
              <div className={styles.grid}>
                {audienceProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    slug={p.slug}
                    type={p.type}
                    domain={p.domain_name}
                    domainSlug={p.domain_slug}
                    shortDescription={p.short_description}
                    price={Number(p.price)}
                    salePrice={p.sale_price ? Number(p.sale_price) : undefined}
                    duration={p.duration}
                    level={p.level}
                    certificate={p.certificate}
                    format={p.format}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <h3>No dedicated {audience} programs yet</h3>
                <p>Explore current domain offerings while we publish this audience track.</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                  <Link href={`/${domain}/courses`} className="btn btn-primary">View Courses</Link>
                  <Link href={`/${domain}/workshops`} className="btn btn-secondary">View Workshops</Link>
                  <Link href={`/${domain}`} className="btn btn-ghost">Back to {domainLabel}</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const productType = TYPE_MAP[type]
  const label = TYPE_LABELS[type]

  // Fetch products from DB
  let products: (DBProduct & { domain_name: string; domain_slug: string })[] = []
  try {
    products = await query<DBProduct & { domain_name: string; domain_slug: string }>(
      `SELECT p.*, d.name AS domain_name, d.slug AS domain_slug
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       WHERE d.slug = $1 AND p.type = $2 AND p.status = 'published'
       ORDER BY p.created_at DESC`,
      [domain, productType]
    )
  } catch {
    // DB not available yet — return empty state
  }

  return (
    <div>
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link> <span>/</span>
            <Link href={`/${domain}`}>{domainLabel}</Link>
            <span>/</span> <span>{label}</span>
          </nav>
          <h1 className={styles.title}>{label} in {domainLabel}</h1>
          <p className={styles.subtitle}>{products.length} program{products.length !== 1 ? 's' : ''} available</p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Filters Sidebar */}
          <aside className={styles.sidebar}>
            <h3 className={styles.filterTitle}>Filters</h3>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Level</h4>
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <label key={l} className={styles.filterOption}>
                  <input type="checkbox" /> {l}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Format</h4>
              {['Self Paced', 'Live Cohort', 'Hybrid'].map((f) => (
                <label key={f} className={styles.filterOption}>
                  <input type="checkbox" /> {f}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Certificate</h4>
              <label className={styles.filterOption}>
                <input type="checkbox" /> Certificate included
              </label>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              <div className={styles.priceRange}>
                <input className="input" placeholder="Min ₹" type="number" />
                <span>—</span>
                <input className="input" placeholder="Max ₹" type="number" />
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className={styles.main}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <p className={styles.count}>
                {products.length > 0 ? `${products.length} results` : 'No results yet'}
              </p>
              <select className="select" style={{ width: 'auto' }}>
                <option>Sort: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {products.length > 0 ? (
              <div className={styles.grid}>
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    slug={p.slug}
                    type={p.type}
                    domain={p.domain_name}
                    domainSlug={p.domain_slug}
                    shortDescription={p.short_description}
                    price={Number(p.price)}
                    salePrice={p.sale_price ? Number(p.sale_price) : undefined}
                    duration={p.duration}
                    level={p.level}
                    certificate={p.certificate}
                    format={p.format}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <h3>No {label} yet</h3>
                <p>Programs are being added. Check back soon or explore other formats.</p>
                <Link href={`/${domain}`} className="btn btn-secondary">
                  ← Back to {domainLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
