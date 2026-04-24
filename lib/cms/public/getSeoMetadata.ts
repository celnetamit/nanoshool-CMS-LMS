import type { Metadata } from 'next'

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
  const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  const canonical = canonicalPath ? new URL(canonicalPath, metadataBase).toString() : undefined
  const ogImage = resolveOgImage(seo?.ogImage)

  return {
    title: seo?.title || fallbackTitle,
    description: seo?.description || fallbackDescription,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: seo?.title || fallbackTitle,
      description: seo?.description || fallbackDescription,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}
