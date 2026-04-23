import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partners — NSTC',
  description: 'Institutional and industry partners collaborating with NSTC programs.',
}

export default function PartnersPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Partners</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        We collaborate with universities, research institutions, and industry teams to deliver high-impact learning.
      </p>
    </div>
  )
}

