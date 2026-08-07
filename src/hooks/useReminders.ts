import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { Reminder } from '@/types'

export type ReminderDraft = Omit<Reminder, 'id' | 'tripId' | 'completed'>

export function useReminders() {
  const { value: reminders, setValue: setReminders, loading } = useCloudState<Reminder[]>(
    STORAGE_KEYS.reminders,
    () => [],
  )

  const addReminder = useCallback(
    (draft: ReminderDraft) => {
      setReminders((prev) => [
        ...prev,
        { id: `reminder-${Date.now()}`, tripId: 'trip-tokyo-2026', completed: false, ...draft },
      ])
    },
    [setReminders],
  )

  const updateReminder = useCallback(
    (id: string, draft: ReminderDraft) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...draft } : r)))
    },
    [setReminders],
  )

  const toggleReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)))
    },
    [setReminders],
  )

  const removeReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id))
    },
    [setReminders],
  )

  return { reminders, loading, addReminder, updateReminder, toggleReminder, removeReminder }
}
