import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Reminder } from '@/types'

export type ReminderDraft = Omit<Reminder, 'id' | 'tripId' | 'completed'>

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<Reminder[]>(STORAGE_KEYS.reminders).then((saved) => {
      if (cancelled) return
      setReminders(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addReminder = useCallback((draft: ReminderDraft) => {
    setReminders((prev) => {
      const next: Reminder[] = [
        ...prev,
        { id: `reminder-${Date.now()}`, tripId: 'trip-tokyo-2026', completed: false, ...draft },
      ]
      storage.set(STORAGE_KEYS.reminders, next)
      return next
    })
  }, [])

  const updateReminder = useCallback((id: string, draft: ReminderDraft) => {
    setReminders((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...draft } : r))
      storage.set(STORAGE_KEYS.reminders, next)
      return next
    })
  }, [])

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
      storage.set(STORAGE_KEYS.reminders, next)
      return next
    })
  }, [])

  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id)
      storage.set(STORAGE_KEYS.reminders, next)
      return next
    })
  }, [])

  return { reminders, loading, addReminder, updateReminder, toggleReminder, removeReminder }
}
