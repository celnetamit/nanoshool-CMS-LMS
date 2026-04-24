import styles from './MentorGrid.module.css'

type MentorCard = {
  id: string
  name: string
  tagline?: string | null
  shortBio?: string | null
  designation?: string | null
  organization?: string | null
}

type MentorGridProps = {
  kicker?: string | null
  heading?: string
  body?: string | null
  mentors: MentorCard[]
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function MentorGrid({
  kicker,
  heading = 'Featured mentors',
  body,
  mentors,
}: MentorGridProps) {
  if (mentors.length === 0) return null

  return (
    <section className="section section--sm">
      <div className="container">
        <div className={styles.header}>
          {kicker ? <span className="badge badge-neutral">{kicker}</span> : null}
          <h2 className="text-h2">{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        <div className={styles.grid}>
          {mentors.map((mentor) => (
            <article key={mentor.id} className={`card ${styles.card}`}>
              <div className={styles.avatar}>{getInitials(mentor.name)}</div>
              <h3 className={styles.name}>{mentor.name}</h3>
              <p className={styles.meta}>
                {[mentor.designation, mentor.organization].filter(Boolean).join(', ') || mentor.tagline || 'Mentor'}
              </p>
              {(mentor.shortBio || mentor.tagline) ? <p className={styles.text}>{mentor.shortBio || mentor.tagline}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
