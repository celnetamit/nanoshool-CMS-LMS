import { extractPlainText } from './richText'
import { getPublicPayload } from './payload'

type DomainOverride = {
  id: string
  slug: string
  name: string
  tagline?: string | null
  overview?: unknown
  seo?: { title?: string | null; description?: string | null } | null
}

export async function getDomainPage(slug: string) {
  try {
    const payload = await getPublicPayload()
    const result = await payload.find({
      collection: 'domains',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    })

    const domain = (result.docs[0] as DomainOverride | undefined) ?? null
    if (!domain) return null

    return {
      domain,
      plainOverview: extractPlainText(domain.overview),
      seo: domain.seo ?? null,
    }
  } catch (error) {
    console.error(`[CMS] Failed to load domain page for slug "${slug}":`, error)
    return null
  }
}
