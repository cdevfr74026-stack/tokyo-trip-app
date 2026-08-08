import { useCallback, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { MustBuyCategory } from '@/types'

// 分類改成「依旅伴獨立」之前建立的舊分類資料沒有 travelerId 欄位，
// 一律歸給蓁蓁（旅伴清單的第一位），只需要遷移一次。
const DEFAULT_TRAVELER_ID = 'traveler-1'

export function useMustBuyCategories() {
  const { value: categories, setValue: setCategories, loading } = useCloudState<MustBuyCategory[]>(
    STORAGE_KEYS.mustBuyCategories,
    () => [],
  )

  useEffect(() => {
    if (loading) return
    const hasLegacyCategory = categories.some((c) => !c.travelerId)
    if (!hasLegacyCategory) return
    setCategories((prev) =>
      prev.map((c) => (c.travelerId ? c : { ...c, travelerId: DEFAULT_TRAVELER_ID })),
    )
  }, [loading, categories, setCategories])

  const addCategory = useCallback(
    (travelerId: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const id = `mustbuy-category-${Date.now()}`
      setCategories((prev) => {
        const sameTraveler = prev.filter((c) => c.travelerId === travelerId)
        return [...prev, { id, tripId: 'trip-tokyo-2026', travelerId, name: trimmed, order: sameTraveler.length }]
      })
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
