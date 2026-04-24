import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'My Certificates — NSTC' }

export default async function ParticipantCertificatesPage() {
  const session = await auth()
  if (!session?.user) return null

  let certificates: { id: string; certificate_url: string; issued_at: string; product_title: string }[] = []
  try {
    certificates = await query(
      `SELECT c.id, c.certificate_url, c.issued_at, p.title AS product_title
       FROM certificates c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1
       ORDER BY c.issued_at DESC`,
      [session.user.id]
    )
  } catch {
    certificates = []
  }

  return (
    <div>
      <h1>Certificates</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Download and share your earned program certificates.
      </p>
      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {certificates.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>No certificates issued yet.</div>
        ) : (
          certificates.map((item) => (
            <a key={item.id} href={item.certificate_url} target="_blank" rel="noopener noreferrer" className="card card--hover" style={{ padding: '1rem 1.25rem' }}>
              <strong>{item.product_title}</strong>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Issued {new Date(item.issued_at).toLocaleDateString('en-IN')}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

