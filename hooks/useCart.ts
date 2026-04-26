'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CartItem } from '@/types'

const CART_KEY = 'de-cart'

interface CartTotals {
  itemCount: number
  subtotalAud: number // cents
}

interface UseCartReturn {
  items: CartItem[]
  totals: CartTotals
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (itemId: string, qty: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  mounted: boolean
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // localStorage unavailable — silently fail
  }
}

function isSameConfig(a: CartItem, b: Omit<CartItem, 'id'>): boolean {
  return (
    a.artwork_id === b.artwork_id &&
    a.material === b.material &&
    a.size === b.size &&
    a.framing === b.framing
  )
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  // Track hydration so SSR returns empty cart, then loads real data client-side
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(readCart())
  }, [])

  // Persist on every change after hydration
  useEffect(() => {
    if (mounted) writeCart(items)
  }, [items, mounted])

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => isSameConfig(i, item))
      if (existing) {
        // Increment quantity for identical configuration
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                line_total_aud: (i.quantity + item.quantity) * i.unit_price_aud,
              }
            : i,
        )
      }
      return [...prev, { ...item, id: crypto.randomUUID() }]
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity: qty, line_total_aud: qty * i.unit_price_aud }
          : i,
      ),
    )
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totals: CartTotals = {
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotalAud: items.reduce((sum, i) => sum + i.line_total_aud, 0),
  }

  return { items, totals, addItem, updateQuantity, removeItem, clearCart, mounted }
}
