import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react'
import { useReminders, type ReminderDraft } from '@/hooks/useReminders'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import type { ReminderType } from '@/types'

const TYPE_META: Record<ReminderType, { label: string; emoji: string }> = {
  general: { label: '一般提醒', emoji: '📌' },
  meetup: { label: '集合時間', emoji: '👋' },
  flight: { label: '航班提醒', emoji: '✈️' },
  checkout: { label: '退房提醒', emoji: '🏨' },
  shopping: { label: '購物提醒', emoji: '🛍' },
}
const TYPE_OPTIONS = Object.entries(TYPE_META) as [ReminderType, { label: string; emoji: string }][]

const EMPTY: ReminderDraft = { type: 'general', title: '', datetime: '', note: '' }

export default function Reminders() {
  const navigate = useNavigate()
  const { reminders, loading, addReminder, toggleReminder, removeReminder } = useReminders()
  const { show } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<ReminderDraft>(EMPTY)

  function openAdd() { setDraft(EMPTY); setFormOpen(true) }
  function handleSave() {
    if (!draft.title.trim() || !draft.datetime) return show('請輸入提醒內容與時間', 'error')
    addReminder({ ...draft, title: draft.title.trim(), note: draft.note || undefined })
    setFormOpen(false)
    show('提醒已新增', 'success')
  }

  if (loading) return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>

  const sorted = [...reminders].sort((a, b) => (a.datetime < b.datetime ? -1 : 1))

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">旅行提醒</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">集合時間・退房提醒</p>
        </div>
      </header>

      <div className="px-5">
        {sorted.length === 0 ? (
          <EmptyState icon={<span className="text-4xl">🔔</span>} title="還沒有提醒事項" description="點右下角按鈕新增提醒吧" />
        ) : (
          <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
            {sorted.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <button
                  onClick={() => toggleReminder(r.id)}
                  aria-label="切換完成狀態"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                    r.completed ? 'border-sage bg-sage text-cream-card' : 'border-khaki dark:border-dusk-border'
                  }`}
                >
                  {r.completed && <Check size={14} />}
                </button>
                <span className="text-lg">{TYPE_META[r.type].emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[14px] ${r.completed ? 'text-warmgray line-through dark:text-warmgray-light' : 'text-ink dark:text-cream-soft'}`}>{r.title}</p>
                  <p className="text-[11px] text-warmgray dark:text-warmgray-light">
                    {r.datetime ? new Date(r.datetime).toLocaleString('zh-Hant-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <button onClick={() => removeReminder(r.id)} aria-label="刪除" className="text-warmgray/50 active:text-apricot">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增提醒" onClick={openAdd} />

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="新增提醒">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">類型</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(([key, meta]) => (
                <button key={key} onClick={() => setDraft((p) => ({ ...p, type: key }))} className={`rounded-pill px-3 py-1.5 text-[12px] ${draft.type === key ? 'bg-sage text-cream-card' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'}`}>
                  {meta.emoji} {meta.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">提醒內容 *</label>
            <input autoFocus value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="例如：飯店大廳集合" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">時間 *</label>
            <input type="datetime-local" value={draft.datetime} onChange={(e) => setDraft((p) => ({ ...p, datetime: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">備註</label>
            <input value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">加入提醒</button>
        </div>
      </BottomSheet>
    </div>
  )
}
