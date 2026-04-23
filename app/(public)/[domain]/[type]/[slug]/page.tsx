import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import { queryOne, query } from '@/lib/db'
import { auth } from '@/lib/auth'
import { CheckoutTrigger } from '@/components/checkout/CheckoutTrigger'
import config from '@/payload.config'
import styles from './product.module.css'
import type { DBProduct } from '@/types'

const TYPE_MAP: Record<string, string> = {
  course: 'course', workshop: 'workshop', internship: 'internship',
  'flagship-program': 'flagship_program', package: 'package',
}

type Props = { params: Promise<{ domain: string; type: string; slug: string }> }

type PayloadDomainRef = {
  id: string
  name?: string
  slug?: string
} | string | null | undefined

type PayloadMentor = {
  id: string
  name: string
  slug: string
  tagline?: string | null
  expertise?: { area?: string | null }[] | null
}

type PayloadProduct = {
  id: string
  title: string
  slug: string
  type: string
  shortDescription?: string | null
  longDescription?: unknown
  curriculum?: {
    id?: string | null
    moduleTitle?: string | null
    lessons?: { id?: string | null; title?: string | null; duration?: string | null }[] | null
  }[] | null
  learningOutcomes?: { id?: string | null; outcome?: string | null }[] | null
  prerequisites?: { id?: string | null; prerequisite?: string | null }[] | null
  faqs?: { id?: string | null; question?: string | null; answer?: unknown }[] | null
  mentors?: PayloadMentor[] | null
  relatedProducts?: {
    id: string
    title: string
    slug: string
    type: string
    shortDescription?: string | null
    domain?: PayloadDomainRef
  }[] | null
  domain?: PayloadDomainRef
}

function getRelationshipSlug(value: PayloadDomainRef): string | undefined {
  if (!value || typeof value === 'string') return undefined
  return value.slug ?? undefined
}

function extractPlainText(value: unknown): string {
  const chunks: string[] = []

  const visit = (node: unknown) => {
    if (!node) return
    if (typeof node === 'string') {
      const text = node.trim()
      if (text) chunks.push(text)
      return
    }
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (typeof node === 'object') {
      const record = node as Record<string, unknown>
      if (typeof record.text === 'string') {
        const text = record.text.trim()
        if (text) chunks.push(text)
      }
      if (record.children) visit(record.children)
      if (record.root) visit(record.root)
      if (record.content) visit(record.content)
    }
  }

  visit(value)
  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug.replace(/-/g, ' ') }
}

