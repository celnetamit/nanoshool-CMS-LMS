import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AudienceLandingPage } from '@/components/marketing/AudienceLandingPage'
import { getAudiencePage } from '@/lib/cms/public/getAudiencePage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText, extractTextBlocks } from '@/lib/cms/public/richText'

const AUDIENCE_SLUG = 'hiring-partners'

export async function generateMetadata(): Promise<Metadata> {
  const result = await getAudiencePage(AUDIENCE_SLUG)
  return buildSeoMetadata({
    seo: result?.seo,
    fallbackTitle: 'Hiring Partners — NSTC',
    fallbackDescription:
      result?.plainContent ||
      'Discover and hire job-ready learners trained in high-impact science and technology domains.',
  })
}

export default async function HiringPartnersPage() {
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
