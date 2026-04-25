import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLegalDocument } from '@/lib/cms/public/getLegalDocument'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText, extractTextBlocks } from '@/lib/cms/public/richText'
import styles from './legal.module.css'

type Props = { params: Promise<{ slug: string }> }

type LegalDoc = {
  title: string
  slug: string
  version?: string | null
  effectiveDate?: string | null
  content?: unknown
  seo?: { title?: string | null; description?: string | null } | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getLegalDocument(slug)
  const doc = result.document as LegalDoc | null

  if (!doc) {
    return {
      title: 'Legal Document Not Found',
      robots: { index: false, follow: false },
    }
  }

  return buildSeoMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: extractPlainText(doc.content).slice(0, 160) || doc.title,
    canonicalPath: `/legal/${slug}`,
  })
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params
  const result = await getLegalDocument(slug)
  const doc = result.document as LegalDoc | null
  const allDocuments = result.allDocuments as LegalDoc[]

  if (!doc) notFound()

  const blocks = extractTextBlocks(doc.content)
  const fallbackText = extractPlainText(doc.content)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <article className={styles.article}>
            <header className={styles.header}>
              <h1 className={styles.title}>{doc.title}</h1>
              <div className={styles.meta}>
                {doc.version && <span>Version {doc.version}</span>}
                {doc.version && doc.effectiveDate && <span>·</span>}
                {doc.effectiveDate && (
                  <span>
                    Effective{' '}
                    {new Date(doc.effectiveDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </header>

            <div className={styles.content}>
              {(blocks.length > 0 ? blocks : [fallbackText]).filter(Boolean).map((block) => (
                <p key={block}>{block}</p>
              ))}
            </div>
          </article>

          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Legal Documents</h3>
            {allDocuments.map((item) => (
              <Link
                key={item.slug}
                href={`/legal/${item.slug}`}
                className={`${styles.sidebarLink} ${item.slug === slug ? styles.sidebarLinkActive : ''}`}
              >
                {item.title}
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
