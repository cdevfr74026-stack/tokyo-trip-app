import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CloudSun, Umbrella, Wallet2, Sparkles, Moon, SunMedium, Map, Ticket, Plus, ExternalLink } from 'lucide-react'
import { useTrip, getCountdown } from '@/hooks/useTrip'
import { useExpenses } from '@/hooks/useExpenses'
import { useWeather } from '@/hooks/useWeather'
import { useTheme } from '@/hooks/useTheme'
import { useCoupons, type CouponDraft } from '@/hooks/useCoupons'
import { Card } from '@/components/ui/Card'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StampBadge } from '@/components/ui/StampBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PullToRefresh } from '@/components/feedback/PullToRefresh'
import { ImageViewerModal } from '@/components/feedback/ImageViewerModal'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { SwipeToDelete } from '@/components/feedback/SwipeToDelete'
import { useToast } from '@/components/feedback/Toast'
import { formatDateRange, formatCurrency, getDailyQuote } from '@/lib/format'
import { TRIP_QUOTES } from '@/lib/seedData'
import { useNavigate } from 'react-router-dom'

const SUBWAY_MAPS = [
  { id: 'tokyo-metro', title: '東京地鐵路線圖', src: 'maps/tokyo-metro.jpg' },
  { id: 'jr-east', title: 'JR東日本路線圖', src: 'maps/jr-east.jpg' },
] as const

const EMPTY_COUPON_DRAFT: CouponDraft = { name: '', url: '' }

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
  const { trip, loading } = useTrip()
  const { expenses } = useExpenses()
  const { mode, toggle } = useTheme()
  const navigate = useNavigate()
  const { byDate: weatherByDate } = useWeather(trip?.startDate, trip?.endDate)
  const [openMapId, setOpenMapId] = useState<string | null>(null)
  const { coupons, addCoupon, removeCoupon } = useCoupons()
  const [couponSheetOpen, setCouponSheetOpen] = useState(false)
  const [couponDraft, setCouponDraft] = useState<CouponDraft>(EMPTY_COUPON_DRAFT)
  const { show } = useToast()

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
  const todayISO = new Date().toISOString().slice(0, 10)
  const todayWeather = weatherByDate[todayISO]

  const spentForeign = expenses.reduce((sum, e) => sum + e.amountForeign, 0)
  const spentTwd = spentForeign * trip.exchangeRate
  const quote = getDailyQuote(TRIP_QUOTES)

  function openAddCoupon() {
    setCouponDraft(EMPTY_COUPON_DRAFT)
    setCouponSheetOpen(true)
  }

  function handleSaveCoupon() {
    if (!couponDraft.name.trim() || !couponDraft.url.trim()) {
      show('請輸入名稱與網址', 'error')
      return
    }
    addCoupon(couponDraft)
    setCouponSheetOpen(false)
    show('已加入優惠券連結', 'success')
  }

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
        {/* 天氣 + 總支出 兩欄 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4 cursor-pointer text-left active:opacity-80" onClick={() => navigate('/weather')}>
            <div className="flex items-center gap-1.5 text-warmgray dark:text-warmgray-light">
              <CloudSun size={16} />
              <span className="text-xs">今日天氣</span>
            </div>
            {todayWeather ? (
              <>
                <p className="mt-2 font-display text-2xl text-ink dark:text-cream-soft">
                  {todayWeather.icon} {todayWeather.highTemp}° / {todayWeather.lowTemp}°
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-mist">
                  <Umbrella size={12} /> 降雨 {todayWeather.precipitationChance}%
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-lg text-ink/60 dark:text-cream-soft/60">尚未開放</p>
                <p className="mt-1 text-[11px] text-warmgray dark:text-warmgray-light">出發前 16 天內顯示</p>
              </>
            )}
          </Card>
          <Card className="!p-4 cursor-pointer text-left active:opacity-80" onClick={() => navigate('/expenses')}>
            <div className="flex items-center gap-1.5 text-warmgray dark:text-warmgray-light">
              <Wallet2 size={16} />
              <span className="text-xs">目前總支出</span>
            </div>
            <p className="mt-2 font-display text-2xl text-ink dark:text-cream-soft">
              {formatCurrency(spentTwd, 'TWD')}
            </p>
            <p className="mt-1 text-[11px] text-warmgray dark:text-warmgray-light">
              約 {formatCurrency(spentForeign, 'JPY')}・共 {expenses.length} 筆紀錄
            </p>
          </Card>
        </div>

        {/* 地鐵路線圖 */}
        <div>
          <SectionLabel icon={<Map size={15} className="text-sage-dark dark:text-sage-light" />}>
            地鐵路線圖
          </SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            {SUBWAY_MAPS.map((m) => (
              <button
                key={m.id}
                onClick={() => setOpenMapId(m.id)}
                className="overflow-hidden rounded-card bg-cream-card text-left shadow-card active:scale-[0.98] dark:bg-dusk-card"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-cream-soft dark:bg-dusk-bg">
                  <img src={m.src} alt={m.title} className="h-full w-full object-cover object-left-top" />
                </div>
                <p className="px-3 py-2.5 text-[12.5px] text-ink dark:text-cream-soft">{m.title}</p>
              </button>
            ))}
          </div>
        </div>

        {SUBWAY_MAPS.map((m) => (
          <ImageViewerModal
            key={m.id}
            open={openMapId === m.id}
            onClose={() => setOpenMapId(null)}
            src={m.src}
            title={m.title}
          />
        ))}

        {/* 優惠券連結 */}
        <div>
          <SectionLabel
            icon={<Ticket size={15} className="text-sage-dark dark:text-sage-light" />}
            action={
              <button
                onClick={openAddCoupon}
                className="flex items-center gap-0.5 text-xs text-sage-dark active:opacity-60 dark:text-sage-light"
              >
                <Plus size={13} /> 新增
              </button>
            }
          >
            優惠券連結
          </SectionLabel>

          {coupons.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">🎟️</span>}
              title="還沒有加入優惠券連結"
              description="把折扣碼、電子票券的網址存在這裡，隨時點開使用"
            />
          ) : (
            <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
              <AnimatePresence initial={false}>
                {coupons.map((c) => (
                  <SwipeToDelete key={c.id} onDelete={() => removeCoupon(c.id)}>
                    <motion.a
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3.5 active:opacity-70"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light">
                        <Ticket size={15} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] text-ink dark:text-cream-soft">
                        {c.name}
                      </span>
                      <ExternalLink size={15} className="shrink-0 text-warmgray dark:text-warmgray-light" />
                    </motion.a>
                  </SwipeToDelete>
                ))}
              </AnimatePresence>
            </Card>
          )}
        </div>

        <BottomSheet open={couponSheetOpen} onClose={() => setCouponSheetOpen(false)} title="新增優惠券連結">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">名稱 *</label>
              <input
                value={couponDraft.name}
                onChange={(e) => setCouponDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="例如：唐吉訶德 5% off"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">網址 *</label>
              <input
                value={couponDraft.url}
                onChange={(e) => setCouponDraft((p) => ({ ...p, url: e.target.value }))}
                placeholder="貼上優惠券或電子票券的網址"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <button
              onClick={handleSaveCoupon}
              className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
            >
              加入
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  )
}
