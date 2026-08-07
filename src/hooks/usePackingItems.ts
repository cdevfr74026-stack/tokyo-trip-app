import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import { seedPackingItems } from '@/lib/seedData'
import type { PackingItem } from '@/types'

export function usePackingItems() {
  const { value: items, setValue: setItems, loading } = useCloudState<PackingItem[]>(
    STORAGE_KEYS.packingItems,
    () => seedPackingItems,
  )

  const persist = useCallback(
    (next: PackingItem[]) => {
      setItems(next)
    },
    [setItems],
  )

  const toggle = useCallback(
    (id: string) => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)))
    },
    [setItems],
  )

  const addItem = useCallback(
    (name: string, category: PackingItem['category']) => {
      setItems((prev) => [
        ...prev,
        {
          id: `pack-${Date.now()}`,
          tripId: prev[0]?.tripId ?? 'trip-tokyo-2026',
          category,
          name,
          checked: false,
          order: prev.length,
        },
      ])
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id))
    },
    [setItems],
  )

  return { items, loading, toggle, addItem, removeItem, persist }
}
