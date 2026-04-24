import Link from 'next/link'
import type { CSSProperties } from 'react'
import { extractPlainText } from '@/lib/cms/public/richText'
import { AudienceGrid } from './AudienceGrid'
import { FeaturedPrograms } from './FeaturedPrograms'
import { PartnerLogoStrip } from './PartnerLogoStrip'
import { StatsStrip } from './StatsStrip'
import { TestimonialGrid } from './TestimonialGrid'
import { MentorGrid } from '@/components/mentors/MentorGrid'
import styles from './PageSectionRenderer.module.css'

type ProductLike = {
  id: string
  title: string
  slug: string
  type: import('@/types').ProductType
  shortDescription?: string | null
  price?: number | null
  salePrice?: number | null
  duration?: string | null
  level?: string | null
  format?: string | null
  certificate?: boolean | null
  domain?: { name?: string | null; slug?: string | null } | string | null
}

type AudienceLike = {
  id?: string
  slug: string
  name: string
  headline?: string | null
  subheadline?: string | null
}

type MentorLike = {
  id: string
  name: string
  tagline?: string | null
  shortBio?: string | null
  designation?: string | null
  organization?: string | null
}

type PartnerLike = {
  id: string
  name: string
  website?: string | null
}

type TestimonialLike = {
  id: string
  name: string
  role?: string | null
  organization?: string | null
  quote: string
}

type SectionItem = {
  blockType?: string
  kicker?: string | null
  heading?: string | null
  body?: string | null
  items?: Array<{ label?: string | null; value?: string | null; question?: string | null; answer?: unknown }> | null
  products?: ProductLike[] | null
  audiences?: AudienceLike[] | null
  mentors?: MentorLike[] | null
  partners?: PartnerLike[] | null
  testimonials?: TestimonialLike[] | null
  content?: unknown
  primaryCtaLabel?: string | null
  primaryCtaUrl?: string | null
  secondaryCtaLabel?: string | null
  secondaryCtaUrl?: string | null
}

type PageSectionRendererProps = {
  sections?: SectionItem[] | null
  fallbackData: {
    stats?: Array<{ label: string; value: string }>
    domains?: Array<{ slug: string; name: string; tagline?: string | null }>
    products?: ProductLike[]
    audiences?: AudienceLike[]
    mentors?: MentorLike[]
    partners?: PartnerLike[]
    testimonials?: TestimonialLike[]
  }
}

