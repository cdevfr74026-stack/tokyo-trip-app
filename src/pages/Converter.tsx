import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Converter() {
  const navigate = useNavigate()
  const { trip, loading } = useTrip()
  const [jpy, setJpy] = useState('1000')
  const [twd, setTwd] = useState('')

  const rate = trip?.exchangeRate ?? 0.21

  function handleJpyChange(value: string) {
    setJpy(value)
    const n = Number(value)
    setTwd(value && !Number.isNaN(n) ? (n * rate).toFixed(1) : '')
  }

  function handleTwdChange(value: string) {
    setTwd(value)
    const n = Number(value)
    setJpy(value && !Number.isNaN(n) && rate > 0 ? Math.round(n / rate).toString() : '')
  }

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回">
          <ArrowLeft size={20} className="text-ink dark:text-cream-soft" />
        </button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">匯率換算</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">日幣／台幣即時換算</p>
        </div>
      </header>

      <div className="px-5">
        <Card>
          <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">日圓 JPY</label>
          <div className="flex items-center gap-2 rounded-soft border border-khaki/60 bg-cream px-4 py-3 focus-within:border-sage dark:border-dusk-border dark:bg-dusk-bg">
            <span className="text-[15px] text-warmgray dark:text-warmgray-light">¥</span>
            <input
              value={jpy}
              onChange={(e) => handleJpyChange(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              className="w-full bg-transparent text-[20px] text-ink outline-none dark:text-cream-soft"
            />
          </div>

          <div className="my-3 flex items-center justify-center text-warmgray dark:text-warmgray-light">
            <ArrowLeftRight size={16} />
          </div>

          <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">新台幣 TWD</label>
          <div className="flex items-center gap-2 rounded-soft border border-khaki/60 bg-cream px-4 py-3 focus-within:border-sage dark:border-dusk-border dark:bg-dusk-bg">
            <span className="text-[15px] text-warmgray dark:text-warmgray-light">NT$</span>
            <input
              value={twd}
              onChange={(e) => handleTwdChange(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              className="w-full bg-transparent text-[20px] text-ink outline-none dark:text-cream-soft"
            />
          </div>

          <p className="mt-4 text-center text-[12px] text-warmgray dark:text-warmgray-light">
            目前匯率：1 JPY ≈ {rate} TWD
          </p>
        </Card>

        <p className="mt-3 px-1 text-[11px] text-warmgray/80 dark:text-warmgray-light/80">
          想調整匯率嗎？到「更多 → 設定」裡修改，這裡跟花費頁都會自動套用新匯率。
        </p>
      </div>
    </div>
  )
}
