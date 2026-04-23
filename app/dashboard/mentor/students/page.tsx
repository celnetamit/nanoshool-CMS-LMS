import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Mentor Students — NSTC' }

export default async function MentorStudentsPage() {
  const session = await auth()
  if (!session?.user) return null

  let students: {
    enrollment_id: string
    learner_name: string
    learner_email: string
    product_title: string
    domain_name: string
    access_status: string
    moodle_enrollment_status: boolean
    enrolled_on: string
  }[] = []

  try {
    students = await query(
      `SELECT DISTINCT ON (e.id)
              e.id AS enrollment_id,
              learner.name AS learner_name,
              learner.email AS learner_email,
              p.title AS product_title,
              d.name AS domain_name,
              e.access_status,
              e.moodle_enrollment_status,
              e.created_at AS enrolled_on
       FROM enrollments e
       JOIN users learner ON learner.id = e.user_id
       JOIN products p ON p.id = e.product_id
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN product_mentors pm ON pm.product_id = p.id
       LEFT JOIN users mentor ON mentor.id = pm.user_id
       WHERE ($1 = 'admin' OR mentor.email = $2)
       ORDER BY e.id, e.created_at DESC
       LIMIT 200`,
      [session.user.role, session.user.email]
    ) as unknown as typeof students
  } catch {
    students = []
  }

  return (
    <div>
      <h1>Students</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Learner roster across your assigned programs.
      </p>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {students.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            No learner enrollments found for your assigned programs.
          </div>
        ) : (
          students.map((item) => (
            <div key={item.enrollment_id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>{item.learner_name}</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>{item.learner_email}</p>
                </div>
                <span className={`badge ${item.access_status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {item.access_status}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>
                <span>{item.product_title}</span>
                <span> · {item.domain_name}</span>
                <span> · Enrolled {new Date(item.enrolled_on).toLocaleDateString('en-IN')}</span>
                <span> · Moodle: {item.moodle_enrollment_status ? 'Synced' : 'Pending'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
