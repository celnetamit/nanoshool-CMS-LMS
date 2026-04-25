const BRAND_SUFFIX = ' — NSTC'

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
}

function toUrl(value: string | undefined): URL | null {
  if (!value) return null

  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function getPublicSiteUrl(): URL | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.SITE_URL,
    process.env.NEXTAUTH_URL,
  ]

  for (const candidate of candidates) {
    const url = toUrl(candidate)
    if (!url) continue
    if (isLocalHostname(url.hostname)) continue
    return url
  }

  return null
}

export function normalizeMetadataTitle(title: string) {
  return title.endsWith(BRAND_SUFFIX) ? title.slice(0, -BRAND_SUFFIX.length) : title
}
