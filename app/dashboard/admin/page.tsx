import type { Metadata } from 'next'
import { query } from '@/lib/db'
import styles from './overview.module.css'

export const metadata: Metadata = { title: 'Admin Overview — NSTC' }

interface KPI { label: string; value: string | number; delta?: string; icon: string; color: string }

async function fetchKPIs() {
  try {
    const [[users], [products], [enrollments], [payments]] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) AS count FROM users'),
      query<{ count: string }>('SELECT COUNT(*) AS count FROM products WHERE status = $1', ['published']),
      query<{ count: string }>('SELECT COUNT(*) AS count FROM enrollments WHERE access_status = $1', ['active']),
      query<{ total: string }>('SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = $1', ['paid']),
    ])
    return {
      users: Number(users.count),
      products: Number(products.count),
      enrollments: Number(enrollments.count),
      revenue: Number(payments.total),
    }
  } catch {
    return { users: 0, products: 0, enrollments: 0, revenue: 0 }
  }
}

async function fetchRecentEnrollments() {
  try {
    return query<{
      id: string; user_name: string; product_title: string;
      access_status: string; payment_status: string; created_at: string; amount: number
    }>(
      `SELECT e.id, u.name AS user_name, p.title AS product_title,
              e.access_status, e.payment_status, e.created_at,
              pay.amount
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN products p ON p.id = e.product_id
       LEFT JOIN payments pay ON pay.id = e.payment_id
       ORDER BY e.created_at DESC LIMIT 10`,
      []
    )
  } catch { return [] }
}

async function fetchDomainBreakdown() {
  try {
    return query<{ domain_name: string; count: string; revenue: string }>(
      `SELECT d.name AS domain_name,
              COUNT(e.id) AS count,
              COALESCE(SUM(pay.amount), 0) AS revenue
       FROM enrollments e
       JOIN products p ON p.id = e.product_id
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN payments pay ON pay.id = e.payment_id
       WHERE e.access_status = 'active'
       GROUP BY d.name
       ORDER BY count DESC`,
      []
    )
  } catch { return [] }
}

export default async function AdminOverviewPage() {
  const [kpis, recentEnrollments, domainBreakdown] = await Promise.all([
    fetchKPIs(),
    fetchRecentEnrollments(),
    fetchDomainBreakdown(),
  ])

  const KPI_CARDS: KPI[] = [
    { label: 'Total Users', value: kpis.users.toLocaleString('en-IN'), icon: '👥', color: '#6366f1' },
    { label: 'Active Enrollments', value: kpis.enrollments.toLocaleString('en-IN'), icon: '📚', color: '#22c55e' },
    { label: 'Published Programs', value: kpis.products.toLocaleString('en-IN'), icon: '📦', color: '#f59e0b' },
    { label: 'Total Revenue', value: `₹${kpis.revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#22d3ee' },
  ]

  const ACCESS_COLORS: Record<string, string> = {
    active: 'badge-success', locked: 'badge-warning',
    completed: 'badge-primary', revoked: 'badge-error',
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Admin Overview</h1>
        <p className={styles.subtitle}>Platform-wide metrics and recent activity</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiIcon} style={{ color: kpi.color, background: `${kpi.color}18` }}>
              {kpi.icon}
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Recent Enrollments */}
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Enrollments</h2>
            <a href="/dashboard/admin/enrollments" className="btn btn-ghost btn--sm">View All →</a>
          </div>

          {recentEnrollments.length === 0 ? (
            <div className={styles.emptyState}>No enrollments yet.</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>User</span>
                <span>Program</span>
                <span>Status</span>
                <span>Revenue</span>
                <span>Date</span>
              </div>
              {recentEnrollments.map((e) => (
                <div key={e.id} className={styles.tableRow}>
                  <span className={styles.userName}>{e.user_name}</span>
                  <span className={styles.programName}>{e.product_title}</span>
                  <span><span className={`badge ${ACCESS_COLORS[e.access_status] || 'badge-neutral'}`}>{e.access_status}</span></span>
                  <span className={styles.revenue}>
                    {e.amount ? `₹${Number(e.amount).toLocaleString('en-IN')}` : '—'}
                  </span>
                  <span className={styles.date}>
                    {new Date(e.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Domain Breakdown */}
        <div className={`card ${styles.domainCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Enrollments by Domain</h2>
          </div>

          {domainBreakdown.length === 0 ? (
            <div className={styles.emptyState}>No data yet.</div>
          ) : (
            <div className={styles.domainList}>
              {domainBreakdown.map((d, i) => {
                const colors = ['#6366f1', '#22c55e', '#22d3ee']
                const total = domainBreakdown.reduce((s, x) => s + Number(x.count), 0)
                const pct = total > 0 ? Math.round((Number(d.count) / total) * 100) : 0
                return (
                  <div key={d.domain_name} className={styles.domainRow}>
                    <div className={styles.domainMeta}>
                      <span className={styles.domainName}>{d.domain_name}</span>
                      <span className={styles.domainRevenue}>₹{Number(d.revenue).toLocaleString('en-IN')}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                      />
                    </div>
                    <div className={styles.domainStats}>
                      <span>{d.count} enrollments</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {[
            { label: 'Add Product', href: '/dashboard/admin/products/new', icon: '➕', desc: 'Create a new course or program' },
            { label: 'Manage Users', href: '/dashboard/admin/users', icon: '👥', desc: 'View and edit user accounts' },
            { label: 'Process Refund', href: '/dashboard/admin/enrollments', icon: '↩️', desc: 'Initiate a refund for an enrollment' },
            { label: 'Add Coupon', href: '/dashboard/admin/coupons/new', icon: '🎟️', desc: 'Create a discount coupon' },
            { label: 'Payload CMS', href: '/admin', icon: '🔧', desc: 'Manage content in the CMS' },
            { label: 'View Reports', href: '/dashboard/admin/payments', icon: '📈', desc: 'Payment reports and analytics' },
          ].map((a) => (
            <a key={a.href} href={a.href} className={`card card--hover ${styles.actionCard}`}>
              <span className={styles.actionIcon}>{a.icon}</span>
              <div>
                <p className={styles.actionLabel}>{a.label}</p>
                <p className={styles.actionDesc}>{a.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
