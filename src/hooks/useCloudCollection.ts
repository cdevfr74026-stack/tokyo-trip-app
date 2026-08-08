import { useCallback, useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import { useToast } from '@/components/feedback/Toast'

/**
 * 跟 useCloudState 類似，差別在於資料不是「一整份塞在同一份文件裡」，
 * 而是拆成很多份各自獨立的小文件（一個 id 一份）。
 *
 * 專門用來放照片這種「單筆資料可能很肥大、加總起來很容易超過雲端資料庫
 * 單一文件 1MB 容量上限」的內容——拆開之後，每一份各自有 1MB 額度，
 * 彼此完全不會互相排擠，容量比「大家擠在同一份」寬裕非常多。
 */
export function useCloudCollection<T>(collectionKey: string) {
  const [items, setItemsState] = useState<Record<string, T>>({})
  const [loading, setLoading] = useState(true)
  const { show } = useToast()

  useEffect(() => {
    setLoading(true)
    let settled = false

    // 安全逾時，理由同 useCloudState：避免連線初始化本身卡住時，畫面永遠停在 Loading。
    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      setLoading(false)
    }, 8000)

    const unsubscribe = storage.subscribeCollection<T>(collectionKey, (remote) => {
      settled = true
      window.clearTimeout(timeoutId)
      setItemsState(remote)
      setLoading(false)
    })

    return () => {
      window.clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [collectionKey])

  const setDoc = useCallback(
    (docId: string, value: T) => {
      setItemsState((prev) => {
        const previous = prev
        storage.setDoc(collectionKey, docId, value).catch((err) => {
          console.error(`[useCloudCollection] 寫入 ${collectionKey}/${docId} 失敗，回復成寫入前的狀態`, err)
          setItemsState(previous)
          show('儲存失敗，請檢查網路連線後再試一次', 'error')
        })
        return { ...prev, [docId]: value }
      })
    },
    [collectionKey, show],
  )

  const removeDoc = useCallback(
    (docId: string) => {
      setItemsState((prev) => {
        if (!(docId in prev)) return prev
        const previous = prev
        storage.deleteDoc(collectionKey, docId).catch((err) => {
          console.error(`[useCloudCollection] 刪除 ${collectionKey}/${docId} 失敗`, err)
          setItemsState(previous)
          show('刪除失敗，請再試一次', 'error')
        })
        const next = { ...prev }
        delete next[docId]
        return next
      })
    },
    [collectionKey, show],
  )

  return { items, loading, setDoc, removeDoc }
}
