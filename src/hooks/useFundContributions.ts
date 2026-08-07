import { useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { FundContribution } from '@/types'

export interface FundContributionDraft {
  travelerId: string
  amount: number
  date: string
  note?: string
}

export function useFundContributions() {
  const { value: contributions, setValue: setContributions, loading } = useCloudState<FundContribution[]>(
    STORAGE_KEYS.fundContributions,
    () => [],
  )

  const addContribution = useCallback(
    (draft: FundContributionDraft) => {
      setContributions((prev) => [
        ...prev,
        { id: `fund-${Date.now()}`, tripId: 'trip-tokyo-2026', ...draft },
      ])
    },
    [setContributions],
  )

  const updateContribution = useCallback(
    (id: string, draft: FundContributionDraft) => {
      setContributions((prev) => prev.map((c) => (c.id === id ? { ...c, ...draft } : c)))
    },
    [setContributions],
  )

  const removeContribution = useCallback(
    (id: string) => {
      setContributions((prev) => prev.filter((c) => c.id !== id))
    },
    [setContributions],
  )

  return { contributions, loading, addContribution, updateContribution, removeContribution }
}
