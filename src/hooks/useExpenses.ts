import { useCallback, useEffect, useMemo, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Expense, Traveler } from '@/types'

export interface ExpenseDraft {
  date: string
  dayId?: string
  category: Expense['category']
  merchant: string
  amountForeign: number
  payerId: string
  isSplit: boolean
  splitWith: string[]
  note?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    storage.get<Expense[]>(STORAGE_KEYS.expenses).then((saved) => {
      if (cancelled) return
      setExpenses(saved ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addExpense = useCallback((draft: ExpenseDraft) => {
    setExpenses((prev) => {
      const next: Expense[] = [
        ...prev,
        {
          id: `expense-${Date.now()}`,
          tripId: 'trip-tokyo-2026',
          ...draft,
        },
      ]
      storage.set(STORAGE_KEYS.expenses, next)
      return next
    })
  }, [])

  const updateExpense = useCallback((id: string, draft: ExpenseDraft) => {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...draft } : e))
      storage.set(STORAGE_KEYS.expenses, next)
      return next
    })
  }, [])

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id)
      storage.set(STORAGE_KEYS.expenses, next)
      return next
    })
  }, [])

  return { expenses, loading, addExpense, updateExpense, removeExpense }
}

/** 計算每位旅伴的已付款、應負擔、應收、應付，以及最終結算建議 */
export function computeSettlement(expenses: Expense[], travelers: Traveler[]) {
  const totalForeign = expenses.reduce((sum, e) => sum + e.amountForeign, 0)

  const paidById: Record<string, number> = {}
  const owedById: Record<string, number> = {}
  for (const t of travelers) {
    paidById[t.id] = 0
    owedById[t.id] = 0
  }

  for (const e of expenses) {
    paidById[e.payerId] = (paidById[e.payerId] ?? 0) + e.amountForeign
    if (e.isSplit && e.splitWith.length > 0) {
      const share = e.amountForeign / e.splitWith.length
      for (const uid of e.splitWith) {
        owedById[uid] = (owedById[uid] ?? 0) + share
      }
    } else {
      // 不分攤：由付款人自己全額負擔
      owedById[e.payerId] = (owedById[e.payerId] ?? 0) + e.amountForeign
    }
  }

  const balances = travelers.map((t) => {
    const paid = paidById[t.id] ?? 0
    const owed = owedById[t.id] ?? 0
    return { traveler: t, paid, owed, net: paid - owed } // net > 0 表示別人欠這個人
  })

  // 簡易結算：淨負值的人要付給淨正值的人
  const settlements: { from: Traveler; to: Traveler; amount: number }[] = []
  const debtors = balances.filter((b) => b.net < -0.5).map((b) => ({ ...b }))
  const creditors = balances.filter((b) => b.net > 0.5).map((b) => ({ ...b }))
  let di = 0
  let ci = 0
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]
    const amount = Math.min(-debtor.net, creditor.net)
    if (amount > 0.5) {
      settlements.push({ from: debtor.traveler, to: creditor.traveler, amount })
    }
    debtor.net += amount
    creditor.net -= amount
    if (Math.abs(debtor.net) < 0.5) di++
    if (Math.abs(creditor.net) < 0.5) ci++
  }

  return { totalForeign, balances, settlements }
}

export function useSettlement(expenses: Expense[], travelers: Traveler[]) {
  return useMemo(() => computeSettlement(expenses, travelers), [expenses, travelers])
}
