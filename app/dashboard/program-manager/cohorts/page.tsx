import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cohorts — NSTC' }

export default function ProgramManagerCohortsPage() {
  return (
    <div>
      <h1>Cohorts</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Cohort setup and scheduling modules are being integrated.
      </p>
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        Cohort lifecycle management will be available here.
      </div>
    </div>
  )
}

