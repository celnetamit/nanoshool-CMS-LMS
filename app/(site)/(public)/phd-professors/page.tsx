import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AudienceLandingPage } from '@/components/marketing/AudienceLandingPage'
import { getAudiencePage } from '@/lib/cms/public/getAudiencePage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText, extractTextBlocks } from '@/lib/cms/public/richText'

const AUDIENCE_SLUG = 'phd-professors'

export async function generateMetadata(): Promise<Metadata> {
  const result = await getAudiencePage(AUDIENCE_SLUG)
  return buildSeoMetadata({
    seo: result?.seo,
    fallbackTitle: 'PhD & Professors — NSTC',
    fallbackDescription:
      result?.plainContent ||
      'Research collaboration and advanced domain learning tracks for PhD scholars and professors.',
    canonicalPath: '/phd-professors',
  })
}

export default async function PhdProfessorsPage() {
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
