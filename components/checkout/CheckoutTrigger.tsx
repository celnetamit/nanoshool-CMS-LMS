'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutModal } from './CheckoutModal'

type CheckoutTriggerProps = {
  productId: string
  productTitle: string
  price: number
  salePrice?: number
  isAuthenticated: boolean
  alreadyEnrolled?: boolean
  enrollmentHref?: string
  userName?: string
  userEmail?: string
  className?: string
  label?: string
}

export function CheckoutTrigger({
  productId,
  productTitle,
  price,
  salePrice,
  isAuthenticated,
  alreadyEnrolled = false,
  enrollmentHref = '/dashboard/participant/enrollments',
  userName,
  userEmail,
  className = 'btn btn-primary',
  label,
}: CheckoutTriggerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const resolvedPrice = salePrice ?? price
  const resolvedLabel = label ?? (
    alreadyEnrolled
      ? 'Go to My Enrollment ->'
      : resolvedPrice === 0
        ? 'Enroll Free ->'
        : 'Enroll Now ->'
  )

  const onClick = () => {
    if (alreadyEnrolled) {
      router.push(enrollmentHref)
      return
    }
    if (!isAuthenticated) {
      router.push(`/api/enroll?productId=${productId}`)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button type="button" className={className} onClick={onClick}>
        {resolvedLabel}
      </button>
      {open ? (
        <CheckoutModal
          productId={productId}
          productTitle={productTitle}
          price={price}
          salePrice={salePrice}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
