import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PiggyBank, Trash2, HandCoins, Pencil } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useExpenses, useSettlement, type ExpenseDraft } from '@/hooks/useExpenses'
import { Card } from '@/components/ui/Card'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import { EXPENSE_CATEGORY_META } from '@/lib/categoryMeta'
import { formatCurrency } from '@/lib/format'
import type { ExpenseCategory } from '@/types'

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_META) as [ExpenseCategory, { label: string; emoji: string }][]

const AVATAR_BG: Record<string, string> = {
  sage: 'bg-sage-light dark:bg-sage-dark/40',
  milktea: 'bg-milktea-light dark:bg-milktea-dark/40',
  mist: 'bg-mist-light dark:bg-mist/40',
  apricot: 'bg-apricot-light dark:bg-apricot/40',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Expenses() {
  const navigate = useNavigate()
  const { trip, budget, loading: tripLoading } = useTrip()
  const { expenses, loading: expensesLoading, addExpense, updateExpense, removeExpense } = useExpenses()
  const { show } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ExpenseDraft | null>(null)

  const loading = tripLoading || expensesLoading

  const settlement = useSettlement(expenses, trip?.travelers ?? [])

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses],
  )

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    )
  }

  const totalBudgetTwd = budget?.total ?? 0
  const spentTwd = settlement.totalForeign * trip.exchangeRate
  const usedPercent = totalBudgetTwd > 0 ? (spentTwd * 100) / totalBudgetTwd : 0

  function openAddForm() {
    setEditingId(null)
    setDraft({
      date: todayISO(),
      category: 'food',
      merchant: '',
      amountForeign: 0,
      payerId: trip!.travelers[0]?.id ?? '',
      isSplit: true,
      splitWith: trip!.travelers.map((t) => t.id),
      note: '',
    })
    setFormOpen(true)
  }

  function openEditForm(expenseId: string) {
    const e = expenses.find((x) => x.id === expenseId)
    if (!e) return
    setEditingId(e.id)
    setDraft({
      date: e.date,
      dayId: e.dayId,
      category: e.category,
      merchant: e.merchant,
      amountForeign: e.amountForeign,
      payerId: e.payerId,
      isSplit: e.isSplit,
      splitWith: e.splitWith,
      note: e.note ?? '',
    })
    setFormOpen(true)
  }

  function handleSave() {
    if (!draft) return
    if (!draft.merchant.trim() || draft.amountForeign <= 0) {
      show('請輸入店家與金額', 'error')
      return
    }
    const clean: ExpenseDraft = {
      ...draft,
      merchant: draft.merchant.trim(),
      note: draft.note || undefined,
      splitWith: draft.isSplit ? draft.splitWith : [],
    }
    if (editingId) {
      updateExpense(editingId, clean)
      show('花費已更新', 'success')
    } else {
      addExpense(clean)
      show('花費已新增', 'success')
    }
    setFormOpen(false)
  }

  function toggleSplitWith(id: string) {
    if (!draft) return
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            splitWith: prev.splitWith.includes(id)
              ? prev.splitWith.filter((x) => x !== id)
              : [...prev.splitWith, id],
          }
        : prev,
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">花費</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">記下每一筆旅途中的小小奢侈</p>
      </header>

      <div className="space-y-5 px-5">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-warmgray dark:text-warmgray-light">
              <PiggyBank size={16} />
              <span className="text-xs">旅行預算</span>
            </div>
            <button
              onClick={() => navigate('/more', { state: { openSettings: true } })}
              className="flex items-center gap-1 text-xs text-sage-dark active:opacity-60 dark:text-sage-light"
            >
              <Pencil size={12} /> 編輯
            </button>
          </div>
          <p className="mt-2 font-display text-3xl text-ink dark:text-cream-soft">{formatCurrency(totalBudgetTwd, 'TWD')}</p>
          <div className="mt-3">
            <ProgressBar value={usedPercent} />
          </div>
          <p className="mt-1.5 text-[12px] text-warmgray dark:text-warmgray-light">
            已花費 {formatCurrency(spentTwd, 'TWD')}（約 {formatCurrency(settlement.totalForeign, 'JPY')}）・剩餘{' '}
            {Math.max(0, 100 - usedPercent).toFixed(0)}%
          </p>
        </Card>

        <div>
          <SectionLabel
            action={
              expenses.length > 0 && (
                <button
                  onClick={() => setSettleOpen(true)}
                  className="flex items-center gap-1 text-xs text-sage-dark active:opacity-60 dark:text-sage-light"
                >
                  <HandCoins size={13} /> 一鍵結算
                </button>
              )
            }
          >
            旅伴分帳
          </SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {trip.travelers.map((t) => {
              const balance = settlement.balances.find((b) => b.traveler.id === t.id)
              return (
                <Card key={t.id} className="!p-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${AVATAR_BG[t.avatarColor] ?? AVATAR_BG.sage}`}>
                      {t.avatarEmoji}
                    </div>
                    <span className="text-sm text-ink dark:text-cream-soft">{t.name}</span>
                  </div>
                  <p className="mt-3 font-display text-lg text-ink dark:text-cream-soft">
                    ¥{Math.round(balance?.paid ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-warmgray dark:text-warmgray-light">
                    已代墊・約 {formatCurrency((balance?.paid ?? 0) * trip.exchangeRate, 'TWD')}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <SectionLabel>最近花費</SectionLabel>
          {sortedExpenses.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">🧾</span>}
              title="還沒有花費紀錄"
              description="點擊右下角按鈕，記下今天的第一筆花費吧"
            />
          ) : (
            <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
              {sortedExpenses.map((e) => {
                const payer = trip.travelers.find((t) => t.id === e.payerId)
                return (
                  <div
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEditForm(e.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-cream-soft/60 dark:active:bg-dusk-bg/60"
                  >
                    <span className="text-lg">{EXPENSE_CATEGORY_META[e.category].emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-ink dark:text-cream-soft">{e.merchant}</p>
                      <p className="text-[11px] text-warmgray dark:text-warmgray-light">
                        {payer?.name ?? '—'} 付款{e.isSplit ? `・${e.splitWith.length} 人分攤` : '・不分攤'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium text-ink dark:text-cream-soft">
                        ¥{e.amountForeign.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-warmgray dark:text-warmgray-light">
                        {formatCurrency(e.amountForeign * trip.exchangeRate, 'TWD')}
                      </p>
                    </div>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        removeExpense(e.id)
                      }}
                      aria-label="刪除"
                      className="text-warmgray/50 active:text-apricot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      </div>

      <FAB icon={<Plus size={24} />} label="新增花費" onClick={openAddForm} />

      {/* 一鍵結算 */}
      <BottomSheet open={settleOpen} onClose={() => setSettleOpen(false)} title="旅行結算">
        <div className="space-y-3">
          {settlement.settlements.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-warmgray dark:text-warmgray-light">目前帳務兩不相欠 🎉</p>
          ) : (
            settlement.settlements.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-soft bg-cream px-4 py-3 text-[14px] dark:bg-dusk-bg"
              >
                <span className="text-ink dark:text-cream-soft">
                  {s.from.name} → {s.to.name}
                </span>
                <span className="text-right">
                  <span className="block font-display text-sage-dark dark:text-sage-light">
                    ¥{Math.round(s.amount).toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-warmgray dark:text-warmgray-light">
                    約 {formatCurrency(s.amount * trip.exchangeRate, 'TWD')}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </BottomSheet>

      {/* 新增花費表單 */}
      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? '編輯花費' : '新增花費'}>
        {draft && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">店家 *</label>
              <input
                autoFocus
                value={draft.merchant}
                onChange={(e) => setDraft((p) => (p ? { ...p, merchant: e.target.value } : p))}
                placeholder="例如：一蘭拉麵"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">金額（¥） *</label>
              <input
                type="number"
                inputMode="numeric"
                value={draft.amountForeign || ''}
                onChange={(e) => setDraft((p) => (p ? { ...p, amountForeign: Number(e.target.value) || 0 } : p))}
                placeholder="0"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
              {draft.amountForeign > 0 && (
                <p className="mt-1 text-[12px] text-warmgray dark:text-warmgray-light">
                  約 {formatCurrency(draft.amountForeign * trip.exchangeRate, 'TWD')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">分類</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setDraft((p) => (p ? { ...p, category: key } : p))}
                    className={`rounded-pill px-3 py-1.5 text-[12px] ${
                      draft.category === key
                        ? 'bg-sage text-cream-card'
                        : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">付款人</label>
              <div className="flex flex-wrap gap-2">
                {trip.travelers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDraft((p) => (p ? { ...p, payerId: t.id } : p))}
                    className={`rounded-pill px-3 py-1.5 text-[12px] ${
                      draft.payerId === t.id
                        ? 'bg-milktea text-cream-card'
                        : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                    }`}
                  >
                    {t.avatarEmoji} {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[12px] text-warmgray dark:text-warmgray-light">共同分攤</label>
                <button
                  onClick={() => setDraft((p) => (p ? { ...p, isSplit: !p.isSplit } : p))}
                  className={`h-6 w-11 rounded-pill transition-colors ${
                    draft.isSplit ? 'bg-sage' : 'bg-khaki dark:bg-dusk-border'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 translate-y-0.5 rounded-full bg-cream-card shadow transition-transform ${
                      draft.isSplit ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {draft.isSplit && (
                <div className="flex flex-wrap gap-2">
                  {trip.travelers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleSplitWith(t.id)}
                      className={`rounded-pill px-3 py-1.5 text-[12px] ${
                        draft.splitWith.includes(t.id)
                          ? 'bg-sage-light text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light'
                          : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                      }`}
                    >
                      {t.avatarEmoji} {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">備註</label>
              <input
                value={draft.note ?? ''}
                onChange={(e) => setDraft((p) => (p ? { ...p, note: e.target.value } : p))}
                placeholder="選填"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>

            <button
              onClick={handleSave}
              className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
            >
              {editingId ? '儲存修改' : '加入紀錄'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
