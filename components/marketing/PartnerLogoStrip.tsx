import styles from './PartnerLogoStrip.module.css'

type PartnerItem = {
  id: string
  name: string
  website?: string | null
}

type PartnerLogoStripProps = {
  kicker?: string | null
  heading?: string | null
  body?: string | null
  partners: PartnerItem[]
}

export function PartnerLogoStrip({
  kicker,
  heading,
  body,
  partners,
}: PartnerLogoStripProps) {
  if (partners.length === 0) return null

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
        <div className={styles.strip}>
          {partners.map((partner) =>
            partner.website ? (
              <a key={partner.id} href={partner.website} target="_blank" rel="noreferrer" className={styles.item}>
                {partner.name}
              </a>
            ) : (
              <div key={partner.id} className={styles.item}>
                {partner.name}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
