import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { TransitTicket } from '@/types'

export type TicketDraft = Omit<TransitTicket, 'id' | 'tripId'>

export function useTickets() {
  const [tickets, setTickets] = useState<TransitTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<TransitTicket[]>(STORAGE_KEYS.tickets).then((saved) => {
      if (cancelled) return
      setTickets(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addTicket = useCallback((draft: TicketDraft) => {
    setTickets((prev) => {
      const next: TransitTicket[] = [...prev, { id: `ticket-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }]
      storage.set(STORAGE_KEYS.tickets, next)
      return next
    })
  }, [])

  const updateTicket = useCallback((id: string, draft: TicketDraft) => {
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...draft } : t))
      storage.set(STORAGE_KEYS.tickets, next)
      return next
    })
  }, [])

  const removeTicket = useCallback((id: string) => {
    setTickets((prev) => {
      const next = prev.filter((t) => t.id !== id)
      storage.set(STORAGE_KEYS.tickets, next)
      return next
    })
  }, [])

  return { tickets, loading, addTicket, updateTicket, removeTicket }
}
