'use client'

import { useState } from 'react'
import styles from './RefundButton.module.css'

export function RefundButton({ enrollmentId }: { enrollmentId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to initiate a refund for this enrollment? This cannot be undone.')) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refund failed')
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return <span className={styles.done}>✓ Refund initiated</span>
  if (error) return <span className={styles.error}>{error}</span>

  return (
    <button
      className={`btn btn--sm ${styles.refundBtn}`}
      onClick={handleRefund}
      disabled={loading}
    >
      {loading ? '...' : '↩ Refund'}
    </button>
  )
}
