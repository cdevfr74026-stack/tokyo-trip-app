import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import { seedItineraryItems } from '@/lib/seedData'
import type { ItineraryItem } from '@/types'

export interface ItineraryItemDraft {
  dayId: string
  time?: string
  title: string
  address?: string
  googleMapsUrl?: string
  category: ItineraryItem['category']
  durationMinutes?: number
  transportMode?: ItineraryItem['transportMode']
  transportMinutes?: number
  note?: string
  estimatedCost?: number
}

export function useItineraryItems() {
  const { value: items, setValue: setItems, loading } = useCloudState<ItineraryItem[]>(
    STORAGE_KEYS.itineraryItems,
    () => seedItineraryItems,
  )

  const addItem = useCallback(
    (draft: ItineraryItemDraft) => {
      setItems((prev) => {
        const dayItems = prev.filter((i) => i.dayId === draft.dayId)
        const next: ItineraryItem[] = [
          ...prev,
          {
            id: `item-${Date.now()}`,
            order: dayItems.length,
            photoUrls: [],
            completed: false,
            ...draft,
          },
        ]
        return next
      })
    },
    [setItems],
  )

  const updateItem = useCallback(
    (id: string, draft: ItineraryItemDraft) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...draft } : i)))
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [setItems],
  )

  const toggleComplete = useCallback(
    (id: string) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)))
    },
    [setItems],
  )

  const reorderDay = useCallback(
    (dayId: string, orderedIds: string[]) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.dayId !== dayId) return i
          const order = orderedIds.indexOf(i.id)
          return order === -1 ? i : { ...i, order }
        }),
      )
    },
    [setItems],
  )

  const copyToDay = useCallback(
    (id: string, targetDayId: string) => {
      setItems((prev) => {
        const source = prev.find((i) => i.id === id)
        if (!source) return prev
        const targetDayItems = prev.filter((i) => i.dayId === targetDayId)
        const copy: ItineraryItem = {
          ...source,
          id: `item-${Date.now()}`,
          dayId: targetDayId,
          order: targetDayItems.length,
          completed: false,
        }
        return [...prev, copy]
      })
    },
    [setItems],
  )

  return { items, loading, addItem, updateItem, removeItem, toggleComplete, reorderDay, copyToDay }
}
