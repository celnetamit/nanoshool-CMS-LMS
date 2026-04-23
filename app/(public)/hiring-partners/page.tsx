import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hiring Partners — NSTC',
  description: 'Discover and hire job-ready learners trained in high-impact science and technology domains.',
}

export default function HiringPartnersPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Hiring Partners</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Access skilled talent pools from domain-specific cohorts and flagship programs.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/hiring-partners" className="btn btn-primary">AI Talent Pool</Link>
        <Link href="/biotechnology/hiring-partners" className="btn btn-secondary">Biotech Talent Pool</Link>
        <Link href="/nanotechnology/hiring-partners" className="btn btn-secondary">Nanotech Talent Pool</Link>
      </div>
    </div>
  )
}