function normalizeProducts(products: ProductLike[] = []) {
  return products
    .map((product) => {
      const domainSlug =
        typeof product.domain === 'string' ? product.domain : product.domain?.slug ?? ''
      const domainName =
        typeof product.domain === 'string' ? product.domain : product.domain?.name ?? domainSlug

      if (!domainSlug) return null

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        type: product.type,
        domainSlug,
        domainName,
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
      type: import('@/types').ProductType
      domainSlug: string
      domainName: string
      shortDescription?: string
      price: number
      salePrice?: number
      duration?: string
      level?: string
      format?: string
      certificate: boolean
    }>
}

const DOMAIN_ACCENTS: Record<string, string> = {
  ai: '#6366f1',
  biotechnology: '#22c55e',
  nanotechnology: '#22d3ee',
}

function renderDomainCards(section: SectionItem, domains: NonNullable<PageSectionRendererProps['fallbackData']['domains']>) {
  if (domains.length === 0) return null

  return (
    <section className="section" key={`section-${section.blockType}-${section.heading}`}>
      <div className="container">
        <div className={styles.header}>
          {section.kicker ? <span className="badge badge-neutral">{section.kicker}</span> : null}
          {section.heading ? <h2 className="text-h2">{section.heading}</h2> : null}
          {section.body ? <p>{section.body}</p> : null}
        </div>
        <div className={styles.domainGrid}>
          {domains.map((domain) => {
            const accent = DOMAIN_ACCENTS[domain.slug] ?? '#6366f1'

            return (
              <Link key={domain.slug} href={`/${domain.slug}`} className={styles.domainCard}>
                <div
                  className={styles.domainGlow}
                  style={{ '--domain-accent': accent } as CSSProperties}
                />
                <span
                  className={styles.domainBadge}
                  style={{ background: `${accent}1A`, color: accent }}
                >
                  {domain.slug.toUpperCase()}
                </span>
                <h3 className={styles.domainTitle}>{domain.name}</h3>
                <p className={styles.domainText}>{domain.tagline || 'Explore programs, mentors, and applied pathways.'}</p>
                <span className={styles.domainArrow} style={{ color: accent }}>
                  Explore Domain →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function PageSectionRenderer({ sections, fallbackData }: PageSectionRendererProps) {
  if (!sections || sections.length === 0) return null

  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.blockType ?? 'section'}-${index}`

        switch (section.blockType) {
          case 'stats':
            return (
              <StatsStrip
                key={key}
                kicker={section.kicker}
                heading={section.heading}
                body={section.body}
                items={
                  (section.items ?? [])
                    .filter((item) => item.label && item.value)
                    .map((item) => ({ label: item.label as string, value: item.value as string }))
                    .slice(0, 8)
                    .concat()
                }
              />
            )
          case 'domainCards':
            return renderDomainCards(section, fallbackData.domains ?? [])
          case 'featuredProducts':
            return (
              <FeaturedPrograms
                key={key}
                kicker={section.kicker}
                heading={section.heading}
                body={section.body}
                products={normalizeProducts((section.products?.length ? section.products : fallbackData.products) ?? []).slice(0, 6)}
              />
            )
          case 'audienceCards':
            return (
              <AudienceGrid
                key={key}
                kicker={section.kicker}
                heading={section.heading}
                body={section.body}
                audiences={(section.audiences?.length ? section.audiences : fallbackData.audiences) ?? []}
              />
            )
          case 'mentorSpotlights':
            return (
              <MentorGrid
                key={key}
                kicker={section.kicker}
                heading={section.heading ?? 'Mentor spotlights'}
                body={section.body}
                mentors={(section.mentors?.length ? section.mentors : fallbackData.mentors) ?? []}
              />
            )
          case 'partnerLogos':
            return (
              <PartnerLogoStrip
                key={key}
                kicker={section.kicker}
                heading={section.heading}
                body={section.body}
                partners={(section.partners?.length ? section.partners : fallbackData.partners) ?? []}
              />
            )
          case 'testimonials':
            return (
              <TestimonialGrid
                key={key}
                kicker={section.kicker}
                heading={section.heading}
                body={section.body}
                testimonials={(section.testimonials?.length ? section.testimonials : fallbackData.testimonials) ?? []}
              />
            )
          case 'faq': {
            const faqs = (section.items ?? []).filter((item) => item.question && item.answer)
            if (faqs.length === 0) return null

            return (
              <section className="section section--sm" key={key}>
                <div className="container">
                  <div className={styles.narrow}>
                    <div className={styles.header}>
                      {section.kicker ? <span className="badge badge-neutral">{section.kicker}</span> : null}
                      {section.heading ? <h2 className="text-h2">{section.heading}</h2> : null}
                    </div>
                    <div className={styles.faqList}>
                      {faqs.map((faq) => (
                        <details key={faq.question as string} className={styles.faq}>
                          <summary>{faq.question as string}</summary>
                          <div>{extractPlainText(faq.answer)}</div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          }
          case 'richText': {
            const content = extractPlainText(section.content)
            if (!content) return null

            return (
              <section className="section section--sm" key={key}>
                <div className="container">
                  <div className={styles.narrow}>
                    {section.kicker ? <span className="badge badge-neutral">{section.kicker}</span> : null}
                    {section.heading ? <h2 className={styles.richHeading}>{section.heading}</h2> : null}
                    <div className={styles.richText}>
                      {content
                        .split('\n')
                        .map((block) => block.trim())
                        .filter(Boolean)
                        .map((block) => (
                          <p key={block}>{block}</p>
                        ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          }
          case 'ctaBanner':
            return (
              <section className="section section--sm" key={key}>
                <div className="container">
                  <div className={styles.ctaBanner}>
                    {section.kicker ? <span className="badge badge-primary">{section.kicker}</span> : null}
                    <h2>{section.heading}</h2>
                    {section.body ? <p>{section.body}</p> : null}
                    <div className={styles.ctaActions}>
                      {section.primaryCtaLabel && section.primaryCtaUrl ? (
                        <Link href={section.primaryCtaUrl} className="btn btn-primary btn--lg">
                          {section.primaryCtaLabel}
                        </Link>
                      ) : null}
                      {section.secondaryCtaLabel && section.secondaryCtaUrl ? (
                        <Link href={section.secondaryCtaUrl} className="btn btn-secondary btn--lg">
                          {section.secondaryCtaLabel}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
