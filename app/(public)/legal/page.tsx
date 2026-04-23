import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal — NSTC',
  description: 'Review all legal policies, terms, and compliance documents.',
}

const LEGAL_LINKS = [
  { href: '/legal/payment-policy', label: 'Payment Policy' },
  { href: '/legal/cancellation-policy', label: 'Cancellation Policy' },
  { href: '/legal/refund-policy', label: 'Refund Policy' },
  { href: '/legal/privacy-policy', label: 'Privacy Policy' },
  { href: '/legal/consent-policy', label: 'Consent Policy' },
]

export default function LegalIndexPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Legal</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Policies and legal documentation for using NSTC platforms and services.
      </p>
      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {LEGAL_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="card card--hover" style={{ padding: '1rem 1.25rem' }}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

