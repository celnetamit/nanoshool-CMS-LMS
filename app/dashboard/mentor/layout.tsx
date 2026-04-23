import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import styles from './mentor.module.css'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['admin', 'mentor'].includes(session.user.role)) redirect('/dashboard')

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>N</span>
            <span>Mentor Hub</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard/mentor" className={styles.navItem}><span>🏠</span> Overview</Link>
          <Link href="/dashboard/mentor/programs" className={styles.navItem}><span>📚</span> My Programs</Link>
          <Link href="/dashboard/mentor/students" className={styles.navItem}><span>👥</span> Students</Link>
        </nav>
        <div className={styles.footer}>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>{session.user.name?.charAt(0) ?? 'M'}</div>
            <div>
              <p className={styles.name}>{session.user.name}</p>
              <p className={styles.role}>Mentor</p>
            </div>
          </div>
          <a href="/api/auth/signout" className={styles.signout}>Sign Out</a>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
