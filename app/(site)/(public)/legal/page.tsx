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

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <h1 className={styles.title}>{page?.title || 'Legal'}</h1>
          <p className={styles.subtitle}>
            {page?.excerpt || 'Policies and legal documentation for using NSTC platforms and services.'}
          </p>
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
              Reach the NSTC team for clarifications related to payments, privacy, consent, or platform access.
            </p>
          </div>
          <div className={styles.supportActions}>
            <a href="mailto:support@nanostc.org" className="btn btn-primary">Email Support</a>
            <a href="/partners" className="btn btn-secondary">Contact Partnerships</a>
          </div>
        </section>
      </div>
    </div>
  )
}
