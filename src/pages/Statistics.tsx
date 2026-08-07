import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, MapPin, Image as ImageIcon, CalendarDays } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useExpenses } from '@/hooks/useExpenses'
import { useItineraryItems } from '@/hooks/useItineraryItems'
import { useMustBuyItems } from '@/hooks/useMustBuyItems'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EXPENSE_CATEGORY_META } from '@/lib/categoryMeta'
import { formatCurrency, formatDateWithWeekday } from '@/lib/format'
import type { ExpenseCategory } from '@/types'

const BAR_COLORS: Record<ExpenseCategory, string> = {
  accommodation: 'bg-wood',
  transport: 'bg-mist',
  food: 'bg-apricot',
  shopping: 'bg-milktea',
  ticket: 'bg-sage',
  souvenir: 'bg-matcha',
  pet: 'bg-sage-dark',
  other: 'bg-warmgray',
}

export default function Statistics() {
  const navigate = useNavigate()
  const { trip, days, loading: tripLoading } = useTrip()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { items, loading: itemsLoading } = useItineraryItems()
  const { items: mustBuyItems, loading: mustBuyLoading } = useMustBuyItems()

  const loading = tripLoading || expensesLoading || itemsLoading || mustBuyLoading

  const stats = useMemo(() => {
    const totalForeign = expenses.reduce((sum, e) => sum + e.amountForeign, 0)

    const byCategory: Record<ExpenseCategory, number> = {
      accommodation: 0,
      transport: 0,
      food: 0,
      shopping: 0,
      ticket: 0,
      souvenir: 0,
      pet: 0,
      other: 0,
    }
    for (const e of expenses) byCategory[e.category] += e.amountForeign

    const categoryRows = (Object.entries(byCategory) as [ExpenseCategory, number][])
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalForeign > 0 ? (amount / totalForeign) * 100 : 0,
      }))

    const byDate: Record<string, number> = {}
    for (const e of expenses) byDate[e.date] = (byDate[e.date] ?? 0) + e.amountForeign
    const dailyRows = Object.entries(byDate)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, amount]) => ({ date, amount }))

    const topExpenses = [...expenses].sort((a, b) => b.amountForeign - a.amountForeign).slice(0, 5)

    const photoCount = mustBuyItems.filter((i) => i.imageUrl).length

    return { totalForeign, categoryRows, dailyRows, topExpenses, photoCount }
  }, [expenses, mustBuyItems])

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    )
  }

  const totalTwd = stats.totalForeign * trip.exchangeRate
  const topCategory = stats.categoryRows[0]
  const topSpot = stats.topExpenses[0]

  const summaryText =
    expenses.length === 0
      ? '目前還沒有花費紀錄，快去記下第一筆旅費，回來這裡就能看到完整的旅行摘要囉。'
      : `這趟 ${days.length} 天的東京之旅，總共花費約 ${formatCurrency(totalTwd, 'TWD')}（¥${Math.round(stats.totalForeign).toLocaleString()}），走訪了 ${items.length} 個景點。${
          topCategory ? `花費最多的類別是「${EXPENSE_CATEGORY_META[topCategory.category].label}」，占了整體約 ${topCategory.percent.toFixed(0)}%。` : ''
        }${topSpot ? `單筆花費最高的是「${topSpot.merchant}」，¥${topSpot.amountForeign.toLocaleString()}。` : ''}`

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回">
          <ArrowLeft size={20} className="text-ink dark:text-cream-soft" />
        </button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">統計分析</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">旅行結束後的完整摘要</p>
        </div>
      </header>

      <div className="space-y-5 px-5">
        <Card>
          <p className="text-[13px] leading-relaxed text-ink/80 dark:text-cream-soft/85">📖 {summaryText}</p>
        </Card>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Card className="!p-3">
            <CalendarDays size={16} className="mx-auto mb-1 text-sage-dark dark:text-sage-light" />
            <p className="font-display text-lg text-ink dark:text-cream-soft">{days.length}</p>
            <p className="text-[11px] text-warmgray dark:text-warmgray-light">旅行天數</p>
          </Card>
          <Card className="!p-3">
            <MapPin size={16} className="mx-auto mb-1 text-sage-dark dark:text-sage-light" />
            <p className="font-display text-lg text-ink dark:text-cream-soft">{items.length}</p>
            <p className="text-[11px] text-warmgray dark:text-warmgray-light">景點數</p>
          </Card>
          <Card className="!p-3">
            <ImageIcon size={16} className="mx-auto mb-1 text-sage-dark dark:text-sage-light" />
            <p className="font-display text-lg text-ink dark:text-cream-soft">{stats.photoCount}</p>
            <p className="text-[11px] text-warmgray dark:text-warmgray-light">照片數</p>
          </Card>
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={36} className="text-warmgray/60" />}
            title="還沒有花費資料可以分析"
            description="到「花費」頁新增紀錄後，這裡會自動產生統計"
          />
        ) : (
          <>
            <Card>
              <p className="text-xs text-warmgray dark:text-warmgray-light">總花費</p>
              <p className="mt-1 font-display text-3xl text-ink dark:text-cream-soft">{formatCurrency(totalTwd, 'TWD')}</p>
              <p className="text-[12px] text-warmgray dark:text-warmgray-light">約 ¥{Math.round(stats.totalForeign).toLocaleString()}</p>
            </Card>

            <div>
              <p className="mb-2 px-1 text-[13px] font-medium text-ink dark:text-cream-soft">分類分析</p>
              <Card className="space-y-3">
                {stats.categoryRows.map((row) => (
                  <div key={row.category}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-ink dark:text-cream-soft">
                        {EXPENSE_CATEGORY_META[row.category].emoji} {EXPENSE_CATEGORY_META[row.category].label}
                      </span>
                      <span className="text-warmgray dark:text-warmgray-light">
                        {row.percent.toFixed(0)}%・¥{Math.round(row.amount).toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={row.percent} colorClass={BAR_COLORS[row.category]} />
                  </div>
                ))}
              </Card>
            </div>

            <div>
              <p className="mb-2 px-1 text-[13px] font-medium text-ink dark:text-cream-soft">每日花費</p>
              <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
                {stats.dailyRows.map((row) => (
                  <div key={row.date} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-ink dark:text-cream-soft">{formatDateWithWeekday(row.date)}</span>
                    <span className="text-[13px] text-warmgray dark:text-warmgray-light">
                      ¥{Math.round(row.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </Card>
            </div>

            <div>
              <p className="mb-2 px-1 text-[13px] font-medium text-ink dark:text-cream-soft">花費最高的項目</p>
              <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
                {stats.topExpenses.map((e, idx) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="font-display text-[13px] text-warmgray dark:text-warmgray-light">#{idx + 1}</span>
                    <span className="text-lg">{EXPENSE_CATEGORY_META[e.category].emoji}</span>
                    <span className="flex-1 truncate text-[13px] text-ink dark:text-cream-soft">{e.merchant}</span>
                    <span className="text-[13px] text-warmgray dark:text-warmgray-light">¥{e.amountForeign.toLocaleString()}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
