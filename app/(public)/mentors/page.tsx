import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import styles from './mentors.module.css'

type PayloadDomainRef = { id: string; name?: string | null; slug?: string | null }
type RichTextLeaf = { text?: string }
type RichTextNode = { children?: RichTextLeaf[] }
type PayloadMentor = {
  id: string
  name: string
  slug: string
  tagline?: string | null
  bio?: {
    root?: {
      children?: Array<{ children?: Array<{ text?: string }> }>
    }
  } | null
  expertise?: Array<{ area?: string | null }> | null
  domains?: PayloadDomainRef[] | null
}

export const metadata: Metadata = {
  title: 'Mentors — NSTC',
  description: 'Meet mentors shaping programs across AI, Biotechnology, and Nanotechnology.',
}

function extractPlainText(
  node: { root?: { children?: RichTextNode[] } } | undefined | null
): string {
  if (!node) return ''
  const lines: string[] = []

  const rootChildren = node.root?.children ?? []
  for (const block of rootChildren) {
    const text = (block.children ?? []).map((child: RichTextLeaf) => child.text ?? '').join('').trim()
    if (text) lines.push(text)
  }

  return lines.join(' ').trim()
}

async function getMentors(): Promise<PayloadMentor[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'mentors',
      limit: 120,
      sort: 'name',
      depth: 1,
    })
    return result.docs as PayloadMentor[]
  } catch (error) {
    console.error('[Mentors] Failed to load mentors from Payload:', error)
    return []
  }
}

export default async function MentorsPage() {
  const mentors = await getMentors()

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <h1>Mentors</h1>
          <p className={styles.subtitle}>
            Meet industry mentors guiding NSTC learners across AI, Biotechnology, and Nanotechnology.
          </p>
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
          <section className={styles.grid}>
            {mentors.map((mentor) => {
              const bio = extractPlainText(mentor.bio).slice(0, 220)
              const expertise = (mentor.expertise ?? []).map((item) => item.area?.trim()).filter(Boolean) as string[]
              const domains = (mentor.domains ?? [])
                .map((domain) => domain?.name?.trim() || domain?.slug?.trim())
                .filter(Boolean) as string[]

              return (
                <article key={mentor.id} className={`card ${styles.card}`}>
                  <div className={styles.avatar}>{mentor.name.charAt(0).toUpperCase()}</div>
                  <h3 className={styles.name}>{mentor.name}</h3>
                  {mentor.tagline && <p className={styles.tagline}>{mentor.tagline}</p>}
                  {bio && <p className={styles.bio}>{bio}</p>}

                  {expertise.length > 0 && (
                    <div className={styles.chips}>
                      {expertise.slice(0, 5).map((item) => (
                        <span key={item} className="badge badge-neutral">{item}</span>
                      ))}
                    </div>
                  )}

                  {domains.length > 0 && (
                    <div className={styles.domains}>
                      {domains.map((domainName) => (
                        <span key={domainName} className="badge badge-accent">{domainName}</span>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
