import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { usePackingItems } from '@/hooks/usePackingItems'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import { SwipeToDelete } from '@/components/feedback/SwipeToDelete'
import { PACKING_CATEGORY_META } from '@/lib/categoryMeta'
import type { PackingCategory } from '@/types'

const CATEGORY_ORDER: PackingCategory[] = [
  'documents',
  'clothing',
  'shoes',
  'electronics',
  'charger',
  'medicine',
  'skincare',
  'makeup',
  'other',
]

export default function Packing() {
  const { items, loading, toggle, addItem, removeItem } = usePackingItems()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<PackingCategory>('other')
  const { show } = useToast()

  const grouped = useMemo(() => {
    const map = new Map<PackingCategory, typeof items>()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const item of items) {
      map.get(item.category)?.push(item)
    }
    return map
  }, [items])

  const checkedCount = items.filter((i) => i.checked).length
  const percent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0

  function handleAdd() {
    if (!newName.trim()) return
    addItem(newName.trim(), newCategory)
    setNewName('')
    setSheetOpen(false)
    show('已加入行李清單', 'success')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">行李</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">打包好期待，出發吧</p>
      </header>

      <div className="px-5">
        <Card className="mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink dark:text-cream-soft">打包進度</span>
            <span className="font-display text-sm text-sage-dark dark:text-sage-light">
              {checkedCount} / {items.length}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={percent} />
          </div>
          {percent === 100 && items.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="mt-2 text-[12px] text-sage-dark dark:text-sage-light"
            >
              <motion.span
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="inline-block"
              >
                🎉
              </motion.span>{' '}
              全部打包完成，準備出發！
            </motion.p>
          )}
        </Card>

        <div className="space-y-5">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? []
            if (list.length === 0) return null
            const meta = PACKING_CATEGORY_META[cat]
            return (
              <div key={cat}>
                <p className="mb-2 px-1 text-[13px] font-medium text-warmgray dark:text-warmgray-light">
                  {meta.emoji} {meta.label}
                </p>
                <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
                  <AnimatePresence initial={false}>
                    {list.map((item) => (
                      <SwipeToDelete key={item.id} onDelete={() => removeItem(item.id)}>
                        <motion.div layout exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={() => toggle(item.id)}
                            aria-label="切換完成狀態"
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                              item.checked
                                ? 'border-sage bg-sage text-cream-card'
                                : 'border-khaki dark:border-dusk-border'
                            }`}
                          >
                            {item.checked && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-check-pop">
                                <Check size={14} />
                              </motion.span>
                            )}
                          </button>
                          <span
                            className={`flex-1 text-[14px] ${
                              item.checked
                                ? 'text-warmgray line-through dark:text-warmgray-light'
                                : 'text-ink dark:text-cream-soft'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-warmgray/50 dark:text-warmgray-light/50">← 滑動刪除</span>
                        </motion.div>
                      </SwipeToDelete>
                    ))}
                  </AnimatePresence>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      <FAB icon={<Plus size={24} />} label="新增行李" onClick={() => setSheetOpen(true)} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="新增行李項目">
        <div className="space-y-4">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例如：太陽眼鏡"
            className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`rounded-pill px-3 py-1.5 text-[12px] ${
                  newCategory === cat
                    ? 'bg-sage text-cream-card'
                    : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'
                }`}
              >
                {PACKING_CATEGORY_META[cat].emoji} {PACKING_CATEGORY_META[cat].label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
          >
            加入清單
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
