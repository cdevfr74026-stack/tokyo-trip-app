import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, ShoppingBag, Camera, X } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useMustBuyItems, type MustBuyDraft } from '@/hooks/useMustBuyItems'
import { resizeImageFile } from '@/lib/image'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { SwipeToDelete } from '@/components/feedback/SwipeToDelete'
import { useToast } from '@/components/feedback/Toast'

const EMPTY: Omit<MustBuyDraft, 'travelerId'> = { name: '', store: '', price: undefined, imageUrl: undefined }

export default function MustBuy() {
  const { trip, loading: tripLoading } = useTrip()
  const { items, loading: itemsLoading, addItem, updateItem, toggleItem, removeItem } = useMustBuyItems()
  const [activeTravelerId, setActiveTravelerId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<MustBuyDraft, 'travelerId'>>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { show } = useToast()

  const loading = tripLoading || itemsLoading
  const currentTravelerId = activeTravelerId ?? trip?.travelers[0]?.id ?? ''

  const travelerItems = useMemo(
    () => items.filter((i) => i.travelerId === currentTravelerId),
    [items, currentTravelerId],
  )
  const checkedCount = travelerItems.filter((i) => i.checked).length
  const totalEstimate = travelerItems.reduce((sum, i) => sum + (i.price ?? 0), 0)
  const boughtEstimate = travelerItems.filter((i) => i.checked).reduce((sum, i) => sum + (i.price ?? 0), 0)

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImageFile(file)
      setDraft((p) => ({ ...p, imageUrl: dataUrl }))
    } catch {
      show('圖片讀取失敗，換一張試試看', 'error')
    } finally {
      setUploading(false)
    }
  }

  function openAddForm() {
    setEditingId(null)
    setDraft(EMPTY)
    setSheetOpen(true)
  }

  function openEditForm(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setEditingId(id)
    setDraft({ name: item.name, store: item.store ?? '', price: item.price, imageUrl: item.imageUrl })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!draft.name.trim()) return show('請輸入品項名稱', 'error')
    const clean = { name: draft.name.trim(), store: draft.store || undefined, price: draft.price, imageUrl: draft.imageUrl }
    if (editingId) {
      updateItem(editingId, { travelerId: currentTravelerId, ...clean })
      show('已更新品項', 'success')
    } else {
      addItem({ travelerId: currentTravelerId, ...clean })
      show('已加入必買清單', 'success')
    }
    setSheetOpen(false)
  }

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">必買清單</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">把想搬回家的都寫下來</p>
      </header>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-5">
        {trip.travelers.map((t) => {
          const isActive = t.id === currentTravelerId
          return (
            <button
              key={t.id}
              onClick={() => setActiveTravelerId(t.id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-[13px] ${
                isActive
                  ? 'bg-sage text-cream-card shadow-card dark:bg-sage-dark'
                  : 'bg-cream-card text-warmgray dark:bg-dusk-card dark:text-warmgray-light'
              }`}
            >
              {t.avatarEmoji} {t.name}
            </button>
          )
        })}
      </div>

      <div className="px-5">
        <Card className="mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink dark:text-cream-soft">已入手</span>
            <span className="font-display text-sm text-sage-dark dark:text-sage-light">
              {checkedCount} / {travelerItems.length}
            </span>
          </div>
          {totalEstimate > 0 && (
            <p className="mt-2 text-[12px] text-warmgray dark:text-warmgray-light">
              預估花費 ¥{boughtEstimate.toLocaleString()} / ¥{totalEstimate.toLocaleString()}
            </p>
          )}
        </Card>

        {travelerItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={36} className="text-warmgray/60" />}
            title="還沒有想買的東西"
            description="點右下角按鈕，記下這次一定要買的伴手禮"
          />
        ) : (
          <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
            <AnimatePresence initial={false}>
              {travelerItems.map((item) => (
                <SwipeToDelete key={item.id} onDelete={() => removeItem(item.id)}>
                  <motion.div layout exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleItem(item.id)}
                      aria-label="切換已購買狀態"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                        item.checked ? 'border-sage bg-sage text-cream-card' : 'border-khaki dark:border-dusk-border'
                      }`}
                    >
                      {item.checked && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-check-pop">
                          <Check size={14} />
                        </motion.span>
                      )}
                    </button>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openEditForm(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 shrink-0 rounded-soft object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[14px] ${
                            item.checked ? 'text-warmgray line-through dark:text-warmgray-light' : 'text-ink dark:text-cream-soft'
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.store && (
                          <p className="truncate text-[11px] text-warmgray dark:text-warmgray-light">{item.store}</p>
                        )}
                      </div>
                      {item.price != null && (
                        <span className="text-[12px] text-warmgray dark:text-warmgray-light">¥{item.price.toLocaleString()}</span>
                      )}
                    </div>
                  </motion.div>
                </SwipeToDelete>
              ))}
            </AnimatePresence>
          </Card>
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增必買項目" onClick={openAddForm} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingId ? '編輯必買項目' : '新增必買項目'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">照片（選填）</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePickImage}
              className="hidden"
            />
            {draft.imageUrl ? (
              <div className="relative w-fit">
                <img src={draft.imageUrl} alt="預覽" className="h-28 w-28 rounded-soft object-cover" />
                <button
                  onClick={() => setDraft((p) => ({ ...p, imageUrl: undefined }))}
                  aria-label="移除照片"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-cream-card"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-soft border-2 border-dashed border-khaki text-warmgray dark:border-dusk-border dark:text-warmgray-light"
              >
                <Camera size={22} />
                <span className="text-[11px]">{uploading ? '處理中…' : '新增照片'}</span>
              </button>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">品項名稱 *</label>
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="例如：白色戀人餅乾"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">哪裡買（選填）</label>
            <input
              value={draft.store ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, store: e.target.value }))}
              placeholder="例如：唐吉訶德"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">預估價格（¥，選填）</label>
            <input
              type="number"
              inputMode="numeric"
              value={draft.price ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="0"
              className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
            />
          </div>
          <button
            onClick={handleSave}
            className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
          >
            {editingId ? '儲存修改' : '加入清單'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
