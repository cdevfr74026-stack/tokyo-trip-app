import { useEffect, useState } from 'react'
import { fetchTokyoWeather } from '@/lib/weather'
import type { DayWeather } from '@/types'

export function useWeather(startDate?: string, endDate?: string) {
  const [byDate, setByDate] = useState<Record<string, DayWeather>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [outOfRange, setOutOfRange] = useState(false)

  useEffect(() => {
    if (!startDate || !endDate) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTokyoWeather(startDate, endDate)
      .then((result) => {
        if (cancelled) return
        setByDate(result.byDate)
        setOutOfRange(result.outOfForecastRange)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '天氣資料載入失敗')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  return { byDate, loading, error, outOfRange }
}
