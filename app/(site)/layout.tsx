import type { Metadata } from 'next'
import '@/styles/globals.css'
import { getPublicSiteUrl } from '@/lib/site/publicSite'

const metadataBase = getPublicSiteUrl() ?? undefined

export const metadata: Metadata = {
  title: {
    default: 'NSTC — AI, Biotechnology & Nanotechnology Learning Platform',
    template: '%s — NSTC',
  },
  description:
    'Accelerate your career with industry-led programs in AI, Biotechnology, and Nanotechnology. Learn from top mentors, earn certificates, and get job-ready.',
  metadataBase,
  openGraph: {
    type: 'website',
    siteName: 'NSTC',
  },
  robots: {
    index: true,
    follow: true,
  },
}

import { SupportChatbot } from '@/components/support/SupportChatbot'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SupportChatbot />
      </body>
    </html>
  )
}
