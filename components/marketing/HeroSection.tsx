import Link from 'next/link'
import type { CSSProperties } from 'react'
import styles from './HeroSection.module.css'

type HeroStat = {
  label: string
  value: string
}

type HeroAction = {
  label: string
  href: string
}

type HeroSectionProps = {
  eyebrow?: string | null
  title: string
  description?: string | null
  primaryAction?: HeroAction | null
  secondaryAction?: HeroAction | null
  stats?: HeroStat[]
  align?: 'center' | 'left'
  accent?: string
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  stats = [],
  align = 'center',
  accent = '#6366f1',
}: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <div
        className={styles.heroBg}
        aria-hidden="true"
        style={{ '--hero-accent': accent } as CSSProperties}
      />
      <div className="container">
        <div className={`${styles.content} ${align === 'left' ? styles.left : styles.center}`}>
          {eyebrow ? (
            <div className={styles.eyebrowWrap}>
              <span className="badge badge-primary">{eyebrow}</span>
            </div>
          ) : null}
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
          {(primaryAction || secondaryAction) ? (
            <div className={styles.actions}>
              {primaryAction ? (
                <Link href={primaryAction.href} className="btn btn-primary btn--lg">
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link href={secondaryAction.href} className="btn btn-secondary btn--lg">
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
          {stats.length > 0 ? (
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className={styles.stat}>
                  <span className={styles.statValue}>{stat.value}</span>
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
