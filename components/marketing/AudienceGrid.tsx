import Link from 'next/link'
import styles from './AudienceGrid.module.css'

type AudienceCard = {
  id?: string
  slug: string
  name: string
  headline?: string | null
  subheadline?: string | null
}

type AudienceGridProps = {
  kicker?: string | null
  heading?: string | null
  body?: string | null
  audiences: AudienceCard[]
}

const EXCLUDED_SLUGS = new Set(['mentors'])

function getAudienceHref(slug: string) {
  return slug === 'mentors' ? '/mentors' : `/${slug}`
}

function getAudienceInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AudienceGrid({
  kicker,
  heading = 'Audience Pathways',
  body,
  audiences,
}: AudienceGridProps) {
  const items = audiences.filter((audience) => !EXCLUDED_SLUGS.has(audience.slug))
  if (items.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          {kicker ? <span className="badge badge-neutral">{kicker}</span> : null}
          <h2 className="text-h2">{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        <div className={styles.grid}>
          {items.map((audience) => (
            <Link
              key={audience.id ?? audience.slug}
              href={getAudienceHref(audience.slug)}
              className={`card card--hover card--glow ${styles.card}`}
            >
              <span className={styles.icon}>{getAudienceInitials(audience.name)}</span>
              <h3 className={styles.title}>{audience.name}</h3>
              <p className={styles.text}>{audience.subheadline || audience.headline || 'Explore pathway'}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
