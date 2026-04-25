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
  const partnershipSignals = [
    'Curriculum and cohort collaboration',
    'Research-aware domain programming',
    'Enterprise capability partnerships',
  ]
  const collaborationModels = [
    'University pathway design and curriculum enrichment',
    'Enterprise cohort and workforce capability initiatives',
    'Research, mentor, and ecosystem-led program collaboration',
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <span className={`badge badge-primary ${styles.eyebrow}`}>Institutional and Industry Network</span>
          <h1 className={styles.title}>{page?.title || 'Partners'}</h1>
          <p className={styles.subtitle}>
            {page?.excerpt ||
              'We collaborate with universities, research institutions, and industry teams to deliver high-impact learning.'}
          </p>
          <p className={styles.lead}>
            The strongest NSTC partnerships combine domain credibility, public trust, and applied program design so learners, institutions, and operating teams can see a clearer path from knowledge to outcomes.
          </p>
          <div className={styles.signalRow}>
            {partnershipSignals.map((signal) => (
              <span key={signal} className={`badge badge-neutral ${styles.signalBadge}`}>{signal}</span>
            ))}
          </div>
          <div className={styles.ctaRow}>
            <Link href="/enterprise" className="btn btn-primary btn--lg">
              Enterprise Pathways
            </Link>
            <Link href="/university" className="btn btn-secondary btn--lg">
              University Collaborations
            </Link>
            <Link href="/join-us" className="btn btn-ghost btn--lg">
              Start a Partnership Conversation
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
              heading="A growing network of collaborators shaping credible domain pathways"
              body="NSTC partnerships are designed to connect curriculum, research context, mentorship, and workforce-readiness into one clearer public learning system."
              partners={partners}
            />
            <section className={styles.storyGrid}>
              <article className={`card ${styles.storyCard}`}>
                <h2>Why organizations partner with NSTC</h2>
                <p>
                  The platform is structured for institutions and operating teams that need more than a static course catalog. It supports multi-format programs, mentor visibility, and domain-specific pathway design across AI, Biotechnology, and Nanotechnology.
                </p>
              </article>
              <article className={`card ${styles.storyCard}`}>
                <h2>What collaboration can look like</h2>
                <p>
                  Partnerships can include university pathways, enterprise learning design, research-facing workshops, flagship cohorts, mentor participation, and stronger learner outcome positioning across public and institutional surfaces.
                </p>
              </article>
            </section>
            <section className={`card ${styles.modelsCard}`}>
              <h2>Common partnership models</h2>
              <div className={styles.modelsGrid}>
                {collaborationModels.map((model) => (
                  <div key={model} className={styles.modelItem}>{model}</div>
                ))}
              </div>
            </section>
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
                  <a key={partner.id} href={partner.website} target="_blank" rel="noreferrer" className={styles.cardLink}>
                    {card}
                  </a>
                ) : (
                  <div key={partner.id}>{card}</div>
                )
              })}
            </section>
            <section className={`card ${styles.contactCard}`}>
              <div>
                <h2>Exploring a collaboration?</h2>
                <p className={styles.partnerDescription}>
                  Share your organization type, domain interests, and the kind of program or capability outcome you want to build. We can route the conversation into academic, enterprise, or ecosystem collaboration.
                </p>
              </div>
              <div className={styles.contactActions}>
                <a href="mailto:support@nanostc.org?subject=NSTC%20Partnership%20Enquiry" className="btn btn-primary">
                  Email Partnership Team
                </a>
                <Link href="/join-us" className="btn btn-secondary">
                  View Collaboration Options
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
