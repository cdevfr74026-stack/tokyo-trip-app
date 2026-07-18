import { useMemo, useState } from 'react'
import { Navigation, Copy } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/feedback/Toast'
import { ITINERARY_CATEGORY_META } from '@/lib/categoryMeta'

type FilterMode = 'day' | 'category' | 'area'

export default function MapView() {
  const { days, items, loading } = useTrip()
  const [filterMode, setFilterMode] = useState<FilterMode>('day')
  const { show } = useToast()

  const grouped = useMemo(() => {
    if (filterMode === 'day') {
      return days.map((d) => ({
        key: d.id,
        label: `Day ${d.dayIndex}${d.areaLabel ? `・${d.areaLabel}` : ''}`,
        list: items.filter((i) => i.dayId === d.id),
      }))
    }
    if (filterMode === 'category') {
      const cats = Array.from(new Set(items.map((i) => i.category)))
      return cats.map((c) => ({
        key: c,
        label: `${ITINERARY_CATEGORY_META[c].emoji} ${ITINERARY_CATEGORY_META[c].label}`,
        list: items.filter((i) => i.category === c),
      }))
    }
    // area
    const areas = Array.from(new Set(days.map((d) => d.areaLabel).filter(Boolean))) as string[]
    return areas.map((area) => ({
      key: area,
      label: area,
      list: items.filter((i) => days.find((d) => d.id === i.dayId)?.areaLabel === area),
    }))
  }, [filterMode, days, items])

  function buildMapsUrl(title: string, address?: string) {
    const query = encodeURIComponent(address ? `${title} ${address}` : title)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  function copyAddress(address?: string) {
    if (!address) return
    navigator.clipboard?.writeText(address).then(() => show('地址已複製', 'success'))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">地圖</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">所有景點，一鍵導航</p>
      </header>

      <div className="mb-4 flex gap-2 px-5">
        {([
          ['day', '依日期'],
          ['category', '依分類'],
          ['area', '依區域'],
        ] as [FilterMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`rounded-pill px-3.5 py-1.5 text-[12px] ${
              filterMode === mode
                ? 'bg-sage text-cream-card'
                : 'bg-cream-card text-warmgray dark:bg-dusk-card dark:text-warmgray-light'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-5 px-5">
        {grouped.map((group) => (
          <div key={String(group.key)}>
            {group.list.length > 0 && (
              <>
                <p className="mb-2 px-1 text-[13px] font-medium text-warmgray dark:text-warmgray-light">
                  {group.label}
                </p>
                <div className="space-y-2.5">
                  {group.list.map((item) => (
                    <Card key={item.id} className="!p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[14px] text-ink dark:text-cream-soft">
                            <span>{ITINERARY_CATEGORY_META[item.category].emoji}</span>
                            <span className="truncate">{item.title}</span>
                          </p>
                          {item.address && (
                            <p className="mt-1 truncate text-[12px] text-warmgray dark:text-warmgray-light">
                              {item.address}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => copyAddress(item.address)}
                            aria-label="複製地址"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-warmgray active:scale-90 dark:bg-dusk-bg dark:text-warmgray-light"
                          >
                            <Copy size={15} />
                          </button>
                          <a
                            href={buildMapsUrl(item.title, item.address)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="開啟導航"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-cream-card active:scale-90"
                          >
                            <Navigation size={15} />
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <EmptyState icon={<span className="text-4xl">🗺️</span>} title="還沒有景點" description="到行程頁新增地點後，會自動顯示在這裡" />
        )}
      </div>
    </div>
  )
}
