import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentors — NSTC',
  description: 'Meet mentors shaping programs across AI, Biotechnology, and Nanotechnology.',
}

export default function MentorsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Mentors</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Explore domain mentors and their program tracks.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/mentors" className="btn btn-primary">AI Mentors</Link>
        <Link href="/biotechnology/mentors" className="btn btn-secondary">Biotechnology Mentors</Link>
        <Link href="/nanotechnology/mentors" className="btn btn-secondary">Nanotechnology Mentors</Link>
      </div>
    </div>
  )
}

