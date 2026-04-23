import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import styles from './dashboard.module.css'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard')

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className={styles.userName}>{session.user.name}</p>
            <p className={styles.userRole}>{session.user.role}</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="/dashboard/participant" className={styles.navItem}>
            <span>🏠</span> Overview
          </a>
          <a href="/dashboard/participant/enrollments" className={styles.navItem}>
            <span>📚</span> My Programs
          </a>
          <a href="/dashboard/participant/certificates" className={styles.navItem}>
            <span>🎓</span> Certificates
          </a>
          <a href="/dashboard/participant/invoices" className={styles.navItem}>
            <span>🧾</span> Invoices
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/api/auth/signout" className={styles.signoutBtn}>
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>{children}</main>
    </div>
  )
}
