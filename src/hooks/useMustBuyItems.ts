import { useCallback, useEffect, useMemo } from 'react'
import { STORAGE_KEYS, storage } from '@/lib/storage'
import { useCloudState } from '@/hooks/useCloudState'
import { useCloudCollection } from '@/hooks/useCloudCollection'
import type { MustBuyItem } from '@/types'

export interface MustBuyDraft {
  travelerId: string
  name: string
  store?: string
  price?: number
  categoryId?: string
  imageUrls?: string[]
}

/** 索引資料裡不含照片欄位（照片改放到獨立集合，索引只放很輕量的品項資訊） */
type MustBuyMeta = Omit<MustBuyItem, 'imageUrls' | 'imageUrl'>

// 照片獨立集合的名稱：每張品項的照片各自存成一份文件（key = 品項 id），
// 而不是跟品項名稱、店家等資料擠在同一份文件裡。
const PHOTOS_COLLECTION = 'must-buy-photos'

function stripPhotoFields(item: MustBuyItem): MustBuyMeta {
  const { imageUrls: _imageUrls, imageUrl: _imageUrl, ...meta } = item
  return meta
}

// 固定的兩位旅伴 id（對應 seedData.ts 的 seedTravelers）。
// 必買項目的「索引資料」（名稱、店家、價格等）依旅伴分開存成兩份雲端文件；
// 「照片」則再更進一步拆成每個品項各自一份獨立文件（見上面 PHOTOS_COLLECTION），
// 這樣不管加多少張照片，都不會再互相排擠、撐爆同一份文件的容量上限。

export function useMustBuyItems() {
  const storeA = useCloudState<MustBuyMeta[]>(`${STORAGE_KEYS.mustBuyItems}:traveler-1`, () => [])
  const storeB = useCloudState<MustBuyMeta[]>(`${STORAGE_KEYS.mustBuyItems}:traveler-2`, () => [])
  // 舊資料相容 1：更早之前所有必買項目（含照片）都存在這一份共用文件裡，讀出來做一次性搬遷。
  const legacy = useCloudState<MustBuyItem[]>(STORAGE_KEYS.mustBuyItems, () => [])
  const photos = useCloudCollection<string[]>(PHOTOS_COLLECTION)

  const loading = storeA.loading || storeB.loading || legacy.loading || photos.loading

  // 遷移 1：把「分開存之前」的舊合併資料，依旅伴搬到各自的索引文件，照片一併搬進獨立集合
  useEffect(() => {
    if (loading || legacy.value.length === 0) return
    let cancelled = false

    async function migrateLegacy() {
      const forA = legacy.value.filter((i) => i.travelerId === 'traveler-1')
      const forB = legacy.value.filter((i) => i.travelerId === 'traveler-2')

      // 先確認每一筆照片都確實寫入新地方成功，才可以搬移索引資料、清空舊來源，
      // 任何一步失敗就整批中止，保留舊資料原封不動，下次載入時會重新嘗試。
      for (const i of [...forA, ...forB]) {
        const p = i.imageUrls ?? (i.imageUrl ? [i.imageUrl] : [])
        if (p.length === 0) continue
        try {
          await storage.setDoc(PHOTOS_COLLECTION, i.id, p)
        } catch (err) {
          console.error(`[useMustBuyItems] 搬遷舊資料的照片失敗，中止這次搬遷，保留原始資料`, err)
          return
        }
      }
      if (cancelled) return

      if (forA.length > 0) storeA.setValue((prev) => [...prev, ...forA.map(stripPhotoFields)])
      if (forB.length > 0) storeB.setValue((prev) => [...prev, ...forB.map(stripPhotoFields)])
      legacy.setValue([])
    }

    migrateLegacy()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, legacy.value])

  // 遷移 2：把「照片改成獨立集合之前」索引資料裡夾帶的舊照片欄位搬出去，索引瘦身。
  // 這裡刻意不透過 photos.setDoc()（它是「先更新畫面、背景才寫入」的樂觀更新，
  // 失敗了才回復，寫入結果無法立刻確認），而是直接呼叫 storage.setDoc() 並且
  // await 等待寫入結果——一定要「確認新地方真的存好了」，才可以去清除舊欄位；
  // 只要有任何一步失敗，就完整保留原始資料不動，避免資料在搬家過程中憑空消失。
  useEffect(() => {
    if (loading) return
    let cancelled = false

    async function migrate() {
      for (const store of [storeA, storeB]) {
        const raw = store.value as unknown as MustBuyItem[]
        const withInlinePhotos = raw.filter((i) => (i.imageUrls && i.imageUrls.length > 0) || i.imageUrl)
        if (withInlinePhotos.length === 0) continue

        const confirmedIds = new Set<string>()
        for (const i of withInlinePhotos) {
          if (cancelled) return
          const p = i.imageUrls ?? (i.imageUrl ? [i.imageUrl] : [])
          if (p.length === 0) continue
          if (photos.items[i.id]) {
            // 已經確實存在新地方了，不用重新寫入，但索引裡的舊欄位還是要清掉
            confirmedIds.add(i.id)
            continue
          }
          try {
            await storage.setDoc(PHOTOS_COLLECTION, i.id, p)
            confirmedIds.add(i.id)
          } catch (err) {
            console.error(`[useMustBuyItems] 搬遷品項 ${i.id} 的照片失敗，保留原始資料不清除`, err)
          }
        }
        if (confirmedIds.size > 0 && !cancelled) {
          store.setValue((prev) =>
            (prev as unknown as MustBuyItem[]).map((item) =>
              confirmedIds.has(item.id) ? stripPhotoFields(item) : item,
            ),
          )
        }
      }
    }

    migrate()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, storeA.value, storeB.value])

  const items: MustBuyItem[] = useMemo(() => {
    const merge = (list: MustBuyMeta[]): MustBuyItem[] =>
      list.map((m) => ({ ...m, imageUrls: photos.items[m.id] ?? [] }))
    return [...merge(storeA.value), ...merge(storeB.value)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeA.value, storeB.value, photos.items])

  function storeFor(travelerId: string) {
    return travelerId === 'traveler-2' ? storeB : storeA
  }

  const addItem = useCallback((draft: MustBuyDraft) => {
    const id = `mustbuy-${Date.now()}`
    const { imageUrls, ...meta } = draft
    storeFor(draft.travelerId).setValue((prev) => [
      ...prev,
      { id, tripId: 'trip-tokyo-2026', checked: false, order: prev.length, ...meta },
    ])
    if (imageUrls && imageUrls.length > 0) photos.setDoc(id, imageUrls)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateItem = useCallback(
    (id: string, draft: MustBuyDraft) => {
      const current = items.find((i) => i.id === id)
      if (!current) return
      const { imageUrls, ...meta } = draft
      storeFor(current.travelerId).setValue((prev) => prev.map((i) => (i.id === id ? { ...i, ...meta } : i)))
      if (imageUrls && imageUrls.length > 0) {
        photos.setDoc(id, imageUrls)
      } else {
        photos.removeDoc(id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  )

  const toggleItem = useCallback(
    (id: string) => {
      const current = items.find((i) => i.id === id)
      if (!current) return
      storeFor(current.travelerId).setValue((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  )

  const removeItem = useCallback(
    (id: string) => {
      const current = items.find((i) => i.id === id)
      if (!current) return
      storeFor(current.travelerId).setValue((prev) => prev.filter((i) => i.id !== id))
      photos.removeDoc(id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  )

  return { items, loading, addItem, updateItem, toggleItem, removeItem }
}
