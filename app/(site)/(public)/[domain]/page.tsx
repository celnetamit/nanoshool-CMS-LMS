import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DomainAudienceLinks } from '@/components/domains/DomainAudienceLinks'
import { DomainFeaturedProducts } from '@/components/domains/DomainFeaturedProducts'
import { DomainHero } from '@/components/domains/DomainHero'
import { DomainHighlights } from '@/components/domains/DomainHighlights'
import { PartnerLogoStrip } from '@/components/marketing/PartnerLogoStrip'
import { TestimonialGrid } from '@/components/marketing/TestimonialGrid'
import { MentorGrid } from '@/components/mentors/MentorGrid'
import { getDomainPage } from '@/lib/cms/public/getDomainPage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText } from '@/lib/cms/public/richText'
import { DOMAINS, PRODUCT_TYPES, PRODUCT_TYPE_SLUGS } from '@/types/routes'
import type { DomainSlug, ProductType } from '@/types'

type Props = { params: Promise<{ domain: string }> }

type CmsDomainDoc = {
  id: string
  name: string
  slug: string
  tagline?: string | null
  hero?: {
    eyebrow?: string | null
    headline?: string | null
    subheadline?: string | null
    primaryCtaLabel?: string | null
    primaryCtaUrl?: string | null
  } | null
  highlights?: Array<{ title?: string | null; description?: string | null }> | null
  stats?: Array<{ label?: string | null; value?: string | null }> | null
  featuredProducts?: CmsProduct[] | null
  featuredMentors?: CmsMentor[] | null
  audienceLinks?: Array<{ slug?: string | null; name?: string | null }> | null
  testimonialReferences?: Array<{ id: string; name: string; role?: string | null; organization?: string | null; quote: string }> | null
  partnerReferences?: Array<{ id: string; name: string; website?: string | null }> | null
  faqs?: Array<{ question?: string | null; answer?: unknown }> | null
}

