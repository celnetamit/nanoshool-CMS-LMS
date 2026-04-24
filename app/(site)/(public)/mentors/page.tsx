import type { Metadata } from 'next'
import Link from 'next/link'
import { MentorGrid } from '@/components/mentors/MentorGrid'
import { getMentorsPage } from '@/lib/cms/public/getMentorsPage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import styles from './mentors.module.css'

type PayloadDomainRef = { id: string; name?: string | null; slug?: string | null }
type PayloadMentor = {
  id: string
  name: string
  slug: string
  tagline?: string | null
  shortBio?: string | null
  bio?: unknown
  expertise?: Array<{ area?: string | null }> | null
  domains?: PayloadDomainRef[] | null
  designation?: string | null
  organization?: string | null
}

type PayloadPage = {
  title?: string | null
  excerpt?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getMentorsPage()
  const page = result.page as PayloadPage | null

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: page?.title || 'Mentors — NSTC',
    fallbackDescription:
      page?.excerpt || 'Meet mentors shaping programs across AI, Biotechnology, and Nanotechnology.',
    canonicalPath: '/mentors',
  })
}

export default async function MentorsPage() {
  const result = await getMentorsPage()
  const page = result.page as PayloadPage | null
  const mentors = result.mentors as PayloadMentor[]
  const domainChips = Array.from(
    new Map(
      mentors
        .flatMap((mentor) => mentor.domains ?? [])
        .map((domain) => [domain?.slug || domain?.name || domain?.id, domain] as const)
        .filter((entry) => entry[0])
    ).values()
  )

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <h1>{page?.title || 'Mentors'}</h1>
          <p className={styles.subtitle}>
            {page?.excerpt || 'Meet industry mentors guiding NSTC learners across AI, Biotechnology, and Nanotechnology.'}
          </p>
          {domainChips.length > 0 ? (
            <div className={styles.filters}>
              {domainChips.map((domain) =>
                domain?.slug ? (
                  <Link key={domain.id} href={`/${domain.slug}`} className={styles.filterChip}>
                    {domain.name || domain.slug}
                  </Link>
                ) : null
              )}
            </div>
          ) : null}
        </section>

        {mentors.length === 0 ? (
          <section className={styles.empty}>
            <h3>No mentors published yet</h3>
            <p>Add mentors from Payload CMS to make this directory live.</p>
            <div className={styles.actions}>
              <Link href="/admin/collections/mentors" className="btn btn-primary">Open Mentors in CMS</Link>
            </div>
          </section>
        ) : (
          <MentorGrid
            kicker="Mentor network"
            heading={page?.title || 'Mentors'}
            body={page?.excerpt || 'Meet industry mentors guiding NSTC learners across AI, Biotechnology, and Nanotechnology.'}
            mentors={mentors.map((mentor) => ({
              id: mentor.id,
              name: mentor.name,
              tagline: mentor.tagline,
              shortBio: mentor.shortBio,
              designation: mentor.designation,
              organization: mentor.organization,
            }))}
          />
        )}
      </div>
    </div>
  )
}
