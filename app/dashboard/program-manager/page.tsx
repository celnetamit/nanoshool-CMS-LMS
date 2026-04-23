import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import styles from './pm-overview.module.css'

export default async function ProgramManagerOverviewPage() {
  const session = await auth()
  if (!session?.user) return null

  // Fetch cohort-level data: products with enrollment + completion stats
  let cohorts: {
    id: string; title: string; type: string; domain_name: string;
    total: string; active: string; completed: string; moodle_synced: string
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
       ORDER BY total DESC`,
      []
    ) as typeof cohorts
  } catch { /* DB unavailable */ }

  const grandTotal = {
    enrollments: cohorts.reduce((s, c) => s + Number(c.total), 0),
    active: cohorts.reduce((s, c) => s + Number(c.active), 0),
    completed: cohorts.reduce((s, c) => s + Number(c.completed), 0),
  }

  return (
    <div>
      <h1 className={styles.title}>Program Manager Overview</h1>
      <p className={styles.subtitle}>Monitor cohorts and learner progress across all programs</p>

      <div className={styles.statsRow}>
        {[
          { label: 'Total Enrollments', value: grandTotal.enrollments, icon: '📚', color: '#6366f1' },
          { label: 'Active Learners', value: grandTotal.active, icon: '▶', color: '#22c55e' },
          { label: 'Completed', value: grandTotal.completed, icon: '🏆', color: '#f59e0b' },
          { label: 'Programs', value: cohorts.length, icon: '📦', color: '#22d3ee' },
        ].map((s) => (
          <div key={s.label} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color: s.color, background: `${s.color}18` }}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Cohort Progress</h2>

      {cohorts.length === 0 ? (
        <div className={styles.empty}><span>📭</span><p>No published programs yet.</p></div>
      ) : (
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <span>Program</span>
            <span>Domain</span>
            <span>Type</span>
            <span>Enrolled</span>
            <span>Active</span>
            <span>Completed</span>
            <span>Moodle Synced</span>
            <span>Completion Rate</span>
          </div>
          {cohorts.map((c) => {
            const completionRate = Number(c.total) > 0
              ? Math.round((Number(c.completed) / Number(c.total)) * 100)
              : 0
            return (
              <div key={c.id} className={styles.tableRow}>
                <span className={styles.programName}>{c.title}</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{c.domain_name}</span>
                <span className={styles.type}>{c.type.replace('_', ' ')}</span>
                <span className={styles.count}>{c.total}</span>
                <span className={styles.active}>{c.active}</span>
                <span className={styles.completed}>{c.completed}</span>
                <span>{c.moodle_synced}</span>
                <div className={styles.rateCell}>
                  <div className={styles.rateTrack}>
                    <div className={styles.rateFill} style={{ width: `${completionRate}%` }} />
                  </div>
                  <span className={styles.rateValue}>{completionRate}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
