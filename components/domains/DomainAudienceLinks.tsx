import Link from 'next/link'
import styles from './DomainAudienceLinks.module.css'

type DomainAudienceLink = {
  slug?: string | null
  name?: string | null
}

type DomainAudienceLinksProps = {
  domainSlug: string
  items: DomainAudienceLink[]
}

export function DomainAudienceLinks({
  domainSlug,
  items,
}: DomainAudienceLinksProps) {
  if (items.length === 0) return null

  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.label}>Audience pathways in this domain</p>
        <div className={styles.strip}>
          {items.map((item) =>
            item.slug ? (
              <Link key={item.slug} href={`/${domainSlug}/${item.slug}`} className={styles.chip}>
                {item.name || item.slug} →
              </Link>
            ) : null
          )}
        </div>
      </div>
    </section>
  )
}
