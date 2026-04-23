import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'NSTC — AI, Biotechnology & Nanotechnology Learning Platform',
  description:
    'Accelerate your career with industry-led programs in AI, Biotechnology, and Nanotechnology. Learn from top mentors, earn certificates, and get job-ready.',
}

const DOMAINS = [
  {
    name: 'Artificial Intelligence',
    slug: 'ai',
    tagline: 'Machine Learning, Deep Learning, NLP & more',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    count: '40+ Programs',
    icon: '🤖',
  },
  {
    name: 'Biotechnology',
    slug: 'biotechnology',
    tagline: 'Genomics, Proteomics, Bioinformatics & more',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    count: '25+ Programs',
    icon: '🧬',
  },
  {
    name: 'Nanotechnology',
    slug: 'nanotechnology',
    tagline: 'Nanomaterials, Nanoelectronics & more',
    color: '#22d3ee',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))',
    count: '20+ Programs',
    icon: '⚗️',
  },
]

const PRODUCT_TYPES = [
  { label: 'Courses', icon: '📚', desc: 'Structured learning paths' },
  { label: 'Workshops', icon: '🛠️', desc: 'Intensive hands-on sessions' },
  { label: 'Internships', icon: '💼', desc: 'Real-world experience' },
  { label: 'Flagship Programs', icon: '🏆', desc: 'Comprehensive end-to-end' },
  { label: 'Packages', icon: '📦', desc: 'Bundled learning tracks' },
]

const STATS = [
  { value: '10,000+', label: 'Learners Trained' },
  { value: '200+', label: 'Industry Mentors' },
  { value: '500+', label: 'Programs Offered' },
  { value: '95%', label: 'Placement Rate' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'ML Engineer at Google',
    text: 'The AI Flagship Program completely transformed my career. The mentorship quality is unmatched.',
    avatar: 'PS',
    domain: 'AI',
  },
  {
    name: 'Rahul Mehta',
    role: 'Research Scientist at Pfizer',
    text: 'NSTC\'s Biotechnology program gave me real lab exposure and connected me with top researchers.',
    avatar: 'RM',
    domain: 'Biotech',
  },
  {
    name: 'Aisha Patel',
    role: 'PhD Candidate, IIT Delhi',
    text: 'The Nanotechnology internship was the stepping stone I needed. Highly practical curriculum.',
    avatar: 'AP',
    domain: 'Nanotech',
  },
]

const PARTNERS = ['IIT Delhi', 'DRDO', 'ISRO', 'Pfizer', 'Google', 'Microsoft', 'TCS', 'Infosys']

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className="badge badge-primary">🚀 India's Premier Science & Tech Learning Platform</span>
            </div>
            <h1 className={styles.heroTitle}>
              Master{' '}
              <span className="text-gradient">Emerging Technologies</span>
              <br />
              That Shape the Future
            </h1>
            <p className={styles.heroSubtitle}>
              Learn AI, Biotechnology & Nanotechnology from India's top researchers and industry leaders.
              Get certified, get placed, get ahead.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/ai" className="btn btn-primary btn--lg">
                Explore Programs →
              </Link>
              <Link href="/mentors" className="btn btn-secondary btn--lg">
                Meet Our Mentors
              </Link>
            </div>
            <div className={styles.heroStats}>
              {STATS.map((s) => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{s.value}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Domains ──────────────────────────────────── */}
      <section className={`${styles.section} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="badge badge-neutral">Our Domains</span>
            <h2 className="text-h2">Choose Your Field of Mastery</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 560 }}>
              Three cutting-edge domains. Hundreds of programs. One platform built for the future of science.
            </p>
          </div>
          <div className={styles.domainGrid}>
            {DOMAINS.map((d) => (
              <Link key={d.slug} href={`/${d.slug}`} className={styles.domainCard}>
                <div className={styles.domainCardBg} style={{ background: d.gradient }} />
                <div className={styles.domainIcon}>{d.icon}</div>
                <div className={styles.domainCardContent}>
                  <span className={styles.domainBadge} style={{ color: d.color, background: `${d.color}18` }}>
                    {d.count}
                  </span>
                  <h3 className={styles.domainName}>{d.name}</h3>
                  <p className={styles.domainTagline}>{d.tagline}</p>
                  <div className={styles.domainArrow} style={{ color: d.color }}>
                    Explore Domain →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Product Types ────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="badge badge-neutral">Learning Formats</span>
            <h2 className="text-h2">Programs Designed for Every Goal</h2>
          </div>
          <div className={styles.typesGrid}>
            {PRODUCT_TYPES.map((t) => (
              <div key={t.label} className={`card card--hover ${styles.typeCard}`}>
                <div className={styles.typeIcon}>{t.icon}</div>
                <h4 className={styles.typeLabel}>{t.label}</h4>
                <p className={styles.typeDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For Who ──────────────────────────────────── */}
      <section className={`${styles.section} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="badge badge-neutral">Who It's For</span>
            <h2 className="text-h2">Built for Every Stage of Your Journey</h2>
          </div>
          <div className={styles.audienceGrid}>
            {[
              { label: 'Students', href: '/students', desc: 'Build industry skills before graduation', icon: '🎓' },
              { label: 'Enterprise', href: '/enterprise', desc: 'Upskill your team at scale', icon: '🏢' },
              { label: 'University', href: '/university', desc: 'Integrate into your curriculum', icon: '🏛️' },
              { label: 'PhD & Professors', href: '/phd-professors', desc: 'Collaborate on research programs', icon: '🔬' },
              { label: 'Hiring Partners', href: '/hiring-partners', desc: 'Hire from our talent pool', icon: '🤝' },
            ].map((a) => (
              <Link key={a.href} href={a.href} className={`card card--hover card--glow ${styles.audienceCard}`}>
                <span className={styles.audienceIcon}>{a.icon}</span>
                <h4 className={styles.audienceLabel}>{a.label}</h4>
                <p className={styles.audienceDesc}>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partners ─────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt} section--sm`}>
        <div className="container">
          <p className={styles.partnersLabel}>Trusted by leading institutions & companies</p>
          <div className={styles.partnerStrip}>
            {PARTNERS.map((p) => (
              <div key={p} className={styles.partnerLogo}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────── */}
      <section className={`${styles.section} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="badge badge-neutral">Testimonials</span>
            <h2 className="text-h2">Learners Who Made It</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={`card ${styles.testimonialCard}`}>
                <div className={styles.testimonialQuote}>"</div>
                <p className={styles.testimonialText}>{t.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                  <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{t.domain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────── */}
      <section className={`${styles.finalCta} section`}>
        <div className="container">
          <div className={styles.finalCtaInner}>
            <div className={styles.finalCtaBg} aria-hidden="true" />
            <h2 className={styles.finalCtaTitle}>Start Your Journey Today</h2>
            <p className={styles.finalCtaSubtitle}>
              Explore programs across AI, Biotechnology & Nanotechnology.
              <br />
              Get certified. Get hired. Get ahead.
            </p>
            <div className={styles.finalCtaButtons}>
              <Link href="/ai/courses" className="btn btn-primary btn--lg">Browse AI Courses</Link>
              <Link href="/ai/internships" className="btn btn-secondary btn--lg">View Internships</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
