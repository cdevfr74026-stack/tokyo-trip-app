import { useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import type { Expense, FundContribution, Traveler } from '@/types'

export const FUND_TRAVELER_ID = 'fund'

export interface ExpenseDraft {
  date: string
  dayId?: string
  category: Expense['category']
  merchant: string
  amountForeign: number
  amountInput: number
  currency: 'JPY' | 'TWD'
  payerId: string
  isSplit: boolean
  splitWith: string[]
  note?: string
}

export function useExpenses() {
  const { value: expenses, setValue: setExpenses, loading } = useCloudState<Expense[]>(
    STORAGE_KEYS.expenses,
    () => [],
  )

  const addExpense = useCallback(
    (draft: ExpenseDraft) => {
      setExpenses((prev) => [
        ...prev,
        {
          id: `expense-${Date.now()}`,
          tripId: 'trip-tokyo-2026',
          ...draft,
        },
      ])
    },
    [setExpenses],
  )

  const updateExpense = useCallback(
    (id: string, draft: ExpenseDraft) => {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...draft } : e)))
    },
    [setExpenses],
  )

  const removeExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    },
    [setExpenses],
  )

  return { expenses, loading, addExpense, updateExpense, removeExpense }
}

export function computeSettlement(expenses: Expense[], travelers: Traveler[], contributions: FundContribution[] = []) {
  const totalForeign = expenses.reduce((sum, e) => sum + e.amountForeign, 0)
  const fundSpent = expenses.filter((e) => e.payerId === FUND_TRAVELER_ID).reduce((sum, e) => sum + e.amountForeign, 0)
  const fundContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
  const fundBalance = fundContributed - fundSpent

  const paidById: Record<string, number> = {}
  const owedById: Record<string, number> = {}
  for (const t of travelers) {
    paidById[t.id] = 0
    owedById[t.id] = 0
  }

  for (const c of contributions) {
    paidById[c.travelerId] = (paidById[c.travelerId] ?? 0) + c.amount
  }

  for (const e of expenses) {
    if (e.payerId !== FUND_TRAVELER_ID) {
      paidById[e.payerId] = (paidById[e.payerId] ?? 0) + e.amountForeign
    }
    const owedTargets =
      e.isSplit && e.splitWith.length > 0
        ? e.splitWith
        : e.payerId === FUND_TRAVELER_ID
        ? travelers.map((t) => t.id)
        : [e.payerId]
    const share = e.amountForeign / owedTargets.length
    for (const uid of owedTargets) {
      owedById[uid] = (owedById[uid] ?? 0) + share
    }
  }

  const balances = travelers.map((t) => {
    const paid = paidById[t.id] ?? 0
    const owed = owedById[t.id] ?? 0
    return { traveler: t, paid, owed, net: paid - owed }
  })

  const avgNet = balances.length > 0 ? balances.reduce((sum, b) => sum + b.net, 0) / balances.length : 0
  const adjusted = balances.map((b) => ({ ...b, adjustedNet: b.net - avgNet }))

  const settlements: { from: Traveler; to: Traveler; amount: number }[] = []
  const debtors = adjusted.filter((b) => b.adjustedNet < -0.5).map((b) => ({ ...b, remaining: b.adjustedNet }))
  const creditors = adjusted.filter((b) => b.adjustedNet > 0.5).map((b) => ({ ...b, remaining: b.adjustedNet }))
  let di = 0
  let ci = 0
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]
    const amount = Math.min(-debtor.remaining, creditor.remaining)
    if (amount > 0.5) {
      settlements.push({ from: debtor.traveler, to: creditor.traveler, amount })
    }
    debtor.remaining += amount
    creditor.remaining -= amount
    if (Math.abs(debtor.remaining) < 0.5) di++
    if (Math.abs(creditor.remaining) < 0.5) ci++
  }

  return { totalForeign, balances, settlements, fundBalance, fundContributed, fundSpent }
}

export function useSettlement(expenses: Expense[], travelers: Traveler[], contributions: FundContribution[] = []) {
  return useMemo(() => computeSettlement(expenses, travelers, contributions), [expenses, travelers, contributions])
}
