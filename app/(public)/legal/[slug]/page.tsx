import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { queryOne } from '@/lib/db'
import styles from './legal.module.css'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    robots: { index: true, follow: true },
  }
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params

  let doc: { title: string; content: string; version: string; effective_date: string } | null = null
  try {
    doc = await queryOne(
      'SELECT title, content, version, effective_date FROM legal_documents WHERE slug = $1',
      [slug]
    ) as { title: string; content: string; version: string; effective_date: string } | null
  } catch { /* DB unavailable */ }

  if (!doc) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Document Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>This legal document is not available yet.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <article className={styles.article}>
            <header className={styles.header}>
              <h1 className={styles.title}>{doc.title}</h1>
              <div className={styles.meta}>
                <span>Version {doc.version}</span>
                <span>·</span>
                <span>Effective {new Date(doc.effective_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </header>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: doc.content }} />
          </article>

          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Legal Documents</h3>
            {[
              { label: 'Privacy Policy', slug: 'privacy-policy' },
              { label: 'Refund Policy', slug: 'refund-policy' },
              { label: 'Cancellation Policy', slug: 'cancellation-policy' },
              { label: 'Payment Policy', slug: 'payment-policy' },
              { label: 'Consent Policy', slug: 'consent-policy' },
            ].map((l) => (
              <a key={l.slug} href={`/legal/${l.slug}`}
                className={`${styles.sidebarLink} ${l.slug === slug ? styles.sidebarLinkActive : ''}`}>
                {l.label}
              </a>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
