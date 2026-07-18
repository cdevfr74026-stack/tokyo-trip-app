import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Navigation, Heart } from 'lucide-react'
import { useFavoriteSpots, type FavoriteSpotDraft } from '@/hooks/useFavoriteSpots'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import { ITINERARY_CATEGORY_META } from '@/lib/categoryMeta'
import type { ItineraryCategory, SpotStatus } from '@/types'

const STATUS_META: Record<SpotStatus, { label: string; emoji: string }> = {
  wishlist: { label: '想去', emoji: '💭' },
  saved: { label: '收藏', emoji: '⭐' },
  visited: { label: '已去', emoji: '✅' },
}
const CATEGORY_OPTIONS = Object.entries(ITINERARY_CATEGORY_META) as [ItineraryCategory, { label: string; emoji: string }][]

const EMPTY: FavoriteSpotDraft = { name: '', googleMapsUrl: '', address: '', area: '', category: 'sightseeing', status: 'wishlist' }

export default function FavoriteSpots() {
  const navigate = useNavigate()
  const { spots, loading, addSpot, updateSpotStatus, removeSpot } = useFavoriteSpots()
  const { show } = useToast()
  const [filter, setFilter] = useState<SpotStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<FavoriteSpotDraft>(EMPTY)

  const filtered = useMemo(() => (filter === 'all' ? spots : spots.filter((s) => s.status === filter)), [spots, filter])

  function openAdd() { setDraft(EMPTY); setFormOpen(true) }
  function handleSave() {
    if (!draft.name.trim()) return show('請輸入景點名稱', 'error')
    addSpot({ ...draft, name: draft.name.trim(), googleMapsUrl: draft.googleMapsUrl || undefined, address: draft.address || undefined, area: draft.area || undefined })
    setFormOpen(false)
    show('已加入收藏', 'success')
  }

  if (loading) return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">景點收藏</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">想去・已去清單</p>
        </div>
      </header>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-5">
        {([['all', '全部'], ['wishlist', '想去'], ['saved', '收藏'], ['visited', '已去']] as [SpotStatus | 'all', string][]).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`shrink-0 rounded-pill px-4 py-2 text-[13px] ${filter === key ? 'bg-sage text-cream-card shadow-card dark:bg-sage-dark' : 'bg-cream-card text-warmgray dark:bg-dusk-card dark:text-warmgray-light'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-5">
        {filtered.length === 0 ? (
          <EmptyState icon={<Heart size={36} className="text-warmgray/60" />} title="這裡還是空的" description="貼上 Google Maps 連結，收藏你想去的地方" />
        ) : (
          filtered.map((s) => (
            <Card key={s.id} className="!p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-[14px] text-ink dark:text-cream-soft">
                    <span>{ITINERARY_CATEGORY_META[s.category ?? 'other'].emoji}</span>
                    <span>{s.name}</span>
                  </p>
                  {s.area && <p className="mt-0.5 text-[11px] text-warmgray dark:text-warmgray-light">{s.area}</p>}
                </div>
                <button onClick={() => removeSpot(s.id)} className="text-warmgray/50 active:text-apricot"><Trash2 size={14} /></button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(Object.entries(STATUS_META) as [SpotStatus, { label: string; emoji: string }][]).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => updateSpotStatus(s.id, key)}
                      className={`rounded-pill px-2.5 py-1 text-[11px] ${s.status === key ? 'bg-sage-light text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'}`}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  ))}
                </div>
                {s.googleMapsUrl && (
                  <a href={s.googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-pill bg-sage-light/40 px-2.5 py-1 text-[11px] text-sage-dark dark:bg-sage-dark/20 dark:text-sage-light">
                    <Navigation size={11} /> 導航
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增景點" onClick={openAdd} />

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="新增收藏景點">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">景點名稱 *</label>
            <input autoFocus value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="例如：明治神宮" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">Google Maps 連結</label>
            <input value={draft.googleMapsUrl} onChange={(e) => setDraft((p) => ({ ...p, googleMapsUrl: e.target.value }))} placeholder="貼上連結" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">區域</label>
              <input value={draft.area} onChange={(e) => setDraft((p) => ({ ...p, area: e.target.value }))} placeholder="例如：澀谷" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">狀態</label>
              <div className="flex gap-1.5">
                {(Object.entries(STATUS_META) as [SpotStatus, { label: string; emoji: string }][]).map(([key, meta]) => (
                  <button key={key} onClick={() => setDraft((p) => ({ ...p, status: key }))} className={`flex-1 rounded-soft px-2 py-2 text-[11px] ${draft.status === key ? 'bg-sage text-cream-card' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'}`}>
                    {meta.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">分類</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(([key, meta]) => (
                <button key={key} onClick={() => setDraft((p) => ({ ...p, category: key }))} className={`rounded-pill px-3 py-1.5 text-[12px] ${draft.category === key ? 'bg-sage text-cream-card' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'}`}>
                  {meta.emoji} {meta.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">加入收藏</button>
        </div>
      </BottomSheet>
    </div>
  )
}
