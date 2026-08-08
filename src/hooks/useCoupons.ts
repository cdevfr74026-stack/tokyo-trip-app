import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { Coupon } from '@/types'

export interface CouponDraft {
  name: string
  url: string
}

/** 補上 https:// 開頭，避免使用者只貼網址本身（沒打 http/https）導致連結點了沒反應 */
function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function useCoupons() {
  const { value: coupons, setValue: setCoupons, loading } = useCloudState<Coupon[]>(
    STORAGE_KEYS.coupons,
    () => [],
  )

  const addCoupon = useCallback(
    (draft: CouponDraft) => {
      const name = draft.name.trim()
      const url = normalizeUrl(draft.url)
      if (!name || !draft.url.trim()) return
      setCoupons((prev) => [
        ...prev,
        { id: `coupon-${Date.now()}`, tripId: 'trip-tokyo-2026', name, url, order: prev.length },
      ])
    },
    [setCoupons],
  )

  const updateCoupon = useCallback(
    (id: string, draft: CouponDraft) => {
      const name = draft.name.trim()
      const url = normalizeUrl(draft.url)
      if (!name || !draft.url.trim()) return
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, name, url } : c)))
    },
    [setCoupons],
  )

  const removeCoupon = useCallback(
    (id: string) => {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    },
    [setCoupons],
  )

  return { coupons, loading, addCoupon, updateCoupon, removeCoupon }
}
