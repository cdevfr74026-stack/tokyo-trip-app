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

const MAX_PHOTOS = 6

const EMPTY: Omit<MustBuyDraft, 'travelerId'> = { name: '', store: '', price: undefined, imageUrls: [] }

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

  async function handlePickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const currentCount = draft.imageUrls?.length ?? 0
    const remainingSlots = MAX_PHOTOS - currentCount
    if (remainingSlots <= 0) {
      show(`最多只能上傳 ${MAX_PHOTOS} 張照片`, 'error')
      return
    }
    const filesToProcess = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      show(`最多只能上傳 ${MAX_PHOTOS} 張，已自動取前 ${remainingSlots} 張`, 'error')
    }

    setUploading(true)
    try {
      // 縮圖寬度／畫質稍微保守一點，因為一個品項最多會存 6 張，避免整份雲端資料太肥大
      const dataUrls = await Promise.all(filesToProcess.map((file) => resizeImageFile(file, 640, 0.65)))
      setDraft((p) => ({ ...p, imageUrls: [...(p.imageUrls ?? []), ...dataUrls] }))
    } catch {
      show('圖片讀取失敗，換一張試試看', 'error')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(index: number) {
    setDraft((p) => ({ ...p, imageUrls: (p.imageUrls ?? []).filter((_, i) => i !== index) }))
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
    setDraft({
      name: item.name,
      store: item.store ?? '',
      price: item.price,
      // 相容舊資料：舊的品項只有單張 imageUrl，沒有 imageUrls
      imageUrls: item.imageUrls ?? (item.imageUrl ? [item.imageUrl] : []),
    })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!draft.name.trim()) return show('請輸入品項名稱', 'error')
    const clean = {
      name: draft.name.trim(),
      store: draft.store || undefined,
      price: draft.price,
      imageUrls: draft.imageUrls?.length ? draft.imageUrls : undefined,
    }
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
                      {(() => {
                        const photos = item.imageUrls ?? (item.imageUrl ? [item.imageUrl] : [])
                        if (photos.length === 0) return null
                        return (
                          <div className="relative shrink-0">
                            <img src={photos[0]} alt={item.name} className="h-10 w-10 rounded-soft object-cover" />
                            {photos.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink/80 px-1 text-[9px] font-medium text-cream-card">
                                {photos.length}
                              </span>
                            )}
                          </div>
                        )
                      })()}
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12px] text-warmgray dark:text-warmgray-light">照片（選填，最多 {MAX_PHOTOS} 張）</label>
              {(draft.imageUrls?.length ?? 0) > 0 && (
                <span className="text-[11px] text-warmgray dark:text-warmgray-light">
                  {draft.imageUrls?.length}/{MAX_PHOTOS}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePickImages}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              {(draft.imageUrls ?? []).map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`預覽 ${index + 1}`} className="h-20 w-20 rounded-soft object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    aria-label="移除照片"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-cream-card"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {(draft.imageUrls?.length ?? 0) < MAX_PHOTOS && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-soft border-2 border-dashed border-khaki text-warmgray dark:border-dusk-border dark:text-warmgray-light"
                >
                  <Camera size={19} />
                  <span className="text-[10px]">{uploading ? '處理中…' : '新增'}</span>
                </button>
              )}
            </div>
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
