import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join Us — NSTC',
  description: 'Join the NSTC mission as a mentor, collaborator, or team member.',
}

export default function JoinUsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Join Us</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        We are building the future of science and technology education. Reach out to collaborate as a mentor or partner.
      </p>
    </div>
  )
}

