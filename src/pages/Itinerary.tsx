import { useMemo, useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Plus,
  Clock,
  MapPin as MapPinIcon,
  Check,
  MoreVertical,
  Navigation,
  Copy,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useItineraryItems, type ItineraryItemDraft } from '@/hooks/useItineraryItems'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import { ITINERARY_CATEGORY_META, TRANSPORT_MODE_META } from '@/lib/categoryMeta'
import { formatDateWithWeekday } from '@/lib/format'
import type { ItineraryCategory, ItineraryItem, TransportMode } from '@/types'

const CATEGORY_OPTIONS = Object.entries(ITINERARY_CATEGORY_META) as [ItineraryCategory, { label: string; emoji: string }][]
const TRANSPORT_OPTIONS = Object.entries(TRANSPORT_MODE_META) as [TransportMode, { label: string; emoji: string }][]

const EMPTY_DRAFT = (dayId: string): ItineraryItemDraft => ({
  dayId,
  time: '',
  title: '',
  address: '',
  googleMapsUrl: '',
  category: 'sightseeing',
  durationMinutes: undefined,
  transportMode: undefined,
  transportMinutes: undefined,
  note: '',
  estimatedCost: undefined,
})

function buildMapsUrl(item: ItineraryItem) {
  if (item.googleMapsUrl) return item.googleMapsUrl
  const query = encodeURIComponent(item.address ? `${item.title} ${item.address}` : item.title)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export default function Itinerary() {
  const { days, loading: tripLoading } = useTrip()
  const { items, loading: itemsLoading, addItem, updateItem, removeItem, toggleComplete, reorderDay, copyToDay } =
    useItineraryItems()
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const { show } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ItineraryItemDraft>(EMPTY_DRAFT(''))

  const [actionsFor, setActionsFor] = useState<ItineraryItem | null>(null)
  const [copySheetFor, setCopySheetFor] = useState<ItineraryItem | null>(null)

  const loading = tripLoading || itemsLoading
  const currentDayId = activeDayId ?? days[0]?.id
  const currentDay = days.find((d) => d.id === currentDayId)
  const dayItems = useMemo(
    () => items.filter((i) => i.dayId === currentDayId).sort((a, b) => a.order - b.order),
    [items, currentDayId],
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  function openAddForm() {
    setEditingId(null)
    setDraft(EMPTY_DRAFT(currentDayId ?? ''))
    setFormOpen(true)
  }

  function openEditForm(item: ItineraryItem) {
    setEditingId(item.id)
    setDraft({
      dayId: item.dayId,
      time: item.time ?? '',
      title: item.title,
      address: item.address ?? '',
      googleMapsUrl: item.googleMapsUrl ?? '',
      category: item.category,
      durationMinutes: item.durationMinutes,
      transportMode: item.transportMode,
      transportMinutes: item.transportMinutes,
      note: item.note ?? '',
      estimatedCost: item.estimatedCost,
    })
    setActionsFor(null)
    setFormOpen(true)
  }

  function handleSave() {
    if (!draft.title.trim()) {
      show('請輸入地點名稱', 'error')
      return
    }
    const clean: ItineraryItemDraft = {
      ...draft,
      time: draft.time || undefined,
      address: draft.address || undefined,
      googleMapsUrl: draft.googleMapsUrl || undefined,
      note: draft.note || undefined,
    }
    if (editingId) {
      updateItem(editingId, clean)
      show('行程已更新', 'success')
    } else {
      addItem(clean)
      show('行程已新增', 'success')
    }
    setFormOpen(false)
  }

  function handleDelete(item: ItineraryItem) {
    removeItem(item.id)
    setActionsFor(null)
    show('已刪除該筆行程', 'success')
  }

  function handleCopy(targetDayId: string) {
    if (!copySheetFor) return
    copyToDay(copySheetFor.id, targetDayId)
    setCopySheetFor(null)
    show('已複製到指定天數', 'success')
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">行程</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">像一本每天翻頁的旅行日誌</p>
      </header>

      {/* Day Tabs */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-4">
        {days.map((d) => {
          const isActive = d.id === currentDayId
          return (
            <button
              key={d.id}
              onClick={() => setActiveDayId(d.id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-[13px] transition-colors ${
                isActive
                  ? 'bg-sage text-cream-card shadow-card dark:bg-sage-dark'
                  : 'bg-cream-card text-warmgray dark:bg-dusk-card dark:text-warmgray-light'
              }`}
            >
              Day {d.dayIndex}
            </button>
          )
        })}
      </div>

      <div className="px-5">
        {currentDay && (
          <div className="mb-4 flex items-center gap-2 text-[13px] text-warmgray dark:text-warmgray-light">
            <span>{formatDateWithWeekday(currentDay.date)}</span>
            {currentDay.areaLabel && (
              <span className="flex items-center gap-1 rounded-pill bg-sage-light/50 px-2.5 py-0.5 text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light">
                <MapPinIcon size={11} /> {currentDay.areaLabel}
              </span>
            )}
          </div>
        )}

        {dayItems.length === 0 ? (
          <EmptyState
            icon={<span className="text-4xl">📖</span>}
            title="這天還是空白的一頁"
            description="點擊右下角按鈕，開始寫下今天的行程"
          />
        ) : (
          <Reorder.Group
            axis="y"
            values={dayItems}
            onReorder={(newOrder) => reorderDay(currentDayId!, newOrder.map((i) => i.id))}
            className="relative"
          >
            <div className="pointer-events-none absolute bottom-2 left-[15px] top-2 w-px bg-khaki/60 dark:bg-dusk-border" />
            <AnimatePresence mode="popLayout">
              {dayItems.map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  as="div"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative mb-4 flex gap-3"
                >
                  <motion.button
                    onClick={() => toggleComplete(item.id)}
                    whileTap={{ scale: 0.85 }}
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm shadow-card transition-colors ${
                      item.completed
                        ? 'bg-sage text-cream-card'
                        : 'bg-cream-card dark:bg-dusk-card'
                    }`}
                    aria-label="切換完成狀態"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {item.completed ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Check size={15} />
                        </motion.span>
                      ) : (
                        <motion.span key="emoji" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          {ITINERARY_CATEGORY_META[item.category].emoji}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <Card className={`flex-1 !p-4 ${item.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[12px] text-warmgray dark:text-warmgray-light">
                        <Clock size={11} /> {item.time || '未排定'}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.transportMode && item.transportMinutes && (
                          <span className="text-[11px] text-mist">
                            {TRANSPORT_MODE_META[item.transportMode].emoji} {item.transportMinutes} 分
                          </span>
                        )}
                        <button
                          onClick={() => setActionsFor(item)}
                          aria-label="更多選項"
                          className="text-warmgray/60 active:text-ink dark:text-warmgray-light/60"
                        >
                          <MoreVertical size={15} />
                        </button>
                        <GripVertical size={14} className="cursor-grab text-warmgray/40 active:cursor-grabbing" />
                      </div>
                    </div>
                    <p
                      className={`mt-1.5 font-display text-[15px] text-ink dark:text-cream-soft ${
                        item.completed ? 'line-through' : ''
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.address && (
                      <p className="mt-0.5 truncate text-[12px] text-warmgray dark:text-warmgray-light">{item.address}</p>
                    )}
                    {item.note && (
                      <p className="mt-2 rounded-soft bg-cream-soft px-3 py-2 text-[12px] text-ink/70 dark:bg-dusk-bg dark:text-cream-soft/70">
                        {item.note}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={buildMapsUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-pill bg-sage-light/40 px-3 py-1.5 text-[12px] text-sage-dark active:bg-sage-light/70 dark:bg-sage-dark/20 dark:text-sage-light"
                      >
                        <Navigation size={12} /> 導航
                      </a>
                      {item.estimatedCost ? (
                        <span className="text-[12px] text-warmgray dark:text-warmgray-light">
                          預估 ¥{item.estimatedCost.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </Card>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}

        {dayItems.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Card className="!p-3">
              <p className="text-[11px] text-warmgray dark:text-warmgray-light">景點數</p>
              <p className="font-display text-lg text-ink dark:text-cream-soft">{dayItems.length}</p>
            </Card>
            <Card className="!p-3">
              <p className="text-[11px] text-warmgray dark:text-warmgray-light">交通時間</p>
              <p className="font-display text-lg text-ink dark:text-cream-soft">
                {dayItems.reduce((sum, i) => sum + (i.transportMinutes ?? 0), 0)} 分
              </p>
            </Card>
            <Card className="!p-3">
              <p className="text-[11px] text-warmgray dark:text-warmgray-light">預估花費</p>
              <p className="font-display text-lg text-ink dark:text-cream-soft">
                ¥{dayItems.reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0).toLocaleString()}
              </p>
            </Card>
          </div>
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增行程" onClick={openAddForm} />

      {/* 單筆行程的操作選單 */}
      <BottomSheet open={!!actionsFor} onClose={() => setActionsFor(null)} title={actionsFor?.title}>
        {actionsFor && (
          <div className="space-y-2">
            <button
              onClick={() => openEditForm(actionsFor)}
              className="flex w-full items-center gap-3 rounded-soft px-3 py-3 text-left text-[14px] text-ink active:bg-cream-soft dark:text-cream-soft dark:active:bg-dusk-bg"
            >
              <Pencil size={16} /> 編輯
            </button>
            <button
              onClick={() => {
                setCopySheetFor(actionsFor)
                setActionsFor(null)
              }}
              className="flex w-full items-center gap-3 rounded-soft px-3 py-3 text-left text-[14px] text-ink active:bg-cream-soft dark:text-cream-soft dark:active:bg-dusk-bg"
            >
              <Copy size={16} /> 複製到其他天
            </button>
            <button
              onClick={() => handleDelete(actionsFor)}
              className="flex w-full items-center gap-3 rounded-soft px-3 py-3 text-left text-[14px] text-apricot active:bg-cream-soft dark:active:bg-dusk-bg"
            >
              <Trash2 size={16} /> 刪除
            </button>
          </div>
        )}
      </BottomSheet>

      {/* 複製到其他天 */}
      <BottomSheet open={!!copySheetFor} onClose={() => setCopySheetFor(null)} title="複製到哪一天？">
        <div className="grid grid-cols-3 gap-2">
          {days.map((d) => (
            <button
              key={d.id}
              onClick={() => handleCopy(d.id)}
              className="rounded-soft bg-cream px-3 py-3 text-center text-[13px] text-ink active:bg-sage-light/40 dark:bg-dusk-bg dark:text-cream-soft"
            >
              Day {d.dayIndex}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* 新增／編輯表單 */}
      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? '編輯行程' : '新增行程'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">時間</label>
              <input
                type="time"
                value={draft.time ?? ''}
                onChange={(e) => setDraft((p) => ({ ...p, time: e.target.value }))}
                className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">停留時間（分）</label>
              <input
                type="number"
                inputMode="numeric"
                value={draft.durationMinutes ?? ''}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, durationMinutes: e.target.value ? Number(e.target.value) : undefined }))
                }
                placeholder="60"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">地點名稱 *</label>
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="例如：淺草寺"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">地址</label>
            <input
              value={draft.address ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
              placeholder="選填"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">
              Google Maps 連結（貼上後自動建立導航按鈕）
            </label>
            <input
              value={draft.googleMapsUrl ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, googleMapsUrl: e.target.value }))}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">分類</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setDraft((p) => ({ ...p, category: key }))}
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
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">交通方式（往下一個景點）</label>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_OPTIONS.map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setDraft((p) => ({ ...p, transportMode: p.transportMode === key ? undefined : key }))}
                  className={`rounded-pill px-3 py-1.5 text-[12px] ${
                    draft.transportMode === key
                      ? 'bg-mist text-cream-card'
                      : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                  }`}
                >
                  {meta.emoji} {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">交通時間（分）</label>
              <input
                type="number"
                inputMode="numeric"
                value={draft.transportMinutes ?? ''}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, transportMinutes: e.target.value ? Number(e.target.value) : undefined }))
                }
                placeholder="15"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">預估花費（¥）</label>
              <input
                type="number"
                inputMode="numeric"
                value={draft.estimatedCost ?? ''}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, estimatedCost: e.target.value ? Number(e.target.value) : undefined }))
                }
                placeholder="0"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">備註</label>
            <textarea
              value={draft.note ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))}
              rows={2}
              placeholder="選填"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>

          <button
            onClick={handleSave}
            className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
          >
            {editingId ? '儲存修改' : '加入行程'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
