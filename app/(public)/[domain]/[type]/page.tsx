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
type SearchParams = Promise<Record<string, string | string[] | undefined>>

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function parseOptionalNumber(value: string | string[] | undefined): number | null {
  const first = Array.isArray(value) ? value[0] : value
  if (!first || first.trim() === '') return null
  const parsed = Number(first)
  return Number.isFinite(parsed) ? parsed : null
}

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

export default async function ProductListingPage({ params, searchParams }: Props & { searchParams: SearchParams }) {
  const { domain, type } = await params
  const parsedSearchParams = await searchParams
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
  const q = (parsedSearchParams.q ?? '').toString().trim()
  const selectedLevels = toArray(parsedSearchParams.level).filter(Boolean)
  const selectedFormats = toArray(parsedSearchParams.format).filter(Boolean)
  const certificateOnly = parsedSearchParams.certificate === '1'
  const sort = (parsedSearchParams.sort ?? 'newest').toString()
  const minPrice = parseOptionalNumber(parsedSearchParams.minPrice)
  const maxPrice = parseOptionalNumber(parsedSearchParams.maxPrice)

  // Fetch products from DB
  let products: (DBProduct & { domain_name: string; domain_slug: string })[] = []
  try {
    const paramsList: unknown[] = [domain, productType]
    const whereClauses = ['d.slug = $1', 'p.type = $2', "p.status = 'published'"]

    if (q) {
      paramsList.push(`%${q}%`)
      whereClauses.push(`(p.title ILIKE $${paramsList.length} OR COALESCE(p.short_description, '') ILIKE $${paramsList.length})`)
    }

    if (selectedLevels.length > 0) {
      paramsList.push(selectedLevels)
      whereClauses.push(`p.level = ANY($${paramsList.length}::product_level[])`)
    }

    if (selectedFormats.length > 0) {
      paramsList.push(selectedFormats)
      whereClauses.push(`p.format = ANY($${paramsList.length}::product_format[])`)
    }

    if (certificateOnly) {
      whereClauses.push('p.certificate = TRUE')
    }

    if (minPrice != null && minPrice >= 0) {
      paramsList.push(minPrice)
      whereClauses.push(`p.price >= $${paramsList.length}`)
    }

    if (maxPrice != null && maxPrice >= 0) {
      paramsList.push(maxPrice)
      whereClauses.push(`p.price <= $${paramsList.length}`)
    }

    const orderBy =
      sort === 'price_asc'
        ? 'p.price ASC, p.created_at DESC'
        : sort === 'price_desc'
          ? 'p.price DESC, p.created_at DESC'
          : 'p.created_at DESC'

    products = await query<DBProduct & { domain_name: string; domain_slug: string }>(
      `SELECT p.*,
              d.name AS domain_name,
              d.slug AS domain_slug
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY ${orderBy}`,
      paramsList
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
          <form className={styles.sidebar} method="get">
            <h3 className={styles.filterTitle}>Filters</h3>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Level</h4>
              {[
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
              ].map((levelOption) => (
                <label key={levelOption.value} className={styles.filterOption}>
                  <input type="checkbox" name="level" value={levelOption.value} defaultChecked={selectedLevels.includes(levelOption.value)} /> {levelOption.label}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Format</h4>
              {[
                { label: 'Self Paced', value: 'self_paced' },
                { label: 'Live Cohort', value: 'live_cohort' },
                { label: 'Hybrid', value: 'hybrid' },
              ].map((formatOption) => (
                <label key={formatOption.value} className={styles.filterOption}>
                  <input type="checkbox" name="format" value={formatOption.value} defaultChecked={selectedFormats.includes(formatOption.value)} /> {formatOption.label}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Certificate</h4>
              <label className={styles.filterOption}>
                <input type="checkbox" name="certificate" value="1" defaultChecked={certificateOnly} /> Certificate included
              </label>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              <div className={styles.priceRange}>
                <input className="input" name="minPrice" placeholder="Min ₹" type="number" defaultValue={minPrice ?? ''} />
                <span>—</span>
                <input className="input" name="maxPrice" placeholder="Max ₹" type="number" defaultValue={maxPrice ?? ''} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary btn--sm">Apply</button>
              <Link href={`/${domain}/${type}`} className="btn btn-secondary btn--sm">Reset</Link>
            </div>
          </form>

          {/* Grid */}
          <div className={styles.main}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <p className={styles.count}>
                {products.length > 0 ? `${products.length} results` : 'No results yet'}
              </p>
              <form method="get" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {selectedLevels.map((levelParam) => (
                  <input key={levelParam} type="hidden" name="level" value={levelParam} />
                ))}
                {selectedFormats.map((formatParam) => (
                  <input key={formatParam} type="hidden" name="format" value={formatParam} />
                ))}
                {certificateOnly && <input type="hidden" name="certificate" value="1" />}
                {minPrice != null && minPrice >= 0 && <input type="hidden" name="minPrice" value={String(minPrice)} />}
                {maxPrice != null && maxPrice >= 0 && <input type="hidden" name="maxPrice" value={String(maxPrice)} />}

                <input className="input" name="q" placeholder="Search programs..." defaultValue={q} style={{ width: '220px' }} />
                <select className="select" name="sort" defaultValue={sort} style={{ width: 'auto' }}>
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <button type="submit" className="btn btn-secondary btn--sm">Go</button>
              </form>
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
