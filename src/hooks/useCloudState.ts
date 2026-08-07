import { useCallback, useEffect, useRef, useState } from 'react'
import { storage } from '@/lib/storage'

/**
 * 通用的「雲端同步狀態」hook。
 *
 * 只依賴 storage.subscribe() 這一個資料來源（不再另外呼叫 storage.get() 做初始讀取），
 * 避免「初始讀取」和「使用者寫入」兩個非同步流程互相競速、
 * 導致舊資料在寫入之後才回來、把剛新增的內容覆蓋掉的問題。
 *
 * LocalStorage 模式下只會同步同一台裝置的不同分頁，
 * Firebase 模式下則會即時同步所有裝置。
 */
export function useCloudState<T>(key: string, seedFactory: () => T) {
  const [value, setValueState] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const seedRef = useRef(seedFactory)
  seedRef.current = seedFactory

  useEffect(() => {
    setLoading(true)
    let isFirstCallback = true
    let seeded = false

    const unsubscribe = storage.subscribe<T>(key, (remote) => {
      if (remote !== null) {
        setValueState(remote)
      } else if (isFirstCallback && !seeded) {
        // 第一次收到的資料就是空的，代表這個 key 從未被寫入過，寫入預設種子資料
        seeded = true
        const seed = seedRef.current()
        setValueState(seed)
        storage.set(key, seed)
      }
      isFirstCallback = false
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [key])

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const base = prev ?? seedRef.current()
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(base) : updater
        storage.set(key, next)
        return next
      })
    },
    [key],
  )

  return { value: value ?? seedRef.current(), setValue, loading }
}
