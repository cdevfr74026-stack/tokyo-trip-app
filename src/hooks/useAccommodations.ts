import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { Accommodation } from '@/types'

export type AccommodationDraft = Omit<Accommodation, 'id' | 'tripId'>

export function useAccommodations() {
  const { value: accommodations, setValue: setAccommodations, loading } = useCloudState<Accommodation[]>(
    STORAGE_KEYS.accommodations,
    () => [],
  )

  const addAccommodation = useCallback(
    (draft: AccommodationDraft) => {
      setAccommodations((prev) => [...prev, { id: `stay-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }])
    },
    [setAccommodations],
  )

  const updateAccommodation = useCallback(
    (id: string, draft: AccommodationDraft) => {
      setAccommodations((prev) => prev.map((a) => (a.id === id ? { ...a, ...draft } : a)))
    },
    [setAccommodations],
  )

  const removeAccommodation = useCallback(
    (id: string) => {
      setAccommodations((prev) => prev.filter((a) => a.id !== id))
    },
    [setAccommodations],
  )

  return { accommodations, loading, addAccommodation, updateAccommodation, removeAccommodation }
}
