import type { Metadata } from 'next'
import { query } from '@/lib/db'
import { RefundButton } from '@/components/admin/RefundButton'
import styles from './enrollments.module.css'

export const metadata: Metadata = { title: 'Enrollments — Admin' }

const ACCESS_COLORS: Record<string, string> = {
  active: 'badge-success', locked: 'badge-warning',
  completed: 'badge-primary', revoked: 'badge-error',
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'badge-success', pending: 'badge-warning',
  failed: 'badge-error', refunded: 'badge-neutral',
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminEnrollmentsPage({ searchParams }: Props) {
  const parsedSearchParams = await searchParams
  const q = (parsedSearchParams.q ?? '').toString().trim()

  let enrollments: {
    id: string; user_name: string; user_email: string; product_title: string;
    domain_name: string; access_status: string; payment_status: string;
    razorpay_payment_id: string | null; amount: number | null;
    moodle_enrollment_status: boolean; created_at: string;
  }[] = []

  try {
    const values: unknown[] = []
    let filterSql = ''

    if (q) {
      values.push(`%${q}%`)
      filterSql = `WHERE (
        u.name ILIKE $1 OR
        u.email ILIKE $1 OR
        p.title ILIKE $1 OR
        d.name ILIKE $1
      )`
    }

    enrollments = await query(
      `SELECT e.id, u.name AS user_name, u.email AS user_email,
              p.title AS product_title, d.name AS domain_name,
              e.access_status, e.payment_status,
              e.razorpay_payment_id, pay.amount,
              e.moodle_enrollment_status, e.created_at
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN products p ON p.id = e.product_id
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN payments pay ON pay.id = e.payment_id
       ${filterSql}
       ORDER BY e.created_at DESC
       LIMIT 100`,
      values
    ) as unknown as typeof enrollments
  } catch { /* DB unavailable */ }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Enrollments</h1>
          <p className={styles.subtitle}>{enrollments.length} total records (most recent 100)</p>
        </div>
        <div className={styles.headerActions}>
          <form method="get" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              className="input"
              name="q"
              placeholder="Search by user or program..."
              defaultValue={q}
              style={{ width: 280 }}
            />
            <button type="submit" className="btn btn-secondary btn--sm">Search</button>
          </form>
        </div>
      </div>

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <span>User</span>
          <span>Program</span>
          <span>Domain</span>
          <span>Access</span>
          <span>Payment</span>
          <span>Amount</span>
          <span>Moodle</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {enrollments.length === 0 ? (
          <div className={styles.empty}>No enrollments yet.</div>
        ) : (
          enrollments.map((e) => (
            <div key={e.id} className={styles.tableRow}>
              <div>
                <p className={styles.userName}>{e.user_name}</p>
                <p className={styles.userEmail}>{e.user_email}</p>
              </div>
              <span className={styles.programName}>{e.product_title}</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{e.domain_name}</span>
              <span><span className={`badge ${ACCESS_COLORS[e.access_status] || 'badge-neutral'}`}>{e.access_status}</span></span>
              <span><span className={`badge ${PAYMENT_COLORS[e.payment_status] || 'badge-neutral'}`}>{e.payment_status}</span></span>
              <span className={styles.amount}>
                {e.amount ? `₹${Number(e.amount).toLocaleString('en-IN')}` : '—'}
              </span>
              <span>
                <span className={`badge ${e.moodle_enrollment_status ? 'badge-success' : 'badge-neutral'}`}>
                  {e.moodle_enrollment_status ? 'Synced' : 'Pending'}
                </span>
              </span>
              <span className={styles.date}>
                {new Date(e.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
              <span>
                {e.payment_status === 'paid' && (
                  <RefundButton enrollmentId={e.id} />
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
