import type { Metadata } from 'next'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Cohorts — NSTC' }

export default async function ProgramManagerCohortsPage() {
  let cohorts: {
    id: string
    title: string
    type: string
    domain_name: string
    total: string
    active: string
    completed: string
    moodle_synced: string
  }[] = []

  try {
    cohorts = await query(
      `SELECT p.id, p.title, p.type, d.name AS domain_name,
              COUNT(e.id) AS total,
              COUNT(CASE WHEN e.access_status='active' THEN 1 END) AS active,
              COUNT(CASE WHEN e.access_status='completed' THEN 1 END) AS completed,
              COUNT(CASE WHEN e.moodle_enrollment_status=true THEN 1 END) AS moodle_synced
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN enrollments e ON e.product_id = p.id
       WHERE p.status = 'published'
       GROUP BY p.id, d.name
       ORDER BY total DESC, active DESC`,
      []
    ) as unknown as typeof cohorts
  } catch {
    cohorts = []
  }

  return (
    <div>
      <h1>Cohorts</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Cohort health by program across active and completed learners.
      </p>
      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {cohorts.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>No published cohorts yet.</div>
        ) : (
          cohorts.map((cohort) => {
            const total = Number(cohort.total)
            const completed = Number(cohort.completed)
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div key={cohort.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{cohort.title}</strong>
                    <p style={{ marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
                      {cohort.domain_name} · {cohort.type.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="badge badge-neutral">Completion {completionRate}%</span>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--color-text-muted)' }}>
                  <span>📚 Total: {cohort.total}</span>
                  <span>▶ Active: {cohort.active}</span>
                  <span>🏁 Completed: {cohort.completed}</span>
                  <span>🎓 Moodle Synced: {cohort.moodle_synced}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
