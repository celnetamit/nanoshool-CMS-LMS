import { auth } from '@/lib/auth'
import { getUserEnrollments } from '@/services/enrollment.service'
import Link from 'next/link'
import styles from './overview.module.css'

export default async function ParticipantOverviewPage() {
  const session = await auth()
  if (!session?.user) return null

  let enrollments: { access_status: string; payment_status: string; moodle_enrollment_status: boolean }[] = []
  try {
    const raw = await getUserEnrollments(session.user.id)
    enrollments = raw as typeof enrollments
  } catch { /* DB unavailable */ }

  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e) => e.access_status === 'active').length,
    completed: enrollments.filter((e) => e.access_status === 'completed').length,
    moodleSynced: enrollments.filter((e) => e.moodle_enrollment_status).length,
  }

  return (
    <div>
      <h1 className={styles.greeting}>
        Welcome back, {session.user.name?.split(' ')[0]} 👋
      </h1>
      <p className={styles.subtitle}>Here's your learning dashboard</p>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Programs', value: stats.total, icon: '📚', color: '#6366f1' },
          { label: 'Active', value: stats.active, icon: '▶', color: '#22c55e' },
          { label: 'Completed', value: stats.completed, icon: '🏆', color: '#f59e0b' },
          { label: 'Moodle Synced', value: stats.moodleSynced, icon: '✓', color: '#22d3ee' },
        ].map((s) => (
          <div key={s.label} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color: s.color, background: `${s.color}18` }}>
              {s.icon}
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.quickLinks}>
        <Link href="/dashboard/participant/enrollments" className={`card card--hover ${styles.quickCard}`}>
          <span>📚</span>
          <div>
            <p className={styles.quickTitle}>My Programs</p>
            <p className={styles.quickDesc}>View and access your enrolled programs</p>
          </div>
        </Link>
        <Link href="/dashboard/participant/certificates" className={`card card--hover ${styles.quickCard}`}>
          <span>🎓</span>
          <div>
            <p className={styles.quickTitle}>Certificates</p>
            <p className={styles.quickDesc}>Download your earned certificates</p>
          </div>
        </Link>
        <Link href="/dashboard/participant/invoices" className={`card card--hover ${styles.quickCard}`}>
          <span>🧾</span>
          <div>
            <p className={styles.quickTitle}>Invoices</p>
            <p className={styles.quickDesc}>View payment receipts and invoices</p>
          </div>
        </Link>
        <Link href="/ai/courses" className={`card card--hover ${styles.quickCard}`}>
          <span>🔍</span>
          <div>
            <p className={styles.quickTitle}>Browse Programs</p>
            <p className={styles.quickDesc}>Discover more courses and internships</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
