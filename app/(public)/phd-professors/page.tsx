import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PhD & Professors — NSTC',
  description: 'Research collaboration and advanced domain learning tracks for PhD scholars and professors.',
}

export default function PhdProfessorsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>PhD & Professors</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Collaborate on advanced tracks and research-led programs with industry and academic mentors.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/phd-professors" className="btn btn-primary">AI Track</Link>
        <Link href="/biotechnology/phd-professors" className="btn btn-secondary">Biotechnology Track</Link>
        <Link href="/nanotechnology/phd-professors" className="btn btn-secondary">Nanotechnology Track</Link>
      </div>
    </div>
  )
}

