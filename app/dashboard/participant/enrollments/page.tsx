import { auth } from '@/lib/auth'
import { getUserEnrollments } from '@/services/enrollment.service'
import Link from 'next/link'
import styles from './enrollments.module.css'

const TYPE_LABELS: Record<string, string> = {
  course: 'Course', workshop: 'Workshop', internship: 'Internship',
  flagship_program: 'Flagship Program', package: 'Package',
}

const ACCESS_COLORS: Record<string, string> = {
  active: 'badge-success', locked: 'badge-warning',
  completed: 'badge-primary', revoked: 'badge-error',
}

export default async function EnrollmentsPage() {
  const session = await auth()
  if (!session?.user) return null

  let enrollments: {
    id: string; product_title: string; product_slug: string;
    product_type: string; domain_slug: string;
    payment_status: string; access_status: string; moodle_enrollment_status: boolean;
    created_at: string
  }[] = []

  try {
    const raw = await getUserEnrollments(session.user.id)
    enrollments = raw as typeof enrollments
  } catch { /* DB unavailable */ }

  return (
    <div>
      <h1 className={styles.title}>My Programs</h1>
      <p className={styles.subtitle}>{enrollments.length} enrolled program{enrollments.length !== 1 ? 's' : ''}</p>

      {enrollments.length === 0 ? (
        <div className={styles.empty}>
          <span>📭</span>
          <h3>No programs yet</h3>
          <p>Explore our catalog and enroll in your first program.</p>
          <Link href="/ai/courses" className="btn btn-primary">Browse Programs →</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {enrollments.map((e) => (
            <div key={e.id} className={`card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={`badge ${ACCESS_COLORS[e.access_status] || 'badge-neutral'}`}>
                  {e.access_status}
                </div>
                <span className="badge badge-neutral">{TYPE_LABELS[e.product_type] || e.product_type}</span>
              </div>

              <h3 className={styles.cardTitle}>{e.product_title}</h3>

              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  🎓 Moodle: {e.moodle_enrollment_status ? 'Synced' : 'Pending sync'}
                </span>
                <span className={styles.metaItem}>
                  📅 Enrolled: {new Date(e.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className={styles.cardFooter}>
                {e.access_status === 'active' || e.access_status === 'completed' ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_MOODLE_URL}/course`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn--sm"
                  >
                    Open in Moodle →
                  </a>
                ) : (
                  <span className={styles.pendingNote}>Access pending payment confirmation</span>
                )}
                <Link
                  href={`/${e.domain_slug}/${e.product_type}/${e.product_slug}`}
                  className="btn btn-ghost btn--sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
