import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Umbrella, CloudSun } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useWeather } from '@/hooks/useWeather'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateWithWeekday } from '@/lib/format'

export default function Weather() {
  const navigate = useNavigate()
  const { trip, days, loading: tripLoading } = useTrip()
  const { byDate, loading: weatherLoading, error, outOfRange } = useWeather(trip?.startDate, trip?.endDate)

  const loading = tripLoading || weatherLoading

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回">
          <ArrowLeft size={20} className="text-ink dark:text-cream-soft" />
        </button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">天氣預報</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">每日天氣與穿搭建議・東京</p>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {loading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {!loading && error && (
          <EmptyState
            icon={<CloudSun size={36} className="text-warmgray/60" />}
            title="天氣資料載入失敗"
            description="請檢查網路連線，稍後再試一次"
          />
        )}

        {!loading && !error && outOfRange && (
          <EmptyState
            icon={<span className="text-4xl">🌦️</span>}
            title="天氣預報還沒開放"
            description="氣象預報通常只能看到出發前 16 天內的資料，距離出發日更近時再回來看看吧"
          />
        )}

        {!loading &&
          !error &&
          !outOfRange &&
          days.map((d) => {
            const w = byDate[d.date]
            return (
              <Card key={d.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-warmgray dark:text-warmgray-light">
                      Day {d.dayIndex}・{formatDateWithWeekday(d.date)}
                    </p>
                    {w ? (
                      <p className="mt-1 font-display text-[15px] text-ink dark:text-cream-soft">{w.condition}</p>
                    ) : (
                      <p className="mt-1 text-[13px] text-warmgray/70 dark:text-warmgray-light/70">尚無資料</p>
                    )}
                  </div>
                  {w && <span className="text-3xl">{w.icon}</span>}
                </div>
                {w && (
                  <>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="font-display text-lg text-ink dark:text-cream-soft">
                        {w.highTemp}° / {w.lowTemp}°
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-mist">
                        <Umbrella size={12} /> 降雨 {w.precipitationChance}%
                      </span>
                    </div>
                    {w.outfitAdvice && (
                      <p className="mt-2 rounded-soft bg-cream-soft px-3 py-2 text-[12px] text-ink/70 dark:bg-dusk-bg dark:text-cream-soft/70">
                        👕 {w.outfitAdvice}
                      </p>
                    )}
                  </>
                )}
              </Card>
            )
          })}
      </div>
    </div>
  )
}
