import styles from './StatsStrip.module.css'

type StatItem = {
  label: string
  value: string
}

type StatsStripProps = {
  kicker?: string | null
  heading?: string | null
  body?: string | null
  items: StatItem[]
}

export function StatsStrip({ kicker, heading, body, items }: StatsStripProps) {
  if (items.length === 0) return null

  return (
    <section className="section section--sm">
      <div className="container">
        {(kicker || heading || body) ? (
          <div className={styles.header}>
            {kicker ? <span className="badge badge-neutral">{kicker}</span> : null}
            {heading ? <h2 className="text-h2">{heading}</h2> : null}
            {body ? <p>{body}</p> : null}
          </div>
        ) : null}
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={`${item.label}-${item.value}`} className={`card ${styles.card}`}>
              <span className={styles.value}>{item.value}</span>
              <span className={styles.label}>{item.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
