import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { MustBuyCategory } from '@/types'

export function useMustBuyCategories() {
  const { value: categories, setValue: setCategories, loading } = useCloudState<MustBuyCategory[]>(
    STORAGE_KEYS.mustBuyCategories,
    () => [],
  )

  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const id = `mustbuy-category-${Date.now()}`
      setCategories((prev) => [...prev, { id, tripId: 'trip-tokyo-2026', name: trimmed, order: prev.length }])
      return id
    },
    [setCategories],
  )

  const renameCategory = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)))
    },
    [setCategories],
  )

  const removeCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    },
    [setCategories],
  )

  const reorderCategories = useCallback(
    (orderedIds: string[]) => {
      setCategories((prev) =>
        orderedIds
          .map((id, index) => {
            const c = prev.find((x) => x.id === id)
            return c ? { ...c, order: index } : null
          })
          .filter((c): c is MustBuyCategory => c !== null),
      )
    },
    [setCategories],
  )

  return { categories, loading, addCategory, renameCategory, removeCategory, reorderCategories }
}
