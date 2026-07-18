import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { FavoriteSpot } from '@/types'

export type FavoriteSpotDraft = Omit<FavoriteSpot, 'id' | 'tripId' | 'addedAt'>

export function useFavoriteSpots() {
  const [spots, setSpots] = useState<FavoriteSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<FavoriteSpot[]>(STORAGE_KEYS.favoriteSpots).then((saved) => {
      if (cancelled) return
      setSpots(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addSpot = useCallback((draft: FavoriteSpotDraft) => {
    setSpots((prev) => {
      const next: FavoriteSpot[] = [
        ...prev,
        { id: `spot-${Date.now()}`, tripId: 'trip-tokyo-2026', addedAt: new Date().toISOString(), ...draft },
      ]
      storage.set(STORAGE_KEYS.favoriteSpots, next)
      return next
    })
  }, [])

  const updateSpotStatus = useCallback((id: string, status: FavoriteSpot['status']) => {
    setSpots((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status } : s))
      storage.set(STORAGE_KEYS.favoriteSpots, next)
      return next
    })
  }, [])

  const removeSpot = useCallback((id: string) => {
    setSpots((prev) => {
      const next = prev.filter((s) => s.id !== id)
      storage.set(STORAGE_KEYS.favoriteSpots, next)
      return next
    })
  }, [])

  return { spots, loading, addSpot, updateSpotStatus, removeSpot }
}
