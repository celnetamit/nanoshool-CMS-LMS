import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { query } from '@/lib/db'
import styles from './pm.module.css'

export default async function ProgramManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['admin', 'program_manager'].includes(session.user.role)) redirect('/dashboard')

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>N</span>
            <span>Program Mgr</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard/program-manager" className={styles.navItem}><span>🏠</span> Overview</Link>
          <Link href="/dashboard/program-manager/cohorts" className={styles.navItem}><span>📋</span> Cohorts</Link>
          <Link href="/dashboard/program-manager/progress" className={styles.navItem}><span>📊</span> Progress</Link>
        </nav>
        <div className={styles.footer}>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>{session.user.name?.charAt(0) ?? 'P'}</div>
            <div>
              <p className={styles.name}>{session.user.name}</p>
              <p className={styles.role}>Program Manager</p>
            </div>
          </div>
          <a href="/api/auth/signout" className={styles.signout}>Sign Out</a>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
