import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Program Progress — NSTC' }

export default function ProgramManagerProgressPage() {
  return (
    <div>
      <h1>Progress</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Program-level progress insights and completion analytics will be surfaced here.
      </p>
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        Progress analytics rollout is in progress.
      </div>
    </div>
  )
}

