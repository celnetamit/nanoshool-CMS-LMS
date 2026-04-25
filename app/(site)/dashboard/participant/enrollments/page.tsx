import { auth } from '@/lib/auth'
import { getUserEnrollments, type EnrollmentWithProduct } from '@/services/enrollment.service'
import { getUserPayments, type UserPayment } from '@/services/payment.service'
import { PaymentStatusWatcher } from '@/components/payments/PaymentStatusWatcher'
import Link from 'next/link'
import styles from './enrollments.module.css'

const moodleBaseUrl = process.env.NEXT_PUBLIC_MOODLE_URL

const TYPE_LABELS: Record<string, string> = {
  course: 'Course', workshop: 'Workshop', internship: 'Internship',
  flagship_program: 'Flagship Program', package: 'Package',
}

const ACCESS_COLORS: Record<string, string> = {
  active: 'badge-success', locked: 'badge-warning',
  completed: 'badge-primary', revoked: 'badge-error',
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  failed: 'badge-error',
  refunded: 'badge-neutral',
}

const STATUS_MESSAGE: Record<string, { title: string; body: string; tone: 'success' | 'info' }> = {
  'free-enrolled': {
    title: 'Enrollment complete',
    body: 'Your free program access is live. Your invoice record will appear below as soon as it is ready.',
    tone: 'success',
  },
  'payment-processing': {
    title: 'Payment received, access is being confirmed',
    body: 'Your enrollment will move from pending to active as soon as the payment webhook and access sync finish. This page refreshes automatically while confirmation is in progress.',
    tone: 'info',
  },
  'already-enrolled': {
    title: 'You already have access',
    body: 'This program is already in your dashboard, so you can continue learning without checking out again.',
    tone: 'info',
  },
  'payment-confirmed': {
    title: 'Payment confirmed',
    body: 'Your payment has been captured and your program access is now available below.',
    tone: 'success',
  },
  'payment-failed': {
    title: 'Payment was not completed',
    body: 'The last payment attempt did not complete. You can return to the program page and try again.',
    tone: 'info',
  },
}

type EnrollmentsPageProps = {
  searchParams?: Promise<{
    status?: string
  }>
}

export default async function EnrollmentsPage({ searchParams }: EnrollmentsPageProps) {
  const session = await auth()
  if (!session?.user) return null
  const resolvedSearchParams = await searchParams
  let status = resolvedSearchParams?.status

  let enrollments: EnrollmentWithProduct[] = []
  let payments: UserPayment[] = []

  try {
    enrollments = await getUserEnrollments(session.user.id)
  } catch { /* DB unavailable */ }
  try {
    payments = await getUserPayments(session.user.id)
  } catch { /* DB unavailable */ }

  const pendingPayments = payments.filter((payment) => payment.status === 'pending')
  const latestPaymentStatus = payments[0]?.status ?? null
  if (status === 'payment-processing' && pendingPayments.length === 0) {
    if (latestPaymentStatus === 'paid') status = 'payment-confirmed'
    if (latestPaymentStatus === 'failed') status = 'payment-failed'
  }
  const statusMessage = status ? STATUS_MESSAGE[status] : null

  return (
    <div>
      <PaymentStatusWatcher
        enabled={status === 'payment-processing'}
        hasPendingPayments={pendingPayments.length > 0}
        latestPaymentStatus={latestPaymentStatus}
      />
      <h1 className={styles.title}>My Programs</h1>
      <p className={styles.subtitle}>{enrollments.length} enrolled program{enrollments.length !== 1 ? 's' : ''}</p>

      {statusMessage ? (
        <div className={`${styles.banner} ${statusMessage.tone === 'success' ? styles.bannerSuccess : styles.bannerInfo}`}>
          <strong>{statusMessage.title}</strong>
          <p>{statusMessage.body}</p>
        </div>
      ) : null}

      {pendingPayments.length > 0 ? (
        <div className={styles.pendingSection}>
          <div className={styles.pendingHeader}>
            <h2 className={styles.pendingTitle}>Payments Awaiting Confirmation</h2>
            <p className={styles.pendingDescription}>
              These payments were started successfully. Access and invoices will appear automatically after webhook confirmation.
            </p>
          </div>
          <div className={styles.pendingGrid}>
            {pendingPayments.map((payment) => (
              <div key={payment.id} className={`card ${styles.pendingCard}`}>
                <div className={styles.pendingCardHeader}>
                  <span className="badge badge-warning">pending</span>
                  <span className={styles.pendingAmount}>
                    {payment.currency} {Number(payment.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className={styles.pendingCardTitle}>{payment.product_title || 'Enrollment confirmation in progress'}</h3>
                <p className={styles.pendingCardText}>
                  Started on {new Date(payment.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}.
                  {payment.razorpay_order_id ? ` Order: ${payment.razorpay_order_id.slice(-8)}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {enrollments.length === 0 ? (
        <div className={styles.empty}>
          <span>📭</span>
          <h3>No programs yet</h3>
          <p>
            {pendingPayments.length > 0
              ? 'Your payment is still being confirmed. Your program will appear here automatically once access is activated.'
              : 'Explore our catalog and enroll in your first program.'}
          </p>
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
                <span className={`badge ${PAYMENT_COLORS[e.payment_status] || 'badge-neutral'}`}>
                  payment: {e.payment_status}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{e.product_title}</h3>

              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  🎓 Moodle: {e.moodle_enrollment_status ? 'Synced' : 'Pending sync'}
                </span>
                <span className={styles.metaItem}>
                  📅 Enrolled: {new Date(e.created_at).toLocaleDateString('en-IN')}
                </span>
                {e.invoice_id ? (
                  <span className={styles.metaItem}>
                    🧾 Invoice ready
                  </span>
                ) : (
                  <span className={styles.metaItem}>
                    🧾 Invoice {e.payment_status === 'paid' ? 'is being prepared' : 'will appear after payment confirmation'}
                  </span>
                )}
              </div>

              <div className={styles.cardFooter}>
                {e.access_status === 'active' || e.access_status === 'completed' ? (
                  moodleBaseUrl ? (
                    <a
                      href={`${moodleBaseUrl}/course`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn--sm"
                    >
                      Open in Moodle →
                    </a>
                  ) : (
                    <span className={styles.pendingNote}>Moodle link not configured yet</span>
                  )
                ) : (
                  <span className={styles.pendingNote}>Access pending payment confirmation</span>
                )}
                <Link
                  href={`/${e.domain_slug}/${e.product_type}/${e.product_slug}`}
                  className="btn btn-ghost btn--sm"
                >
                  View Details
                </Link>
                {e.invoice_id ? (
                  <Link
                    href={`/dashboard/participant/invoices#invoice-${e.invoice_id}`}
                    className="btn btn-secondary btn--sm"
                  >
                    View Invoice
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
