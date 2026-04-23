import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mentor Students — NSTC' }

export default function MentorStudentsPage() {
  return (
    <div>
      <h1>Students</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Learner rosters and mentorship actions will appear here.
      </p>
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        Student progress views are planned in the next implementation wave.
      </div>
    </div>
  )
}