type CmsProduct = {
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

type CmsMentor = {
  id: string
  name: string
  tagline?: string | null
  shortBio?: string | null
  designation?: string | null
  organization?: string | null
}

const FALLBACK_DOMAIN_DATA: Record<
  DomainSlug,
  {
    name: string
    tagline: string
    description: string
    color: string
    stats: { value: string; label: string }[]
    highlights: { title: string; description: string }[]
    faqs: { q: string; a: string }[]
  }
> = {
  ai: {
    name: 'Artificial Intelligence',
    tagline: 'Build intelligent systems with real-world workflow literacy',
    description:
      'Explore applied learning paths across machine learning, generative AI, automation, and domain-specific decision systems.',
    color: '#6366f1',
    stats: [
      { value: '40+', label: 'Programs' },
      { value: '80+', label: 'Mentors' },
      { value: '5,000+', label: 'Learners' },
      { value: '92%', label: 'Placement Rate' },
    ],
    highlights: [
      { title: 'Industry workflow focus', description: 'Move beyond theory into tools, judgment, and execution patterns.' },
      { title: 'Mentor-led learning', description: 'Learn from researchers, practitioners, and technical specialists.' },
      { title: 'Multi-format delivery', description: 'Courses, workshops, internships, flagship programs, and packages.' },
    ],
    faqs: [
      { q: 'Do I need programming experience?', a: 'Some tracks assume basic Python or data familiarity, but foundation-oriented options can still support beginners.' },
      { q: 'Are programs live or self-paced?', a: 'The catalog supports multiple formats. Check each product page for the exact delivery model.' },
    ],
  },
  biotechnology: {
    name: 'Biotechnology',
    tagline: 'Build biotechnology capabilities from research foundations to industry relevance',
    description:
      'Explore genomics, proteomics, bioinformatics, therapeutic workflows, and applied biotech learning experiences.',
    color: '#22c55e',
    stats: [
      { value: '25+', label: 'Programs' },
      { value: '50+', label: 'Mentors' },
      { value: '3,000+', label: 'Learners' },
      { value: '88%', label: 'Placement Rate' },
    ],
    highlights: [
      { title: 'Research-to-application focus', description: 'Translate scientific understanding into industry-facing capability.' },
      { title: 'Mentored deep-science learning', description: 'Engage with domain specialists across modern biotech pathways.' },
      { title: 'Career and academic relevance', description: 'Useful for learners, researchers, faculty, and institutions.' },
    ],
    faqs: [
      { q: 'Are these programs useful for researchers as well as students?', a: 'Yes. The platform is designed for multiple maturity levels, including research-aligned users.' },
      { q: 'Do products include practical learning components?', a: 'Many products are structured around applied workflows, mentorship, and domain practice.' },
    ],
  },
  nanotechnology: {
    name: 'Nanotechnology',
    tagline: 'Learn the science and workflows behind nanoscale innovation',
    description:
      'Develop nanotechnology skills across materials, applications, innovation pathways, and scientific commercialization contexts.',
    color: '#22d3ee',
    stats: [
      { value: '20+', label: 'Programs' },
      { value: '35+', label: 'Mentors' },
      { value: '2,000+', label: 'Learners' },
      { value: '85%', label: 'Placement Rate' },
    ],
    highlights: [
      { title: 'Deep-science specialization', description: 'Structured for learners who want more than surface-level exposure.' },
      { title: 'Applied innovation pathways', description: 'Connect science learning with emerging real-world use cases.' },
      { title: 'Mentorship and guided progression', description: 'Support from experienced domain practitioners and faculty.' },
    ],
    faqs: [
      { q: 'Can undergraduate learners explore nanotechnology here?', a: 'Yes. The platform can support multiple levels, from foundational exploration to advanced specialization.' },
      { q: 'Is this only academic content?', a: 'No. The domain strategy is built around bridging academia, research, and industry-facing skills.' },
    ],
  },
}

const DEFAULT_AUDIENCE_LINKS = [
  { slug: 'enterprise', name: 'Enterprise' },
  { slug: 'university', name: 'University' },
  { slug: 'students', name: 'Students' },
  { slug: 'phd-professors', name: 'PhD & Professors' },
  { slug: 'hiring-partners', name: 'Hiring Partners' },
]

function normalizeProducts(products: CmsProduct[] | null | undefined, domainSlug: string, domainName: string) {
  return (products ?? [])
    .map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      type: product.type,
      domainSlug:
        typeof product.domain === 'string'
          ? product.domain || domainSlug
          : product.domain?.slug || domainSlug,
      domainName:
        typeof product.domain === 'string'
          ? product.domain || domainName
          : product.domain?.name || domainName,
      shortDescription: product.shortDescription ?? undefined,
      price: Number(product.price ?? 0),
      salePrice: product.salePrice ?? undefined,
      duration: product.duration ?? undefined,
      level: product.level ?? undefined,
      format: product.format ?? undefined,
      certificate: Boolean(product.certificate),
    }))
    .filter((product) => product.domainSlug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  if (!DOMAINS.includes(domain as DomainSlug)) return {}

  const domainPage = await getDomainPage(domain)
  const fallback = FALLBACK_DOMAIN_DATA[domain as DomainSlug]

  return buildSeoMetadata({
    seo: domainPage?.seo,
    fallbackTitle: `${domainPage?.domain.name || fallback.name} Programs, Courses and Mentors`,
    fallbackDescription: domainPage?.plainOverview || fallback.description,
    canonicalPath: `/${domain}`,
  })
}

export function generateStaticParams() {
  return DOMAINS.map((domain) => ({ domain }))
}

