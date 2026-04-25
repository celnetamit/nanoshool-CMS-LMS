import type { Metadata } from 'next'
import { LegalDocumentList } from '@/components/legal/LegalDocumentList'
import { getLegalIndex } from '@/lib/cms/public/getLegalIndex'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import styles from './index.module.css'

type LegalPageDoc = {
  title?: string | null
  excerpt?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

type LegalDocument = {
  id: string
  title: string
  slug: string
  version?: string | null
  effectiveDate?: string | null
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getLegalIndex()
  const page = result.page as LegalPageDoc | null

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: page?.title || 'Legal — NSTC',
    fallbackDescription:
      page?.excerpt || 'Review all legal policies, terms, and compliance documents.',
    canonicalPath: '/legal',
  })
}

export default async function LegalIndexPage() {
  const result = await getLegalIndex()
  const page = result.page as LegalPageDoc | null
  const documents = result.documents as LegalDocument[]
  const guidanceItems = [
    {
      title: 'Before enrollment',
      body: 'Review payment, cancellation, and refund expectations before purchasing a program or reserving a cohort seat.',
    },
    {
      title: 'During platform use',
      body: 'Use the privacy and consent documents to understand how NSTC handles account, access, communication, and operational workflows.',
    },
    {
      title: 'For institutions and partners',
      body: 'Public policies describe the general platform model, while enterprise or institutional engagements may also follow separately agreed commercial terms.',
    },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <span className={`badge badge-primary ${styles.eyebrow}`}>Platform Policies and Terms</span>
          <h1 className={styles.title}>{page?.title || 'Legal'}</h1>
          <p className={styles.subtitle}>
            {page?.excerpt || 'Policies and legal documentation for using NSTC platforms and services.'}
          </p>
        </section>
        <section className={styles.guidanceGrid}>
          {guidanceItems.map((item) => (
            <article key={item.title} className={`card ${styles.guidanceCard}`}>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </section>
        {documents.length > 0 ? (
          <LegalDocumentList documents={documents} />
        ) : (
          <section className={styles.empty}>
            <h3>No legal documents published yet</h3>
            <p>Publish legal documents in Payload to make this trust surface fully discoverable.</p>
          </section>
        )}

        <section className={styles.supportCard}>
          <div>
            <h2 className={styles.supportTitle}>Need help with a policy or platform question?</h2>
            <p className={styles.supportText}>
              Reach the NSTC team for clarification on payments, refunds, privacy, consent, enrollment access, or institution-specific operating terms.
            </p>
          </div>
          <div className={styles.supportActions}>
            <a href="mailto:support@nanostc.org" className="btn btn-primary">Email Support</a>
            <a href="/partners" className="btn btn-secondary">Partnership Questions</a>
          </div>
        </section>
      </div>
    </div>
  )
}
