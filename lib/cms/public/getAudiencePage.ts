import { extractPlainText } from './richText'
import { getPublicPayload } from './payload'
import type { ProductType } from '@/types'

type AudienceDoc = {
  id: string
  slug: string
  name: string
  headline?: string | null
  subheadline?: string | null
  landingContent?: unknown
  seo?: { title?: string | null; description?: string | null } | null
  domainOverrides?: Array<{
    domain?: { slug?: string | null } | string | null
    headline?: string | null
    subheadline?: string | null
    landingContent?: unknown
    featuredProducts?:
      | Array<{
          id: string
          title: string
          slug: string
          type: ProductType
          shortDescription?: string | null
          price?: number | null
          salePrice?: number | null
          duration?: string | null
          level?: string | null
          format?: string | null
          certificate?: boolean | null
          domain?: { name?: string | null; slug?: string | null } | string | null
        }>
      | null
    featuredMentors?:
      | Array<{
          id: string
          name: string
          tagline?: string | null
          shortBio?: string | null
          designation?: string | null
          organization?: string | null
        }>
      | null
  }> | null
}

type AudienceDomainOverride = NonNullable<AudienceDoc['domainOverrides']>[number]

function getDomainSlug(value: AudienceDomainOverride): string | null {
  if (!value.domain) return null
  if (typeof value.domain === 'string') return value.domain
  return value.domain.slug ?? null
}

export async function getAudiencePage(slug: string, domainSlug?: string) {
  try {
    const payload = await getPublicPayload()
    const result = await payload.find({
      collection: 'audiences',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    })

    const audience = (result.docs[0] as AudienceDoc | undefined) ?? null
    if (!audience) return null

    const override =
      domainSlug == null
        ? null
        : (audience.domainOverrides ?? []).find((item) => getDomainSlug(item) === domainSlug) ?? null

    return {
      audience,
      override,
      plainContent: extractPlainText(override?.landingContent ?? audience.landingContent),
      seo: audience.seo ?? null,
    }
  } catch (error) {
    console.error(`[CMS] Failed to load audience page for slug "${slug}":`, error)
    return null
  }
}
