import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Flight } from '@/types'

export type FlightDraft = Omit<Flight, 'id' | 'tripId'>

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<Flight[]>(STORAGE_KEYS.flights).then((saved) => {
      if (cancelled) return
      setFlights(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addFlight = useCallback((draft: FlightDraft) => {
    setFlights((prev) => {
      const next: Flight[] = [...prev, { id: `flight-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }]
      storage.set(STORAGE_KEYS.flights, next)
      return next
    })
  }, [])

  const updateFlight = useCallback((id: string, draft: FlightDraft) => {
    setFlights((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...draft } : f))
      storage.set(STORAGE_KEYS.flights, next)
      return next
    })
  }, [])

  const removeFlight = useCallback((id: string) => {
    setFlights((prev) => {
      const next = prev.filter((f) => f.id !== id)
      storage.set(STORAGE_KEYS.flights, next)
      return next
    })
  }, [])

  return { flights, loading, addFlight, updateFlight, removeFlight }
}
