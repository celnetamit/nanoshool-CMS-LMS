import Link from 'next/link'
import styles from './LegalDocumentList.module.css'

type LegalDocument = {
  id: string
  title: string
  slug: string
  version?: string | null
  effectiveDate?: string | null
}

type LegalDocumentListProps = {
  documents: LegalDocument[]
}

export function LegalDocumentList({ documents }: LegalDocumentListProps) {
  if (documents.length === 0) return null

  return (
    <div className={styles.grid}>
      {documents.map((item) => (
        <Link key={item.id} href={`/legal/${item.slug}`} className={`card card--hover ${styles.card}`}>
          <span>{item.title}</span>
          <span className={styles.meta}>
            {[item.version, item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString('en-IN') : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </Link>
      ))}
    </div>
  )
}
