'use client'

import { useEffect, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type PaymentStatusWatcherProps = {
  enabled: boolean
  hasPendingPayments: boolean
  latestPaymentStatus?: string | null
}

export function PaymentStatusWatcher({
  enabled,
  hasPendingPayments,
  latestPaymentStatus,
}: PaymentStatusWatcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!enabled || !hasPendingPayments) return

    const interval = window.setInterval(() => {
      startTransition(() => {
        router.refresh()
      })
    }, 5000)

    return () => window.clearInterval(interval)
  }, [enabled, hasPendingPayments, router, startTransition])

  useEffect(() => {
    if (!enabled || hasPendingPayments) return

    const nextStatus =
      latestPaymentStatus === 'paid'
        ? 'payment-confirmed'
        : latestPaymentStatus === 'failed'
          ? 'payment-failed'
          : null

    if (!nextStatus) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('status', nextStatus)
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl)
  }, [enabled, hasPendingPayments, latestPaymentStatus, pathname, router, searchParams])

  return null
}
