import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AudienceLandingPage } from '@/components/marketing/AudienceLandingPage'
import { getAudiencePage } from '@/lib/cms/public/getAudiencePage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText, extractTextBlocks } from '@/lib/cms/public/richText'

const AUDIENCE_SLUG = 'university'

export async function generateMetadata(): Promise<Metadata> {
  const result = await getAudiencePage(AUDIENCE_SLUG)
  return buildSeoMetadata({
    seo: result?.seo,
    fallbackTitle: 'University Programs — NSTC',
    fallbackDescription:
      result?.plainContent || 'Academic partnerships, curriculum support, and university-focused learning tracks.',
    canonicalPath: '/university',
  })
}

export default async function UniversityPage() {
  const result = await getAudiencePage(AUDIENCE_SLUG)
  if (!result) notFound()

  return (
    <AudienceLandingPage
      audience={result.audience}
      plainContent={extractPlainText(result.override?.landingContent ?? result.audience.landingContent)}
      textBlocks={extractTextBlocks(result.override?.landingContent ?? result.audience.landingContent)}
      override={result.override}
    />
  )
}
