import { motion } from 'framer-motion'
import { useState } from 'react'
import { CloudSun, Umbrella, Wallet2, Sparkles, Moon, SunMedium, ChevronRight, MapPin } from 'lucide-react'
import { useTrip, getCountdown } from '@/hooks/useTrip'
import { useExpenses } from '@/hooks/useExpenses'
import { useTheme } from '@/hooks/useTheme'
import { Card } from '@/components/ui/Card'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StampBadge } from '@/components/ui/StampBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PullToRefresh } from '@/components/feedback/PullToRefresh'
import { useToast } from '@/components/feedback/Toast'
import { formatDateRange, formatCurrency, getDailyQuote } from '@/lib/format'
import { ITINERARY_CATEGORY_META } from '@/lib/categoryMeta'
import { TRIP_QUOTES } from '@/lib/seedData'
import { useNavigate } from 'react-router-dom'

const AVATAR_BG: Record<string, string> = {
  sage: 'bg-sage-light dark:bg-sage-dark/40',
  milktea: 'bg-milktea-light dark:bg-milktea-dark/40',
  mist: 'bg-mist-light dark:bg-mist/40',
  apricot: 'bg-apricot-light dark:bg-apricot/40',
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { show } = useToast()

  async function handleRefresh() {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshKey((k) => k + 1)
    show('已更新最新資料', 'success')
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <DashboardContent key={refreshKey} />
    </PullToRefresh>
  )
}

