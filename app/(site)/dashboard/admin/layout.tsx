import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import styles from './admin.module.css'

export const metadata: Metadata = { title: 'Admin Dashboard — NSTC' }

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/products', label: 'Products', icon: '📦' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/enrollments', label: 'Enrollments', icon: '📚' },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/dashboard/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/collections/mentors', label: 'Mentors (CMS)', icon: '🧑‍🏫' },
  { href: '/admin/collections/pages', label: 'Pages (CMS)', icon: '📝' },
  { href: '/admin', label: 'Payload CMS', icon: '🔧' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard/admin')
  if (session.user.role !== 'admin') redirect('/dashboard')

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>N</span>
            <span>NSTC Admin</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navItem}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminBadge}>
            <div className={styles.adminAvatar}>
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={styles.adminName}>{session.user.name}</p>
              <p className={styles.adminRole}>Administrator</p>
            </div>
          </div>
          <a href="/api/auth/signout" className={styles.signoutBtn}>Sign Out</a>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>{children}</main>
    </div>
  )
}
