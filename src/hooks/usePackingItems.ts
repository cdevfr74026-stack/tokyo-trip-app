import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { seedPackingItems } from '@/lib/seedData'
import type { PackingItem } from '@/types'

export function usePackingItems() {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<PackingItem[]>(STORAGE_KEYS.packingItems).then((saved) => {
      if (cancelled) return
      if (saved && saved.length > 0) {
        setItems(saved)
      } else {
        setItems(seedPackingItems)
        storage.set(STORAGE_KEYS.packingItems, seedPackingItems)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((next: PackingItem[]) => {
    setItems(next)
    storage.set(STORAGE_KEYS.packingItems, next)
  }, [])

  const toggle = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
        storage.set(STORAGE_KEYS.packingItems, next)
        return next
      })
    },
    [],
  )

  const addItem = useCallback(
    (name: string, category: PackingItem['category']) => {
      setItems((prev) => {
        const next: PackingItem[] = [
          ...prev,
          {
            id: `pack-${Date.now()}`,
            tripId: prev[0]?.tripId ?? 'trip-tokyo-2026',
            category,
            name,
            checked: false,
            order: prev.length,
          },
        ]
        storage.set(STORAGE_KEYS.packingItems, next)
        return next
      })
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      storage.set(STORAGE_KEYS.packingItems, next)
      return next
    })
  }, [])

  return { items, loading, toggle, addItem, removeItem, persist }
}
