'use client'

import { useRouter } from 'next/navigation'
import { CheckoutModal } from './CheckoutModal'

type CheckoutFlowProps = {
  productId: string
  productTitle: string
  price: number
  salePrice?: number
  userName?: string
  userEmail?: string
}

export function CheckoutFlow({
  productId,
  productTitle,
  price,
  salePrice,
  userName,
  userEmail,
}: CheckoutFlowProps) {
  const router = useRouter()

  return (
    <CheckoutModal
      productId={productId}
      productTitle={productTitle}
      price={price}
      salePrice={salePrice}
      userName={userName}
      userEmail={userEmail}
      onClose={() => router.back()}
    />
  )
}