export default async function ProductDetailPage({ params }: Props) {
  const { domain, type, slug } = await params
  const dbType = TYPE_MAP[type]
  if (!dbType) notFound()

  let product: (DBProduct & { domain_name: string; domain_slug: string }) | null = null
  let payloadProduct: PayloadProduct | null = null
  try {
    product = await queryOne<DBProduct & { domain_name: string; domain_slug: string }>(
      `SELECT p.*, d.name AS domain_name, d.slug AS domain_slug
       FROM products p JOIN domains d ON d.id = p.domain_id
       WHERE d.slug = $1 AND p.type = $2 AND p.slug = $3 AND p.status = 'published'`,
      [domain, dbType, slug]
    )
  } catch { /* DB unavailable */ }

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: {
        slug: { equals: slug },
        type: { equals: dbType },
        status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    })

    const candidate = result.docs[0] as PayloadProduct | undefined
    if (candidate && getRelationshipSlug(candidate.domain) === domain) {
      payloadProduct = candidate
    }
  } catch { /* Payload unavailable */ }

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
  const longDescription =
    extractPlainText(payloadProduct?.longDescription) ||
    product.long_description ||
    product.short_description ||
    'Full program details coming soon.'
  const learningOutcomes = payloadProduct?.learningOutcomes
    ?.map((item) => item.outcome?.trim())
    .filter(Boolean) as string[] | undefined
  const prerequisites = payloadProduct?.prerequisites
    ?.map((item) => item.prerequisite?.trim())
    .filter(Boolean) as string[] | undefined
  const faqs = payloadProduct?.faqs
    ?.map((item) => ({
      question: item.question?.trim() || '',
      answer: extractPlainText(item.answer) || 'Answer coming soon.',
    }))
    .filter((item) => item.question) ?? []
  const curriculum = payloadProduct?.curriculum?.filter((module) => module.moduleTitle) ?? []
  const mentors = payloadProduct?.mentors?.filter((mentor) => mentor?.name && mentor?.slug) ?? []
  const relatedProducts = (payloadProduct?.relatedProducts ?? [])
    .map((related) => {
      const relatedDomain = getRelationshipSlug(related.domain)
      if (!relatedDomain) return null
      const relatedType = related.type.replace('_', '-')
      return {
        id: related.id,
        title: related.title,
        description: related.shortDescription?.trim() || '',
        href: `/${relatedDomain}/${relatedType}/${related.slug}`,
      }
    })
    .filter(Boolean) as { id: string; title: string; description: string; href: string }[]

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
              <a href="#overview" className={`${styles.tab} ${styles.tabActive}`}>Overview</a>
              <a href="#curriculum" className={styles.tab}>Curriculum</a>
              <a href="#faq" className={styles.tab}>FAQ</a>
            </div>

            {/* Overview */}
            <section id="overview" className={styles.section}>
              <h2 className={styles.sectionTitle}>About this Program</h2>
              <p className={styles.bodyText}>{longDescription}</p>
            </section>

            {/* Outcomes */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What You'll Learn</h2>
              <div className={styles.outcomesList}>
                {(learningOutcomes?.length
                  ? learningOutcomes
                  : ['Master core concepts and practical applications',
                     'Work on real-world projects and case studies',
                     'Get mentored by industry experts',
                     'Earn a verified certificate upon completion']).map((o) => (
                  <div key={o} className={styles.outcomeItem}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum placeholder */}
            <section id="curriculum" className={styles.section}>
              <h2 className={styles.sectionTitle}>Curriculum</h2>
              {curriculum.length > 0 ? (
                <div className={styles.curriculumList}>
                  {curriculum.map((module, index) => (
                    <div key={module.id ?? module.moduleTitle ?? index} className={styles.curriculumCard}>
                      <div className={styles.curriculumHeader}>
                        <span className={styles.curriculumIndex}>{String(index + 1).padStart(2, '0')}</span>
                        <h3 className={styles.curriculumTitle}>{module.moduleTitle}</h3>
                      </div>
                      {module.lessons?.length ? (
                        <div className={styles.lessonList}>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id ?? `${module.moduleTitle}-${lessonIndex}`} className={styles.lessonRow}>
                              <span>{lesson.title || `Lesson ${lessonIndex + 1}`}</span>
                              {lesson.duration && <span className={styles.lessonDuration}>{lesson.duration}</span>}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.curriculumPlaceholder}>
                  <span>📋</span>
                  <p>Detailed curriculum will be available after enrollment.</p>
                </div>
              )}
            </section>

            {prerequisites?.length ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Prerequisites</h2>
                <div className={styles.infoList}>
                  {prerequisites.map((item) => (
                    <div key={item} className={styles.infoItem}>
                      <span className={styles.outcomeCheck}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {mentors.length ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Meet Your Mentors</h2>
                <div className={styles.mentorGrid}>
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className={styles.mentorCard}>
                      <div className={styles.mentorAvatar}>{mentor.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <h3 className={styles.mentorName}>{mentor.name}</h3>
                        {mentor.tagline && <p className={styles.mentorTagline}>{mentor.tagline}</p>}
                        {mentor.expertise?.length ? (
                          <p className={styles.mentorMeta}>
                            {mentor.expertise.map((item) => item.area).filter(Boolean).join(' • ')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section id="faq" className={styles.section}>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              {faqs.length ? (
                <div className={styles.faqList}>
                  {faqs.map((faq) => (
                    <div key={faq.question} className={styles.faqCard}>
                      <h3 className={styles.faqQuestion}>{faq.question}</h3>
                      <p className={styles.bodyText}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.curriculumPlaceholder}>
                  <span>❓</span>
                  <p>Program FAQs will appear here as soon as they are published.</p>
                </div>
              )}
            </section>

            {relatedProducts.length ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Related Programs</h2>
                <div className={styles.relatedGrid}>
                  {relatedProducts.map((related) => (
                    <Link key={related.id} href={related.href} className={styles.relatedCard}>
                      <h3 className={styles.relatedTitle}>{related.title}</h3>
                      {related.description && <p className={styles.relatedDesc}>{related.description}</p>}
                      <span className={styles.relatedLink}>View program →</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
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
