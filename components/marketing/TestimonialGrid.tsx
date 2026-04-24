import styles from './TestimonialGrid.module.css'

type TestimonialItem = {
  id: string
  name: string
  role?: string | null
  organization?: string | null
  quote: string
}

type TestimonialGridProps = {
  kicker?: string | null
  heading?: string | null
  body?: string | null
  testimonials: TestimonialItem[]
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TestimonialGrid({
  kicker,
  heading = 'Testimonials',
  body,
  testimonials,
}: TestimonialGridProps) {
  if (testimonials.length === 0) return null

  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          {kicker ? <span className="badge badge-neutral">{kicker}</span> : null}
          <h2 className="text-h2">{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className={`card ${styles.card}`}>
              <div className={styles.quoteMark}>“</div>
              <p className={styles.quote}>{testimonial.quote}</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{getInitials(testimonial.name)}</div>
                <div>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.meta}>
                    {[testimonial.role, testimonial.organization].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
