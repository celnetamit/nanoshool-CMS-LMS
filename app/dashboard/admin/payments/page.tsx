import type { Metadata } from 'next'
import { query } from '@/lib/db'
import styles from './payments.module.css'

export const metadata: Metadata = { title: 'Payments — Admin' }

const STATUS_COLORS: Record<string, string> = {
  paid: 'badge-success', pending: 'badge-warning',
  failed: 'badge-error', refunded: 'badge-neutral',
}

export default async function AdminPaymentsPage() {
  let payments: {
    id: string; user_name: string; amount: number; currency: string;
    razorpay_order_id: string | null; razorpay_payment_id: string | null;
    status: string; created_at: string;
  }[] = []

  let totals = { paid: 0, refunded: 0, failed: 0 }

  try {
    payments = await query(
      `SELECT pay.id, u.name AS user_name, pay.amount, pay.currency,
              pay.razorpay_order_id, pay.razorpay_payment_id, pay.status, pay.created_at
       FROM payments pay
       JOIN users u ON u.id = pay.user_id
       ORDER BY pay.created_at DESC
       LIMIT 200`,
      []
    ) as typeof payments

    const [totalsRow] = await query<{
      paid_total: string; refunded_total: string; failed_count: string
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END), 0) AS paid_total,
         COALESCE(SUM(CASE WHEN status='refunded' THEN amount ELSE 0 END), 0) AS refunded_total,
         COUNT(CASE WHEN status='failed' THEN 1 END) AS failed_count
       FROM payments`,
      []
    )
    totals = {
      paid: Number(totalsRow.paid_total),
      refunded: Number(totalsRow.refunded_total),
      failed: Number(totalsRow.failed_count),
    }
  } catch { /* DB unavailable */ }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>All payment transactions</p>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className={`card ${styles.summaryCard}`}>
          <div className={styles.summaryIcon} style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}>💰</div>
          <div className={styles.summaryValue}>₹{totals.paid.toLocaleString('en-IN')}</div>
          <div className={styles.summaryLabel}>Total Revenue</div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={styles.summaryIcon} style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)' }}>↩️</div>
          <div className={styles.summaryValue}>₹{totals.refunded.toLocaleString('en-IN')}</div>
          <div className={styles.summaryLabel}>Total Refunded</div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={styles.summaryIcon} style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)' }}>✕</div>
          <div className={styles.summaryValue}>{totals.failed}</div>
          <div className={styles.summaryLabel}>Failed Payments</div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <div className={styles.summaryIcon} style={{ color: '#22d3ee', background: 'rgba(34,211,238,0.12)' }}>📊</div>
          <div className={styles.summaryValue}>{payments.filter(p => p.status === 'paid').length}</div>
          <div className={styles.summaryLabel}>Successful Transactions</div>
        </div>
      </div>

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <span>User</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Razorpay Order ID</span>
          <span>Payment ID</span>
          <span>Date</span>
        </div>

        {payments.length === 0 ? (
          <div className={styles.empty}>No payments yet.</div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className={styles.tableRow}>
              <span className={styles.userName}>{p.user_name}</span>
              <span className={styles.amount}>{p.currency} {Number(p.amount).toLocaleString('en-IN')}</span>
              <span><span className={`badge ${STATUS_COLORS[p.status] || 'badge-neutral'}`}>{p.status}</span></span>
              <span className={styles.id}>{p.razorpay_order_id || '—'}</span>
              <span className={styles.id}>{p.razorpay_payment_id || '—'}</span>
              <span className={styles.date}>
                {new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
