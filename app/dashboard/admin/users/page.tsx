import type { Metadata } from 'next'
import { query } from '@/lib/db'
import styles from './users.module.css'
import type { DBUser } from '@/types'

export const metadata: Metadata = { title: 'Users — Admin' }

const ROLE_COLORS: Record<string, string> = {
  admin: 'badge-error', mentor: 'badge-accent',
  program_manager: 'badge-primary', participant: 'badge-neutral',
}

export default async function AdminUsersPage() {
  let users: (DBUser & { enrollment_count: string })[] = []

  try {
    users = await query(
      `SELECT u.*, COUNT(e.id) AS enrollment_count
       FROM users u
       LEFT JOIN enrollments e ON e.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT 100`,
      []
    ) as typeof users
  } catch { /* DB unavailable */ }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>{users.length} registered users</p>
        </div>
        <input className="input" placeholder="Search users..." style={{ width: 280 }} />
      </div>

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Enrollments</span>
          <span>Moodle ID</span>
          <span>Joined</span>
        </div>

        {users.length === 0 ? (
          <div className={styles.empty}>No users yet.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className={styles.tableRow}>
              <div className={styles.userCell}>
                <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                <span className={styles.userName}>{u.name}</span>
              </div>
              <span className={styles.email}>{u.email}</span>
              <span><span className={`badge ${ROLE_COLORS[u.role] || 'badge-neutral'}`}>{u.role}</span></span>
              <span className={styles.count}>{u.enrollment_count}</span>
              <span className={styles.moodleId}>{u.moodle_user_id || '—'}</span>
              <span className={styles.date}>
                {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
