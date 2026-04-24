import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnerLogoStrip } from '@/components/marketing/PartnerLogoStrip'
import { getPartnersPage } from '@/lib/cms/public/getPartnersPage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import styles from './partners.module.css'

type PartnerPageDoc = {
  title?: string | null
  excerpt?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

type PartnerDoc = {
  id: string
  name: string
  partnerType?: string | null
  shortDescription?: string | null
  website?: string | null
}

function formatPartnerType(value: string | null | undefined) {
  if (!value) return 'Partner'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPartnersPage()
  const page = result.page as PartnerPageDoc | null

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: page?.title || 'Partners — NSTC',
    fallbackDescription:
      page?.excerpt || 'Institutional and industry partners collaborating with NSTC programs.',
    canonicalPath: '/partners',
  })
}

export default async function PartnersPage() {
  const result = await getPartnersPage()
  const page = result.page as PartnerPageDoc | null
  const partners = result.partners as PartnerDoc[]

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <h1 className={styles.title}>{page?.title || 'Partners'}</h1>
          <p className={styles.subtitle}>
            {page?.excerpt ||
              'We collaborate with universities, research institutions, and industry teams to deliver high-impact learning.'}
          </p>
          <div className={styles.ctaRow}>
            <Link href="/enterprise" className="btn btn-primary btn--lg">
              Enterprise Pathways
            </Link>
            <Link href="/university" className="btn btn-secondary btn--lg">
              University Collaborations
            </Link>
          </div>
        </section>

        {partners.length === 0 ? (
          <section className={`card ${styles.empty}`}>
            <h3>No partners published yet</h3>
            <p className={styles.partnerDescription}>
              Publish partner entries in Payload to make this page fully populated.
            </p>
          </section>
        ) : (
          <>
            <PartnerLogoStrip
              kicker="Partner ecosystem"
              heading="A growing network of institutional and industry collaborators"
              body="Use this surface to establish trust quickly, then move people into the audience pathways that fit their context."
              partners={partners}
            />
            <section className={styles.grid}>
              {partners.map((partner) => {
                const card = (
                  <article className={`card ${styles.card}`}>
                    <span className={`badge badge-neutral ${styles.partnerType}`}>{formatPartnerType(partner.partnerType)}</span>
                    <h3 className={styles.partnerName}>{partner.name}</h3>
                    {partner.shortDescription && <p className={styles.partnerDescription}>{partner.shortDescription}</p>}
                  </article>
                )

                return partner.website ? (
                  <a key={partner.id} href={partner.website} target="_blank" rel="noreferrer">
                    {card}
                  </a>
                ) : (
                  <div key={partner.id}>{card}</div>
                )
              })}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
