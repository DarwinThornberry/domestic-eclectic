'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

/** Mounts invisibly and clears the cart once — used on the success page. */
export function ClearCart() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
