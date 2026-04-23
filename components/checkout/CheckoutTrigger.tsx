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
  userName,
  userEmail,
  className = 'btn btn-primary',
  label = 'Enroll Now ->',
}: CheckoutTriggerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const onClick = () => {
    if (!isAuthenticated) {
      router.push(`/api/enroll?productId=${productId}`)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button type="button" className={className} onClick={onClick}>
        {label}
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

