import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './domain.module.css'

const DOMAIN_DATA: Record<string, {
  name: string; tagline: string; description: string;
  color: string; gradient: string; icon: string;
  stats: { value: string; label: string }[];
  faqs: { q: string; a: string }[];
}> = {
  ai: {
    name: 'Artificial Intelligence',
    tagline: 'Build the intelligent systems of tomorrow',
    description: 'From Machine Learning to Generative AI, our AI programs are designed with leading researchers and industry practitioners to give you real, applicable skills.',
    color: '#6366f1', gradient: 'rgba(99,102,241,0.12)', icon: '🤖',
    stats: [
      { value: '40+', label: 'Programs' }, { value: '80+', label: 'Mentors' },
      { value: '5,000+', label: 'AI Learners' }, { value: '92%', label: 'Placement Rate' },
    ],
    faqs: [
      { q: 'Do I need a programming background for AI courses?', a: 'Most beginner courses require basic Python knowledge. We also offer foundation tracks for absolute beginners.' },
      { q: 'Are certificates industry-recognized?', a: 'Yes. Our certificates are recognized by 200+ partner companies including top tech firms.' },
      { q: 'Can I switch between self-paced and live cohorts?', a: 'Each program has a fixed format. Check the product page for format details.' },
    ],
  },
  biotechnology: {
    name: 'Biotechnology',
    tagline: 'Decode life. Engineer solutions.',
    description: 'Explore genomics, proteomics, bioinformatics, and drug discovery. Work on real research problems with India\'s leading biotech scientists.',
    color: '#22c55e', gradient: 'rgba(34,197,94,0.12)', icon: '🧬',
    stats: [
      { value: '25+', label: 'Programs' }, { value: '50+', label: 'Mentors' },
      { value: '3,000+', label: 'Learners' }, { value: '88%', label: 'Placement Rate' },
    ],
    faqs: [
      { q: 'Are lab sessions included?', a: 'Select programs include virtual lab simulations. Flagship programs include in-person lab visits at partner institutions.' },
      { q: 'What background do I need?', a: 'A basic understanding of biology or chemistry is helpful. Detailed prerequisites are listed on each product page.' },
    ],
  },
  nanotechnology: {
    name: 'Nanotechnology',
    tagline: 'Engineering at the atomic scale.',
    description: 'Dive into nanomaterials, nanoelectronics, and nano-medicine. Build expertise in one of the fastest-growing fields in applied science.',
    color: '#22d3ee', gradient: 'rgba(34,211,238,0.12)', icon: '⚗️',
    stats: [
      { value: '20+', label: 'Programs' }, { value: '35+', label: 'Mentors' },
      { value: '2,000+', label: 'Learners' }, { value: '85%', label: 'Placement Rate' },
    ],
    faqs: [
      { q: 'Is nanotechnology suitable for undergraduate students?', a: 'Absolutely. We have beginner, intermediate, and advanced tracks designed for different experience levels.' },
    ],
  },
}

const PRODUCT_CATEGORIES = [
  { label: 'Courses', slug: 'courses', icon: '📚', desc: 'Structured curriculum' },
  { label: 'Workshops', slug: 'workshops', icon: '🛠️', desc: 'Intensive sessions' },
  { label: 'Internships', slug: 'internships', icon: '💼', desc: 'Real-world projects' },
  { label: 'Flagship Programs', slug: 'flagship-programs', icon: '🏆', desc: 'End-to-end mastery' },
  { label: 'Packages', slug: 'packages', icon: '📦', desc: 'Bundled tracks' },
]

const AUDIENCE_STRIP = [
  { label: 'Enterprise', slug: 'enterprise' },
  { label: 'University', slug: 'university' },
  { label: 'Students', slug: 'students' },
  { label: 'PhD & Professors', slug: 'phd-professors' },
  { label: 'Hiring Partners', slug: 'hiring-partners' },
]

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const data = DOMAIN_DATA[domain]
  if (!data) return {}
  return {
    title: `${data.name} Courses, Programs & Internships`,
    description: data.description,
  }
}

export function generateStaticParams() {
  return Object.keys(DOMAIN_DATA).map((domain) => ({ domain }))
}

export default async function DomainPage({ params }: Props) {
  const { domain } = await params
  const data = DOMAIN_DATA[domain]
  if (!data) notFound()

  return (
    <div>
      {/* ─── Hero ──────────────────────────────────── */}
      <section className={styles.hero} style={{ '--domain-color': data.color, '--domain-gradient': data.gradient } as React.CSSProperties}>
        <div className={styles.heroBg} />
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span>/</span>
            <span>{data.name}</span>
          </nav>
          <div className={styles.heroContent}>
            <span className={styles.heroIcon}>{data.icon}</span>
            <div className={styles.heroBadge}>
              <span className="badge" style={{ background: `${data.color}18`, color: data.color }}>
                {data.stats[0].value} Programs Available
              </span>
            </div>
            <h1 className={styles.heroTitle}>{data.name}</h1>
            <p className={styles.heroTagline}>{data.tagline}</p>
            <p className={styles.heroDesc}>{data.description}</p>
            <div className={styles.heroCtas}>
              <Link href={`/${domain}/courses`} className="btn btn-primary btn--lg">
                Browse Courses →
              </Link>
              <Link href={`/${domain}/flagship-programs`} className="btn btn-secondary btn--lg">
                Flagship Programs
              </Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            {data.stats.map((s) => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatValue} style={{ color: data.color }}>{s.value}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category Cards ─────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className={styles.sectionTitle}>Explore by Format</h2>
          <div className={styles.categoryGrid}>
            {PRODUCT_CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/${domain}/${c.slug}`} className={`card card--hover ${styles.categoryCard}`}>
                <span className={styles.categoryIcon}>{c.icon}</span>
                <div>
                  <h3 className={styles.categoryLabel}>{c.label}</h3>
                  <p className={styles.categoryDesc}>{c.desc}</p>
                </div>
                <span className={styles.categoryArrow} style={{ color: data.color }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Audience Strip ──────────────────────────── */}
      <section className={styles.audienceSection}>
        <div className="container">
          <p className={styles.audienceLabel}>Tailored programs for every learner type:</p>
          <div className={styles.audienceStrip}>
            {AUDIENCE_STRIP.map((a) => (
              <Link key={a.slug} href={`/${domain}/${a.slug}`} className={styles.audienceChip}>
                {a.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────── */}
      <section className="section section--sm">
        <div className="container">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Frequently Asked Questions
            </h2>
            {data.faqs.map((faq, i) => (
              <details key={i} className={styles.faq}>
                <summary className={styles.faqQuestion}>{faq.q}</summary>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner} style={{ borderColor: `${data.color}30`, background: `linear-gradient(135deg, ${data.color}10, transparent)` }}>
            <h2>Ready to master {data.name}?</h2>
            <p>Join thousands of learners already on the path.</p>
            <Link href={`/${domain}/courses`} className="btn btn-primary btn--lg" style={{ background: `linear-gradient(135deg, ${data.color}, ${data.color}cc)` }}>
              Get Started →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
