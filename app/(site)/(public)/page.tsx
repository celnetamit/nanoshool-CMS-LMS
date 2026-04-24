import type { Metadata } from 'next'
import Link from 'next/link'
import { AudienceGrid } from '@/components/marketing/AudienceGrid'
import { HeroSection } from '@/components/marketing/HeroSection'
import { PageSectionRenderer } from '@/components/marketing/PageSectionRenderer'
import { StatsStrip } from '@/components/marketing/StatsStrip'
import { TrustStrip } from '@/components/marketing/TrustStrip'
import { getHomePage } from '@/lib/cms/public/getHomePage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import type { ProductType } from '@/types'

type CmsDomain = {
  id: string
  name: string
  slug: string
  tagline?: string | null
  stats?: Array<{ label?: string | null; value?: string | null }> | null
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
  organization?: string | null
  designation?: string | null
  shortBio?: string | null
}

type CmsPartner = {
  id: string
  name: string
}

type CmsTestimonial = {
  id: string
  name: string
  role?: string | null
  organization?: string | null
  quote: string
}

type CmsPage = {
  title?: string | null
  excerpt?: string | null
  pageType?: string | null
  hero?: {
    eyebrow?: string | null
    headline?: string | null
    subheadline?: string | null
    primaryCtaLabel?: string | null
    primaryCtaUrl?: string | null
    secondaryCtaLabel?: string | null
    secondaryCtaUrl?: string | null
  } | null
  sections?: Array<{
    blockType?: string
    kicker?: string | null
    heading?: string | null
    body?: string | null
    items?: Array<{ label?: string | null; value?: string | null; question?: string | null; answer?: unknown }> | null
    products?: CmsProduct[] | null
    audiences?: Array<{ id?: string; slug: string; name: string; headline?: string | null; subheadline?: string | null }> | null
    mentors?: CmsMentor[] | null
    partners?: CmsPartner[] | null
    testimonials?: CmsTestimonial[] | null
    content?: unknown
    primaryCtaLabel?: string | null
    primaryCtaUrl?: string | null
    secondaryCtaLabel?: string | null
    secondaryCtaUrl?: string | null
  }> | null
  seo?: { title?: string | null; description?: string | null } | null
}

const FALLBACK_STATS = [
  { value: '30,000+', label: 'Global Learners' },
  { value: '95+', label: 'Countries' },
  { value: '900+', label: 'Workshops' },
  { value: '19+ Years', label: 'Since 2006' },
]

const FALLBACK_DOMAINS = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    slug: 'ai',
    tagline: 'Machine Learning, Deep Learning, NLP & more',
  },
  {
    id: 'biotechnology',
    name: 'Biotechnology',
    slug: 'biotechnology',
    tagline: 'Genomics, Proteomics, Bioinformatics & more',
  },
  {
    id: 'nanotechnology',
    name: 'Nanotechnology',
    slug: 'nanotechnology',
    tagline: 'Nanomaterials, Nanoelectronics & more',
  },
]

function buildHeroStats(domains: CmsDomain[]) {
  const fromCms = domains
    .flatMap((domain) => domain.stats ?? [])
    .filter((item) => item.label && item.value)
    .slice(0, 4)
    .map((item) => ({
      value: item.value as string,
      label: item.label as string,
    }))

  return fromCms.length > 0 ? fromCms : FALLBACK_STATS
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage()
  const page = (home.page as CmsPage | null) ?? null

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: 'NSTC — AI, Biotechnology & Nanotechnology Learning Platform',
    fallbackDescription:
      page?.excerpt ||
      'Bridge academia, research, and industry with future-ready learning in AI, Biotechnology, and Nanotechnology.',
    canonicalPath: '/',
  })
}

