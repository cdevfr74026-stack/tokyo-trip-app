import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { Flight } from '@/types'

export type FlightDraft = Omit<Flight, 'id' | 'tripId'>

export function useFlights() {
  const { value: flights, setValue: setFlights, loading } = useCloudState<Flight[]>(
    STORAGE_KEYS.flights,
    () => [],
  )

  const addFlight = useCallback(
    (draft: FlightDraft) => {
      setFlights((prev) => [...prev, { id: `flight-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }])
    },
    [setFlights],
  )

  const updateFlight = useCallback(
    (id: string, draft: FlightDraft) => {
      setFlights((prev) => prev.map((f) => (f.id === id ? { ...f, ...draft } : f)))
    },
    [setFlights],
  )

  const removeFlight = useCallback(
    (id: string) => {
      setFlights((prev) => prev.filter((f) => f.id !== id))
    },
    [setFlights],
  )

  return { flights, loading, addFlight, updateFlight, removeFlight }
}
