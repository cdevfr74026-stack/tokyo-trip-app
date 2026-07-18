import { useEffect, useState, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { seedTrip, seedDays, seedItineraryItems, seedBudget } from '@/lib/seedData'
import type { Trip, TripDay, ItineraryItem, Budget } from '@/types'

interface TripState {
  trip: Trip | null
  days: TripDay[]
  items: ItineraryItem[]
  budget: Budget | null
  loading: boolean
}

/**
 * 載入旅行核心資料。若為首次使用（storage 內無資料），
 * 會以東京 7 天 6 夜種子資料初始化，方便使用者立即體驗完整功能。
 */
export function useTrip() {
  const [state, setState] = useState<TripState>({
    trip: null,
    days: [],
    items: [],
    budget: null,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [trip, days, items, budget] = await Promise.all([
        storage.get<Trip>(STORAGE_KEYS.trip),
        storage.get<TripDay[]>(STORAGE_KEYS.days),
        storage.get<ItineraryItem[]>(STORAGE_KEYS.itineraryItems),
        storage.get<Budget>(STORAGE_KEYS.budget),
      ])

      if (cancelled) return

      if (!trip) {
        // 首次啟動：寫入種子資料
        await Promise.all([
          storage.set(STORAGE_KEYS.trip, seedTrip),
          storage.set(STORAGE_KEYS.days, seedDays),
          storage.set(STORAGE_KEYS.itineraryItems, seedItineraryItems),
          storage.set(STORAGE_KEYS.budget, seedBudget),
        ])
        setState({
          trip: seedTrip,
          days: seedDays,
          items: seedItineraryItems,
          budget: seedBudget,
          loading: false,
        })
      } else {
        setState({
          trip,
          days: days ?? seedDays,
          items: items ?? seedItineraryItems,
          budget: budget ?? seedBudget,
          loading: false,
        })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const updateTrip = useCallback(async (updater: (prev: Trip) => Trip) => {
    setState((prev) => {
      if (!prev.trip) return prev
      const next = updater(prev.trip)
      storage.set(STORAGE_KEYS.trip, next)
      return { ...prev, trip: next }
    })
  }, [])

  const updateBudget = useCallback(async (updater: (prev: Budget) => Budget) => {
    setState((prev) => {
      if (!prev.budget) return prev
      const next = updater(prev.budget)
      storage.set(STORAGE_KEYS.budget, next)
      return { ...prev, budget: next }
    })
  }, [])

  const updateDay = useCallback((dayId: string, patch: Partial<TripDay>) => {
    setState((prev) => {
      const next = prev.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d))
      storage.set(STORAGE_KEYS.days, next)
      return { ...prev, days: next }
    })
  }, [])

  return { ...state, updateTrip, updateBudget, updateDay }
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