function DashboardContent() {
  const { trip, days, items, budget, loading } = useTrip()
  const { expenses } = useExpenses()
  const { mode, toggle } = useTheme()
  const navigate = useNavigate()

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
        <Skeleton className="h-40 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    )
  }

  const countdown = getCountdown(trip.startDate, trip.endDate)
  const todayDay =
    countdown.status === 'ongoing' ? days.find((d) => d.dayIndex === countdown.days) : undefined
  const todayItems = todayDay
    ? items.filter((i) => i.dayId === todayDay.id).sort((a, b) => a.order - b.order)
    : []

  const spentForeign = expenses.reduce((sum, e) => sum + e.amountForeign, 0)
  const totalBudgetTwd = budget?.total ?? 0
  const spentTwd = spentForeign * trip.exchangeRate
  const usedPercent = totalBudgetTwd > 0 ? (spentTwd * 100) / totalBudgetTwd : 0
  const quote = getDailyQuote(TRIP_QUOTES)

  return (
    <div className="mx-auto max-w-lg pb-6">
      {/* 封面 Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-milktea-light/50 via-cream to-cream px-5 pb-6 pt-[calc(env(safe-area-inset-top)+18px)] dark:from-dusk-coffee/40 dark:via-dusk-bg dark:to-dusk-bg">
        <div className="pointer-events-none absolute -right-6 -top-4 text-6xl opacity-20 animate-float-slow">
          🗼
        </div>
        <div className="pointer-events-none absolute left-2 top-24 text-3xl opacity-15">☁️</div>

        <div className="flex items-start justify-between">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-sm text-warmgray dark:text-warmgray-light">{trip.destination}</p>
            <h1 className="mt-1 font-display text-[26px] font-medium leading-tight text-ink dark:text-cream-soft">
              {trip.coverEmoji} {trip.name}
            </h1>
            <p className="mt-1.5 font-utility text-[13px] tracking-wide text-warmgray dark:text-warmgray-light">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </motion.div>

          <button
            onClick={toggle}
            aria-label="切換深色模式"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-card/80 text-warmgray shadow-card active:scale-90 dark:bg-dusk-card/80 dark:text-cream-soft"
          >
            {mode === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <StampBadge
            label={
              countdown.status === 'upcoming'
                ? `倒數 ${countdown.days}`
                : countdown.status === 'ongoing'
                ? `Day ${countdown.days}`
                : `已結束`
            }
            sub={countdown.status === 'upcoming' ? '天出發' : countdown.status === 'ongoing' ? '旅程中' : `${countdown.days} 天前`}
          />
          <div className="flex-1 rounded-soft bg-cream-card/70 px-4 py-2.5 text-[13px] leading-relaxed text-ink/70 dark:bg-dusk-card/70 dark:text-cream-soft/80">
            <Sparkles size={13} className="mb-1 inline text-apricot" /> {quote}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-5">
        {/* 天氣 + 預算 兩欄 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4">
            <div className="flex items-center gap-1.5 text-warmgray dark:text-warmgray-light">
              <CloudSun size={16} />
              <span className="text-xs">今日天氣</span>
            </div>
            <p className="mt-2 font-display text-2xl text-ink dark:text-cream-soft">28° / 22°</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-mist">
              <Umbrella size={12} /> 降雨 20%
            </p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-1.5 text-warmgray dark:text-warmgray-light">
              <Wallet2 size={16} />
              <span className="text-xs">目前預算</span>
            </div>
            <p className="mt-2 font-display text-2xl text-ink dark:text-cream-soft">
              {formatCurrency(totalBudgetTwd, 'TWD')}
            </p>
            <div className="mt-2">
              <ProgressBar value={usedPercent} />
            </div>
            <p className="mt-1 text-[11px] text-warmgray dark:text-warmgray-light">
              已使用 {usedPercent.toFixed(0)}%・剩餘 {(100 - usedPercent).toFixed(0)}%
            </p>
          </Card>
        </div>

        {/* 今日行程 */}
        <div>
          <SectionLabel
            icon={<MapPin size={15} className="text-sage-dark dark:text-sage-light" />}
            action={
              <button
                onClick={() => navigate('/itinerary')}
                className="flex items-center gap-0.5 text-xs text-warmgray active:opacity-60 dark:text-warmgray-light"
              >
                查看全部 <ChevronRight size={13} />
              </button>
            }
          >
            今天行程{todayDay ? `・${todayDay.areaLabel ?? ''}` : ''}
          </SectionLabel>

          {countdown.status !== 'ongoing' && (
            <EmptyState
              icon={<span className="text-4xl">🧳</span>}
              title={countdown.status === 'upcoming' ? '旅程尚未開始' : '旅程已經結束囉'}
              description={
                countdown.status === 'upcoming'
                  ? `再過 ${countdown.days} 天就出發，先去整理行程與行李吧！`
                  : '打開旅行紀念冊，回味這趟旅程的每一刻。'
              }
            />
          )}

          {countdown.status === 'ongoing' && todayItems.length === 0 && (
            <EmptyState icon={<span className="text-4xl">📝</span>} title="今天還沒有安排行程" description="到「行程」頁面新增今天要去的地方吧" />
          )}

          {countdown.status === 'ongoing' && todayItems.length > 0 && (
            <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
              {todayItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <span className="w-11 shrink-0 font-utility text-[12px] text-warmgray dark:text-warmgray-light">
                    {item.time ?? '--:--'}
                  </span>
                  <span className="text-lg">{ITINERARY_CATEGORY_META[item.category].emoji}</span>
                  <span className="flex-1 truncate text-[14px] text-ink dark:text-cream-soft">{item.title}</span>
                  {item.completed && <span className="text-sage-dark dark:text-sage-light">✓</span>}
                </motion.div>
              ))}
            </Card>
          )}
        </div>

        {/* 旅伴 */}
        <div>
          <SectionLabel>旅伴</SectionLabel>
          <div className="flex gap-3">
            {trip.travelers.map((t) => (
              <Card key={t.id} className="!p-3.5 flex flex-1 items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${
                    AVATAR_BG[t.avatarColor] ?? AVATAR_BG.sage
                  }`}
                >
                  {t.avatarEmoji}
                </div>
                <span className="text-sm text-ink dark:text-cream-soft">{t.name}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