export default async function HomePage() {
  const home = await getHomePage()

  const page = (home.page as CmsPage | null) ?? null
  const domains = (home.domains as CmsDomain[]) ?? []
  const audiences =
    ((home.audiences as Array<{ id?: string; slug: string; name: string; headline?: string | null; subheadline?: string | null }>) ?? []).filter(
      (audience) => audience.slug !== 'mentors'
    )
  const mentors = ((home.featuredMentors as CmsMentor[]) ?? []).slice(0, 3)
  const partners = ((home.partners as CmsPartner[]) ?? []).slice(0, 12)
  const testimonials = ((home.testimonials as CmsTestimonial[]) ?? []).slice(0, 3)

  const heroTitle = page?.hero?.headline || page?.title || 'Bridge Academia, Research and Industry with Future-Ready Skills.'
  const heroSubtitle = page?.hero?.subheadline || page?.excerpt ||
    'NanoSchool is a global workforce-learning platform for deep science and emerging technologies, built for students, professionals, researchers, faculty, and institutions.'

  const heroStats = buildHeroStats(domains)
  const displayDomains = (domains.length > 0 ? domains : FALLBACK_DOMAINS).slice(0, 3)
  const displayAudiences = audiences.slice(0, 5)
  const sectionBlocks =
    page?.sections && page.sections.length > 0
      ? page.sections
      : [
          {
            blockType: 'domainCards',
            kicker: 'Core Domains',
            heading: 'Explore the Future Across Three Applied Science Tracks',
            body: 'The public platform is organized around the core NanoSchool domains so learners and institutions can find relevant programs, mentors, and pathways quickly.',
          },
          {
            blockType: 'featuredProducts',
            kicker: 'Featured Programs',
            heading: 'Live Products from the New Catalog',
            body: 'These cards are driven from the shared public CMS helper layer and use published catalog data.',
          },
          {
            blockType: 'audienceCards',
            kicker: 'Audience Pathways',
            heading: 'Built for Learners, Institutions, and Industry Partners',
          },
          {
            blockType: 'testimonials',
            kicker: 'Proof and People',
            heading: 'Mentors and outcomes that make the platform credible',
          },
          {
            blockType: 'ctaBanner',
            kicker: 'Next step',
            heading: 'Start building the next version of your capability stack.',
            body: 'Browse programs by domain, explore mentors, and move from academic understanding to real applied workflows.',
            primaryCtaLabel: 'Start with AI',
            primaryCtaUrl: '/ai',
            secondaryCtaLabel: 'Search All Programs',
            secondaryCtaUrl: '/search',
          },
        ]

  return (
    <>
      <HeroSection
        eyebrow={page?.hero?.eyebrow || 'Deep Science Learning Commerce Platform'}
        title={heroTitle}
        description={heroSubtitle}
        primaryAction={{
          label: page?.hero?.primaryCtaLabel || 'Explore Programs',
          href: page?.hero?.primaryCtaUrl || '/ai',
        }}
        secondaryAction={{
          label: page?.hero?.secondaryCtaLabel || 'Meet Our Mentors',
          href: page?.hero?.secondaryCtaUrl || '/mentors',
        }}
        stats={heroStats}
      />

      {!page?.sections?.some((section) => section.blockType === 'stats') && heroStats.length > 0 ? (
        <StatsStrip
          kicker="Trust metrics"
          heading="A platform built to bridge academia, research, and industry"
          body="The public experience should establish credibility quickly while still feeling modern and easy to navigate."
          items={heroStats}
        />
      ) : null}

      <PageSectionRenderer
        sections={sectionBlocks}
        fallbackData={{
          stats: heroStats,
          domains: displayDomains,
          products: (home.featuredProducts as CmsProduct[]) ?? [],
          audiences: displayAudiences,
          mentors,
          partners,
          testimonials,
        }}
      />

      {!page?.sections?.some((section) => section.blockType === 'audienceCards') && displayAudiences.length > 0 ? (
        <AudienceGrid
          kicker="Audience pathways"
          heading="Built for learners, institutions, and industry partners"
          audiences={displayAudiences}
        />
      ) : null}

      {!page?.sections?.some((section) => section.blockType === 'partnerLogos') && partners.length > 0 ? (
        <TrustStrip partners={partners} />
      ) : null}

      {!page?.sections?.some((section) => section.blockType === 'ctaBanner') ? (
        <section className="section section--sm">
          <div className="container">
            <div style={{ borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)', padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent 70%)' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Start building the next version of your capability stack.</h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 640, margin: '0 auto 1.25rem' }}>
                Browse programs by domain, explore mentors, and move from academic understanding to real applied workflows.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/ai" className="btn btn-primary btn--lg">Start with AI</Link>
                <Link href="/search" className="btn btn-secondary btn--lg">Search All Programs</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
