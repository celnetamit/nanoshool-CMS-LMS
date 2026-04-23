import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Enterprise Programs — NSTC',
  description: 'Upskill enterprise teams with domain-specific science and technology programs.',
}

export default function EnterprisePage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Enterprise Programs</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Build role-based upskilling tracks for your teams across AI, Biotechnology, and Nanotechnology.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/enterprise" className="btn btn-primary">AI Enterprise</Link>
        <Link href="/biotechnology/enterprise" className="btn btn-secondary">Biotechnology Enterprise</Link>
        <Link href="/nanotechnology/enterprise" className="btn btn-secondary">Nanotechnology Enterprise</Link>
      </div>
    </div>
  )
}

