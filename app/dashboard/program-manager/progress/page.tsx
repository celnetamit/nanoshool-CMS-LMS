import type { Metadata } from 'next'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Program Progress — NSTC' }

export default async function ProgramManagerProgressPage() {
  let domainProgress: {
    domain_name: string
    total: string
    active: string
    completed: string
    moodle_synced: string
  }[] = []

  let recentEnrollments: {
    enrollment_id: string
    learner_name: string
    product_title: string
    domain_name: string
    access_status: string
    created_at: string
  }[] = []

  try {
    domainProgress = await query(
      `SELECT d.name AS domain_name,
              COUNT(e.id) AS total,
              COUNT(CASE WHEN e.access_status='active' THEN 1 END) AS active,
              COUNT(CASE WHEN e.access_status='completed' THEN 1 END) AS completed,
              COUNT(CASE WHEN e.moodle_enrollment_status=true THEN 1 END) AS moodle_synced
       FROM domains d
       LEFT JOIN products p ON p.domain_id = d.id AND p.status = 'published'
       LEFT JOIN enrollments e ON e.product_id = p.id
       GROUP BY d.id, d.name
       ORDER BY total DESC`,
      []
    ) as unknown as typeof domainProgress

    recentEnrollments = await query(
      `SELECT e.id AS enrollment_id, u.name AS learner_name, p.title AS product_title,
              d.name AS domain_name, e.access_status, e.created_at
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN products p ON p.id = e.product_id
       JOIN domains d ON d.id = p.domain_id
       ORDER BY e.created_at DESC
       LIMIT 20`,
      []
    ) as unknown as typeof recentEnrollments
  } catch {
    domainProgress = []
    recentEnrollments = []
  }

  return (
    <div>
      <h1>Progress</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Domain-level completion analytics and recent learner movement.
      </p>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {domainProgress.map((item) => {
          const total = Number(item.total)
          const completed = Number(item.completed)
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

          return (
            <div key={item.domain_name} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <strong>{item.domain_name}</strong>
                <span className="badge badge-neutral">Completion {completionRate}%</span>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--color-text-muted)' }}>
                <span>📚 Total: {item.total}</span>
                <span>▶ Active: {item.active}</span>
                <span>🏁 Completed: {item.completed}</span>
                <span>🎓 Moodle Synced: {item.moodle_synced}</span>
              </div>
            </div>
          )
        })}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Recent Enrollments</h2>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
        {recentEnrollments.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>No enrollment activity yet.</div>
        ) : (
          recentEnrollments.map((item) => (
            <div key={item.enrollment_id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <strong>{item.learner_name}</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
                {item.product_title} · {item.domain_name} · {item.access_status} · {new Date(item.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
