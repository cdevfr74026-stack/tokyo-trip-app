import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import { seedTrip, seedDays, seedItineraryItems, seedBudget } from '@/lib/seedData'
import type { Trip, TripDay, ItineraryItem, Budget } from '@/types'

export function useTrip() {
  const tripState = useCloudState<Trip>(STORAGE_KEYS.trip, () => seedTrip)
  const daysState = useCloudState<TripDay[]>(STORAGE_KEYS.days, () => seedDays)
  const itemsState = useCloudState<ItineraryItem[]>(STORAGE_KEYS.itineraryItems, () => seedItineraryItems)
  const budgetState = useCloudState<Budget>(STORAGE_KEYS.budget, () => seedBudget)

  const loading = tripState.loading || daysState.loading || itemsState.loading || budgetState.loading

  const updateTrip = useCallback(
    async (updater: (prev: Trip) => Trip) => {
      tripState.setValue((prev) => updater(prev))
    },
    [tripState],
  )

  const updateBudget = useCallback(
    async (updater: (prev: Budget) => Budget) => {
      budgetState.setValue((prev) => updater(prev))
    },
    [budgetState],
  )

  const updateDay = useCallback(
    (dayId: string, patch: Partial<TripDay>) => {
      daysState.setValue((prev) => prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d)))
    },
    [daysState],
  )

  return {
    trip: tripState.value,
    days: daysState.value,
    items: itemsState.value,
    budget: budgetState.value,
    loading,
    updateTrip,
    updateBudget,
    updateDay,
  }
}

/** 計算距離出發（或旅程中的第幾天）的輔助函式 */
export function getCountdown(startDate: string, endDate: string) {
  const now = new Date()
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T23:59:59')
  const msPerDay = 1000 * 60 * 60 * 24

  if (now < start) {
    const diff = Math.ceil((start.getTime() - now.getTime()) / msPerDay)
    return { status: 'upcoming' as const, days: diff }
  }
  if (now >= start && now <= end) {
    const dayIndex = Math.floor((now.getTime() - start.getTime()) / msPerDay) + 1
    return { status: 'ongoing' as const, days: dayIndex }
  }
  const diff = Math.floor((now.getTime() - end.getTime()) / msPerDay)
  return { status: 'ended' as const, days: diff }
}
