import styles from './DomainHighlights.module.css'

type DomainHighlight = {
  title: string
  description?: string | null
}

type DomainHighlightsProps = {
  heading?: string
  highlights: DomainHighlight[]
}

export function DomainHighlights({
  heading = 'Why this domain matters',
  highlights,
}: DomainHighlightsProps) {
  if (highlights.length === 0) return null

  return (
    <section className="section section--sm">
      <div className="container">
        <h2 className={styles.heading}>{heading}</h2>
        <div className={styles.grid}>
          {highlights.map((highlight) => (
            <article key={highlight.title} className={`card ${styles.card}`}>
              <h3>{highlight.title}</h3>
              {highlight.description ? <p>{highlight.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