export default async function DomainPage({ params }: Props) {
  const { domain } = await params
  if (!DOMAINS.includes(domain as DomainSlug)) notFound()

  const slug = domain as DomainSlug
  const fallback = FALLBACK_DOMAIN_DATA[slug]
  const domainPage = await getDomainPage(slug)
  const cmsDomain = (domainPage?.domain as CmsDomainDoc | undefined) ?? null

  const title = cmsDomain?.hero?.headline || cmsDomain?.name || fallback.name
  const tagline = cmsDomain?.hero?.subheadline || cmsDomain?.tagline || fallback.tagline
  const eyebrow = cmsDomain?.hero?.eyebrow || 'Domain Hub'
  const description = domainPage?.plainOverview || fallback.description
  const ctaLabel = cmsDomain?.hero?.primaryCtaLabel || 'Browse Courses'
  const ctaUrl = cmsDomain?.hero?.primaryCtaUrl || `/${slug}/courses`
  const stats =
    (cmsDomain?.stats ?? [])
      .filter((item) => item.label && item.value)
      .map((item) => ({ label: item.label as string, value: item.value as string })) || []
  const displayStats = stats.length > 0 ? stats : fallback.stats
  const highlights =
    (cmsDomain?.highlights ?? [])
      .filter((item) => item.title)
      .map((item) => ({
        title: item.title as string,
        description: item.description || '',
      })) || []
  const displayHighlights = highlights.length > 0 ? highlights : fallback.highlights
  const featuredProducts = normalizeProducts(cmsDomain?.featuredProducts, slug, cmsDomain?.name || fallback.name)
  const featuredMentors = (cmsDomain?.featuredMentors ?? []).slice(0, 4)
  const audienceLinks = (cmsDomain?.audienceLinks ?? []).filter((item) => item.slug) as Array<{ slug?: string | null; name?: string | null }>
  const displayAudienceLinks = audienceLinks.length > 0 ? audienceLinks : DEFAULT_AUDIENCE_LINKS
  const testimonials = (cmsDomain?.testimonialReferences ?? []).slice(0, 3)
  const partners = (cmsDomain?.partnerReferences ?? []).slice(0, 8)
  const faqs =
    (cmsDomain?.faqs ?? [])
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        q: item.question as string,
        a: extractPlainText(item.answer),
      })) || []
  const displayFaqs = faqs.length > 0 ? faqs : fallback.faqs

  return (
    <>
      <DomainHero
        name={cmsDomain?.name || fallback.name}
        crumbLabel={cmsDomain?.name || fallback.name}
        eyebrow={eyebrow}
        title={title}
        tagline={tagline}
        description={description}
        ctaLabel={`${ctaLabel} →`}
        ctaUrl={ctaUrl}
        secondaryLabel="Flagship Programs"
        secondaryUrl={`/${slug}/${PRODUCT_TYPE_SLUGS.flagship_program.list}`}
        stats={displayStats}
        accent={fallback.color}
      />

      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Explore by Format</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {PRODUCT_TYPES.map((type) => {
              const label =
                type === 'course'
                  ? 'Courses'
                  : type === 'workshop'
                    ? 'Workshops'
                    : type === 'internship'
                      ? 'Internships'
                      : type === 'flagship_program'
                        ? 'Flagship Programs'
                        : 'Packages'
              const descriptionText =
                type === 'course'
                  ? 'Structured learning pathways'
                  : type === 'workshop'
                    ? 'Short applied learning sessions'
                    : type === 'internship'
                      ? 'Practical experience pathways'
                      : type === 'flagship_program'
                        ? 'Comprehensive guided programs'
                        : 'Bundled domain learning tracks'

              return (
                <Link
                  key={type}
                  href={`/${slug}/${PRODUCT_TYPE_SLUGS[type].list}`}
                  className="card card--hover"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem' }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {type === 'course'
                      ? 'CD'
                      : type === 'workshop'
                        ? 'WS'
                        : type === 'internship'
                          ? 'IN'
                          : type === 'flagship_program'
                            ? 'FP'
                            : 'PK'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{label}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginTop: '0.15rem' }}>{descriptionText}</p>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: fallback.color }}>
                    →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <DomainHighlights highlights={displayHighlights} />

      {featuredProducts.length > 0 && (
        <DomainFeaturedProducts domainName={cmsDomain?.name || fallback.name} products={featuredProducts.slice(0, 6)} />
      )}

      <DomainAudienceLinks domainSlug={slug} items={displayAudienceLinks} />

      {featuredMentors.length > 0 && (
        <MentorGrid
          kicker="Mentor highlights"
          heading="Featured mentors"
          body="Learn with domain specialists who help translate theory into applied growth."
          mentors={featuredMentors}
        />
      )}

      {testimonials.length > 0 ? (
        <TestimonialGrid
          kicker="Proof and outcomes"
          heading={`What learners and collaborators say about ${cmsDomain?.name || fallback.name}`}
          testimonials={testimonials}
        />
      ) : null}

      {partners.length > 0 ? (
        <PartnerLogoStrip
          kicker="Partner ecosystem"
          heading="Institutional and industry collaborators"
          body="Trust surfaces for the domain should be visible without overwhelming the browsing flow."
          partners={partners}
        />
      ) : null}

      <section className="section section--sm">
        <div className="container">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayFaqs.map((faq) => (
                <details
                  key={faq.q}
                  style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '0 1.25rem' }}
                >
                  <summary style={{ listStyle: 'none', cursor: 'pointer', fontWeight: 600, padding: '1.15rem 0' }}>{faq.q}</summary>
                  <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, paddingBottom: '1.2rem' }}>{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sm">
        <div className="container">
          <div
            style={{
              borderRadius: 'var(--radius-2xl)',
              border: `1px solid ${fallback.color}30`,
              background: `linear-gradient(135deg, ${fallback.color}10, transparent)`,
              padding: '3rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <h2>Ready to explore {cmsDomain?.name || fallback.name}?</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 640 }}>
              Browse the domain catalog, learn from domain mentors, and choose the right path for your goals.
            </p>
            <a
              href={`/${slug}/${PRODUCT_TYPE_SLUGS.course.list}`}
              className="btn btn-primary btn--lg"
              style={{ background: `linear-gradient(135deg, ${fallback.color}, ${fallback.color}cc)` }}
            >
              Browse Courses →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
