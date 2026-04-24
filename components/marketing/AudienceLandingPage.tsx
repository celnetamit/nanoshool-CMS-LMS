import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { extractPlainText } from '@/lib/cms/public/richText'
import type { ProductType } from '@/types'
import { DOMAINS } from '@/types/routes'
import styles from './AudienceLandingPage.module.css'

type AudienceProduct = {
  id: string
  title: string
  slug: string
  type: ProductType
  shortDescription?: string | null
  price?: number | null
  salePrice?: number | null
  duration?: string | null
  level?: string | null
  format?: string | null
  certificate?: boolean | null
  domain?: { name?: string | null; slug?: string | null } | string | null
}

type AudienceMentor = {
  id: string
  name: string
  tagline?: string | null
  shortBio?: string | null
  designation?: string | null
  organization?: string | null
}

type AudienceFaq = {
  question?: string | null
  answer?: unknown
}

type AudienceOverride = {
  headline?: string | null
  subheadline?: string | null
  featuredProducts?: AudienceProduct[] | null
  featuredMentors?: AudienceMentor[] | null
}

type AudienceDoc = {
  name: string
  slug: string
  headline?: string | null
  subheadline?: string | null
  valueProps?: Array<{ title?: string | null; description?: string | null }> | null
  featuredProducts?: AudienceProduct[] | null
  featuredMentors?: AudienceMentor[] | null
  faq?: AudienceFaq[] | null
  ctaText?: string | null
  ctaUrl?: string | null
}

type AudiencePageProps = {
  audience: AudienceDoc
  plainContent: string
  textBlocks: string[]
  override?: AudienceOverride | null
}

function normalizeProducts(products: AudienceProduct[] | null | undefined) {
  return (products ?? [])
    .map((product) => {
      const domainSlug =
        typeof product.domain === 'string'
          ? product.domain
          : product.domain?.slug ?? ''
      const domainName =
        typeof product.domain === 'string'
          ? product.domain
          : product.domain?.name ?? domainSlug

      if (!domainSlug) return null

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        type: product.type,
        domain: domainName,
        domainSlug,
        shortDescription: product.shortDescription ?? undefined,
        price: Number(product.price ?? 0),
        salePrice: product.salePrice ?? undefined,
        duration: product.duration ?? undefined,
        level: product.level ?? undefined,
        format: product.format ?? undefined,
        certificate: Boolean(product.certificate),
      }
    })
    .filter(Boolean) as Array<{
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
      format?: string
      certificate: boolean
    }>
}

function domainLabel(slug: string) {
  if (slug === 'ai') return 'Artificial Intelligence'
  if (slug === 'biotechnology') return 'Biotechnology'
  if (slug === 'nanotechnology') return 'Nanotechnology'
  return slug
}

export function AudienceLandingPage({
  audience,
  plainContent,
  textBlocks,
  override,
}: AudiencePageProps) {
  const headline = override?.headline || audience.headline || audience.name
  const subheadline = override?.subheadline || audience.subheadline || plainContent
  const featuredProducts = normalizeProducts(override?.featuredProducts ?? audience.featuredProducts)
  const featuredMentors = (override?.featuredMentors ?? audience.featuredMentors ?? []).slice(0, 4)
  const faqs = (audience.faq ?? []).filter((item) => item.question && item.answer)
  const valueProps = (audience.valueProps ?? []).filter((item) => item.title)
  const ctaLabel = audience.ctaText || 'Explore Programs'
  const ctaUrl = audience.ctaUrl || '/search'

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.hero}>
          <span className={`badge badge-primary ${styles.eyebrow}`}>Audience Pathway</span>
          <h1 className={styles.title}>{headline}</h1>
          {subheadline && <p className={styles.subtitle}>{subheadline}</p>}
          <div className={styles.ctaRow}>
            <Link href={ctaUrl} className="btn btn-primary btn--lg">
              {ctaLabel} →
            </Link>
            <Link href="/search" className="btn btn-secondary btn--lg">
              Search Catalog
            </Link>
          </div>
        </section>

        <div className={styles.content}>
          <div className={styles.mainColumn}>
            {(textBlocks.length > 0 || plainContent) && (
              <section className={`card ${styles.blockCard}`}>
                <h2 className={styles.sectionTitle}>Overview</h2>
                <div className={styles.textBlocks}>
                  {(textBlocks.length > 0 ? textBlocks : [plainContent]).filter(Boolean).map((block) => (
                    <p key={block}>{block}</p>
                  ))}
                </div>
              </section>
            )}

            {valueProps.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Why this pathway matters</h2>
                <div className={styles.valueProps}>
                  {valueProps.map((item) => (
                    <article key={item.title} className={`card ${styles.valuePropCard}`}>
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {featuredProducts.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Featured programs</h2>
                <div className={styles.productGrid}>
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </section>
            )}

            {faqs.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                  {faqs.map((item) => (
                    <details key={item.question} className={styles.faq}>
                      <summary>{item.question}</summary>
                      <div className={styles.faqBody}>{extractPlainText(item.answer)}</div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.sideColumn}>
            {featuredMentors.length > 0 && (
              <section className={`card ${styles.blockCard}`}>
                <h2 className={styles.sectionTitle}>Featured mentors</h2>
                <div className={styles.mentorList}>
                  {featuredMentors.map((mentor) => (
                    <article key={mentor.id} className={`card ${styles.mentorCard}`}>
                      <h3 className={styles.mentorName}>{mentor.name}</h3>
                      <p className={styles.mentorMeta}>
                        {[mentor.designation, mentor.organization].filter(Boolean).join(', ') || mentor.tagline || 'Mentor'}
                      </p>
                      {(mentor.shortBio || mentor.tagline) && (
                        <p className={styles.mentorText}>{mentor.shortBio || mentor.tagline}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className={`card ${styles.blockCard}`}>
              <h2 className={styles.sectionTitle}>Explore by domain</h2>
              <div className={styles.domainLinks}>
                {DOMAINS.map((domain) => (
                  <Link key={domain} href={`/${domain}/${audience.slug}`} className={styles.domainLink}>
                    {domainLabel(domain)}
                  </Link>
                ))}
              </div>
            </section>

            {featuredProducts.length === 0 && featuredMentors.length === 0 && (
              <section className={`card ${styles.empty}`}>
                <h3 className={styles.sectionTitle}>Content coming next</h3>
                <p className={styles.domainCopy}>
                  Publish featured products, mentors, and value props in Payload to make this audience page fully populated.
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
