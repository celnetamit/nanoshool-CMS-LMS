import { auth } from '@/lib/auth'
import { getUserInvoices } from '@/services/invoice.service'
import styles from './invoices.module.css'

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) return null

  let invoices: {
    id: string; amount: number; status: string; pdf_url: string | null;
    razorpay_payment_id: string | null; created_at: string; currency: string;
  }[] = []

  try {
    const raw = await getUserInvoices(session.user.id)
    invoices = raw as unknown as typeof invoices
  } catch { /* DB unavailable */ }

  return (
    <div>
      <h1 className={styles.title}>Invoices</h1>
      <p className={styles.subtitle}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>

      {invoices.length === 0 ? (
        <div className={styles.empty}>
          <span>🧾</span>
          <p>No invoices yet. Invoices appear here after successful payment.</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Invoice ID</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className={styles.tableRow}>
              <span className={styles.invoiceId}>
                #{inv.id.slice(0, 8).toUpperCase()}
              </span>
              <span className={styles.amount}>
                {inv.currency || 'INR'} {Number(inv.amount).toLocaleString('en-IN')}
              </span>
              <span>
                <span className={`badge ${inv.status === 'issued' ? 'badge-success' : 'badge-neutral'}`}>
                  {inv.status}
                </span>
              </span>
              <span className={styles.date}>
                {new Date(inv.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span>
                {inv.pdf_url ? (
                  <a href={inv.pdf_url} download className="btn btn-secondary btn--sm">
                    ↓ PDF
                  </a>
                ) : (
                  <span className={styles.pending}>Generating...</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
