import Link from 'next/link'
import type { CSSProperties } from 'react'
import styles from './DomainHero.module.css'

type DomainHeroProps = {
  name: string
  eyebrow: string
  title: string
  tagline?: string | null
  description?: string | null
  ctaLabel: string
  ctaUrl: string
  secondaryLabel: string
  secondaryUrl: string
  stats: Array<{ label: string; value: string }>
  accent: string
  crumbLabel?: string
}

export function DomainHero({
  name,
  eyebrow,
  title,
  tagline,
  description,
  ctaLabel,
  ctaUrl,
  secondaryLabel,
  secondaryUrl,
  stats,
  accent,
  crumbLabel,
}: DomainHeroProps) {
  return (
    <section className={styles.hero}>
      <div
        className={styles.heroBg}
        aria-hidden="true"
        style={{ '--domain-accent': accent } as CSSProperties}
      />
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span>
          <span>{crumbLabel || name}</span>
        </nav>
        <div className={styles.content}>
          <span className="badge" style={{ background: `${accent}18`, color: accent }}>
            {eyebrow}
          </span>
          <h1 className={styles.title}>{title}</h1>
          {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
          <div className={styles.actions}>
            <Link href={ctaUrl} className="btn btn-primary btn--lg">
              {ctaLabel}
            </Link>
            <Link href={secondaryUrl} className="btn btn-secondary btn--lg">
              {secondaryLabel}
            </Link>
          </div>
          {stats.length > 0 ? (
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className={styles.stat}>
                  <span className={styles.statValue} style={{ color: accent }}>
                    {stat.value}
                  </span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
