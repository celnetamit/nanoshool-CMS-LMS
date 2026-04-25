import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AudienceLandingPage } from '@/components/marketing/AudienceLandingPage'
import { getAudiencePage } from '@/lib/cms/public/getAudiencePage'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import { extractPlainText, extractTextBlocks } from '@/lib/cms/public/richText'

const AUDIENCE_SLUG = 'students'

export async function generateMetadata(): Promise<Metadata> {
  const result = await getAudiencePage(AUDIENCE_SLUG)
  return buildSeoMetadata({
    seo: result?.seo,
    fallbackTitle: 'Student Programs — NSTC',
    fallbackDescription:
      result?.plainContent || 'Career-oriented programs and internships for students across emerging domains.',
    canonicalPath: '/students',
  })
}

export default async function StudentsPage() {
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
