import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Accommodation } from '@/types'

export type AccommodationDraft = Omit<Accommodation, 'id' | 'tripId'>

export function useAccommodations() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<Accommodation[]>(STORAGE_KEYS.accommodations).then((saved) => {
      if (cancelled) return
      setAccommodations(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addAccommodation = useCallback((draft: AccommodationDraft) => {
    setAccommodations((prev) => {
      const next: Accommodation[] = [...prev, { id: `stay-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }]
      storage.set(STORAGE_KEYS.accommodations, next)
      return next
    })
  }, [])

  const updateAccommodation = useCallback((id: string, draft: AccommodationDraft) => {
    setAccommodations((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...draft } : a))
      storage.set(STORAGE_KEYS.accommodations, next)
      return next
    })
  }, [])

  const removeAccommodation = useCallback((id: string) => {
    setAccommodations((prev) => {
      const next = prev.filter((a) => a.id !== id)
      storage.set(STORAGE_KEYS.accommodations, next)
      return next
    })
  }, [])

  return { accommodations, loading, addAccommodation, updateAccommodation, removeAccommodation }
}
