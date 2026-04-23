import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'University Programs — NSTC',
  description: 'Academic partnerships, curriculum support, and university-focused learning tracks.',
}

export default function UniversityPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>University Programs</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Integrate industry-ready tracks into your university ecosystem with domain-aligned outcomes and mentorship.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/university" className="btn btn-primary">AI for Universities</Link>
        <Link href="/biotechnology/university" className="btn btn-secondary">Biotechnology for Universities</Link>
        <Link href="/nanotechnology/university" className="btn btn-secondary">Nanotechnology for Universities</Link>
      </div>
    </div>
  )
}

