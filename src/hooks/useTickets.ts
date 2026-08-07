import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { TransitTicket } from '@/types'

export type TicketDraft = Omit<TransitTicket, 'id' | 'tripId'>

export function useTickets() {
  const { value: tickets, setValue: setTickets, loading } = useCloudState<TransitTicket[]>(
    STORAGE_KEYS.tickets,
    () => [],
  )

  const addTicket = useCallback(
    (draft: TicketDraft) => {
      setTickets((prev) => [...prev, { id: `ticket-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft }])
    },
    [setTickets],
  )

  const updateTicket = useCallback(
    (id: string, draft: TicketDraft) => {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...draft } : t)))
    },
    [setTickets],
  )

  const removeTicket = useCallback(
    (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id))
    },
    [setTickets],
  )

  return { tickets, loading, addTicket, updateTicket, removeTicket }
}
