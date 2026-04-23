import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mentor Programs — NSTC' }

export default function MentorProgramsPage() {
  return (
    <div>
      <h1>My Programs</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Program assignment details are being finalized for this mentor workspace.
      </p>
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        Assigned program data will appear here as mentor mappings are completed.
      </div>
    </div>
  )
}

