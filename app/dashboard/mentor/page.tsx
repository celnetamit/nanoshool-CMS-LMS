import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import styles from './mentor-overview.module.css'

export default async function MentorOverviewPage() {
  const session = await auth()
  if (!session?.user) return null

  // Fetch programs this mentor is assigned to
  let programs: {
    id: string; title: string; slug: string; type: string;
    domain_name: string; domain_slug: string; enrollment_count: string
  }[] = []

  try {
    programs = await query(
      `SELECT p.id, p.title, p.slug, p.type, d.name AS domain_name, d.slug AS domain_slug,
              COUNT(e.id) AS enrollment_count
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN product_mentors pm ON pm.product_id = p.id
       LEFT JOIN users u ON u.id = pm.user_id AND u.email = $1
       LEFT JOIN enrollments e ON e.product_id = p.id AND e.access_status = 'active'
       WHERE pm.user_id IS NOT NULL OR $2 = 'admin'
       GROUP BY p.id, d.name, d.slug
       ORDER BY enrollment_count DESC
       LIMIT 20`,
      [session.user.email, session.user.role]
    ) as typeof programs
  } catch { /* DB unavailable */ }

  return (
    <div>
      <h1 className={styles.title}>Mentor Overview</h1>
      <p className={styles.subtitle}>Welcome back, {session.user.name?.split(' ')[0]}</p>

      <div className={styles.statsRow}>
        <div className={`card ${styles.statCard}`}>
          <span className={styles.statIcon}>📚</span>
          <div className={styles.statValue}>{programs.length}</div>
          <div className={styles.statLabel}>Assigned Programs</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <span className={styles.statIcon}>👥</span>
          <div className={styles.statValue}>
            {programs.reduce((s, p) => s + Number(p.enrollment_count), 0)}
          </div>
          <div className={styles.statLabel}>Active Students</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Your Programs</h2>
      {programs.length === 0 ? (
        <div className={styles.empty}>
          <span>📭</span>
          <p>No programs assigned yet. Contact your program manager.</p>
        </div>
      ) : (
        <div className={styles.programGrid}>
          {programs.map((p) => (
            <div key={p.id} className={`card card--hover ${styles.programCard}`}>
              <div className={styles.programHeader}>
                <span className="badge badge-neutral">{p.type.replace('_', ' ')}</span>
                <span className="badge badge-accent">{p.domain_name}</span>
              </div>
              <h3 className={styles.programTitle}>{p.title}</h3>
              <div className={styles.programMeta}>
                <span className={styles.studentCount}>👥 {p.enrollment_count} active students</span>
              </div>
              <div className={styles.programActions}>
                <a href={`/${p.domain_slug}/${p.type}/${p.slug}`}
                  className="btn btn-secondary btn--sm" target="_blank">
                  View Page
                </a>
                <a href="/dashboard/mentor/students" className="btn btn-primary btn--sm">
                  View Students
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
