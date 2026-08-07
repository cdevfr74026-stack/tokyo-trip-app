import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { MustBuyItem } from '@/types'

export interface MustBuyDraft {
  travelerId: string
  name: string
  store?: string
  price?: number
  imageUrl?: string
}

export function useMustBuyItems() {
  const { value: items, setValue: setItems, loading } = useCloudState<MustBuyItem[]>(
    STORAGE_KEYS.mustBuyItems,
    () => [],
  )

  const addItem = useCallback(
    (draft: MustBuyDraft) => {
      setItems((prev) => [
        ...prev,
        { id: `mustbuy-${Date.now()}`, tripId: 'trip-tokyo-2026', checked: false, order: prev.length, ...draft },
      ])
    },
    [setItems],
  )

  const updateItem = useCallback(
    (id: string, draft: MustBuyDraft) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...draft } : i)))
    },
    [setItems],
  )

  const toggleItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [setItems],
  )

  return { items, loading, addItem, updateItem, toggleItem, removeItem }
}
