import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
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
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<ItineraryItem[]>(STORAGE_KEYS.itineraryItems).then((saved) => {
      if (cancelled) return
      if (saved) {
        setItems(saved)
      } else {
        setItems(seedItineraryItems)
        storage.set(STORAGE_KEYS.itineraryItems, seedItineraryItems)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((next: ItineraryItem[]) => {
    setItems(next)
    storage.set(STORAGE_KEYS.itineraryItems, next)
  }, [])

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
        storage.set(STORAGE_KEYS.itineraryItems, next)
        return next
      })
    },
    [],
  )

  const updateItem = useCallback((id: string, draft: ItineraryItemDraft) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...draft } : i))
      storage.set(STORAGE_KEYS.itineraryItems, next)
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      storage.set(STORAGE_KEYS.itineraryItems, next)
      return next
    })
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
      storage.set(STORAGE_KEYS.itineraryItems, next)
      return next
    })
  }, [])

  const reorderDay = useCallback((dayId: string, orderedIds: string[]) => {
    setItems((prev) => {
      const next = prev.map((i) => {
        if (i.dayId !== dayId) return i
        const order = orderedIds.indexOf(i.id)
        return order === -1 ? i : { ...i, order }
      })
      storage.set(STORAGE_KEYS.itineraryItems, next)
      return next
    })
  }, [])

  const copyToDay = useCallback((id: string, targetDayId: string) => {
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
      const next = [...prev, copy]
      storage.set(STORAGE_KEYS.itineraryItems, next)
      return next
    })
  }, [])

  return { items, loading, addItem, updateItem, removeItem, toggleComplete, reorderDay, copyToDay, persist }
}
