import type { Metadata } from 'next'
import { getPublicSiteUrl, normalizeMetadataTitle } from '@/lib/site/publicSite'

type SeoLike = {
  title?: string | null
  description?: string | null
  ogImage?: unknown
}

type BuildSeoMetadataInput = {
  seo?: SeoLike | null
  fallbackTitle: string
  fallbackDescription: string
  canonicalPath?: string
}

function resolveOgImage(ogImage: unknown): string | undefined {
  if (!ogImage) return undefined
  if (typeof ogImage === 'string') return ogImage
  if (typeof ogImage === 'object' && ogImage && 'url' in ogImage && typeof ogImage.url === 'string') {
    return ogImage.url
  }
  return undefined
}

export function buildSeoMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  canonicalPath,
}: BuildSeoMetadataInput): Metadata {
  const metadataBase = getPublicSiteUrl() ?? undefined
  const canonical = metadataBase && canonicalPath ? new URL(canonicalPath, metadataBase).toString() : undefined
  const ogImage = resolveOgImage(seo?.ogImage)
  const title = normalizeMetadataTitle(seo?.title || fallbackTitle)
  const description = seo?.description || fallbackDescription

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}
