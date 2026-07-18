import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookHeart } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useItineraryItems } from '@/hooks/useItineraryItems'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import { formatDateWithWeekday } from '@/lib/format'
import { MOOD_META } from '@/types'
import type { MoodEmoji, TripDay } from '@/types'

const MOOD_OPTIONS = Object.entries(MOOD_META) as [MoodEmoji, { emoji: string; label: string }][]

export default function Memories() {
  const navigate = useNavigate()
  const { trip, days, loading: tripLoading, updateDay } = useTrip()
  const { items, loading: itemsLoading } = useItineraryItems()
  const { show } = useToast()

  const [editingDay, setEditingDay] = useState<TripDay | null>(null)
  const [draftMood, setDraftMood] = useState<MoodEmoji | undefined>(undefined)
  const [draftDiary, setDraftDiary] = useState('')
  const [draftSteps, setDraftSteps] = useState('')

  const loading = tripLoading || itemsLoading

  if (loading || !trip) {
    return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>
  }

  function openEdit(day: TripDay) {
    setEditingDay(day)
    setDraftMood(day.moodEmoji)
    setDraftDiary(day.diaryText ?? '')
    setDraftSteps(day.steps != null ? String(day.steps) : '')
  }

  function handleSave() {
    if (!editingDay) return
    updateDay(editingDay.id, {
      moodEmoji: draftMood,
      diaryText: draftDiary || undefined,
      steps: draftSteps ? Number(draftSteps) : undefined,
    })
    setEditingDay(null)
    show('今日回憶已儲存', 'success')
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">旅行回憶</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">每天翻一頁，記下今天的心情</p>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {days.map((d) => {
          const spotCount = items.filter((i) => i.dayId === d.id).length
          const moodMeta = d.moodEmoji ? MOOD_META[d.moodEmoji] : null
          return (
            <button key={d.id} onClick={() => openEdit(d)} className="block w-full text-left">
              <Card className="!p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-warmgray dark:text-warmgray-light">
                      Day {d.dayIndex}・{formatDateWithWeekday(d.date)}
                    </p>
                    <p className="mt-1 font-display text-[15px] text-ink dark:text-cream-soft">
                      {d.areaLabel ?? '尚未命名'}
                    </p>
                  </div>
                  <span className="text-2xl">{moodMeta ? moodMeta.emoji : <BookHeart size={22} className="text-warmgray/40" />}</span>
                </div>
                {d.diaryText ? (
                  <p className="mt-2.5 rounded-soft bg-cream-soft px-3 py-2 text-[13px] leading-relaxed text-ink/80 dark:bg-dusk-bg dark:text-cream-soft/80">
                    {d.diaryText}
                  </p>
                ) : (
                  <p className="mt-2.5 text-[12px] text-warmgray/70 dark:text-warmgray-light/70">點擊寫下今天的旅行日記…</p>
                )}
                <div className="mt-3 flex gap-4 text-[11px] text-warmgray dark:text-warmgray-light">
                  <span>📍 {spotCount} 個景點</span>
                  {d.steps != null && <span>🚶 {d.steps.toLocaleString()} 步</span>}
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <BottomSheet open={!!editingDay} onClose={() => setEditingDay(null)} title={editingDay ? `Day ${editingDay.dayIndex} 的回憶` : ''}>
        {editingDay && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[12px] text-warmgray dark:text-warmgray-light">今日心情</label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setDraftMood((prev) => (prev === key ? undefined : key))}
                    className={`flex flex-col items-center gap-1 rounded-soft px-3 py-2 text-[11px] ${
                      draftMood === key ? 'bg-sage-light text-sage-dark dark:bg-sage-dark/30 dark:text-sage-light' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                    }`}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">今日一句旅行日記</label>
              <textarea
                value={draftDiary}
                onChange={(e) => setDraftDiary(e.target.value)}
                rows={4}
                placeholder="今天走過的路，吃過的美食，看見的風景……"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] leading-relaxed text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">今日步數（選填，手動輸入）</label>
              <input
                type="number"
                inputMode="numeric"
                value={draftSteps}
                onChange={(e) => setDraftSteps(e.target.value)}
                placeholder="例如：12000"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
            </div>
            <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">
              儲存今日回憶
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
