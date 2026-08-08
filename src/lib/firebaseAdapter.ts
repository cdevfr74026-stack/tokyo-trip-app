import {
  doc,
  getDoc,
  setDoc as firestoreSetDoc,
  deleteDoc as firestoreDeleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { StorageAdapter } from '@/lib/storage'

const COLLECTION_NAME = 'trip-data'

/**
 * 遞迴移除物件／陣列裡所有值為 undefined 的欄位。
 * Firestore 的 setDoc() 不允許任何欄位值是 undefined（就算開了
 * ignoreUndefinedProperties 有時仍會因為版本或快取問題沒生效），
 * 所以寫入前一律在這裡手動清乾淨，從根本避免「存了但又消失」的問題。
 */
function stripUndefined<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripUndefined(item)) as unknown as T
  }
  if (input !== null && typeof input === 'object' && !(input instanceof Date)) {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (val === undefined) continue
      result[key] = stripUndefined(val)
    }
    return result as T
  }
  return input
}

export class FirebaseStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const ref = doc(collection(db, COLLECTION_NAME), key)
      const snap = await getDoc(ref)
      if (!snap.exists()) return null
      const data = snap.data()
      return (data.value as T) ?? null
    } catch (err) {
      console.error(`[firebase-storage] 讀取 ${key} 失敗`, err)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const ref = doc(collection(db, COLLECTION_NAME), key)
      const cleanValue = stripUndefined(value)
      await firestoreSetDoc(ref, { value: cleanValue, updatedAt: new Date().toISOString() })
    } catch (err) {
      console.error(`[firebase-storage] 寫入 ${key} 失敗`, err)
      throw err
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const ref = doc(collection(db, COLLECTION_NAME), key)
      await firestoreDeleteDoc(ref)
    } catch (err) {
      console.error(`[firebase-storage] 刪除 ${key} 失敗`, err)
    }
  }

  subscribe<T>(key: string, callback: (value: T | null) => void): () => void {
    const ref = doc(collection(db, COLLECTION_NAME), key)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          callback(null)
          return
        }
        const data = snap.data()
        callback((data.value as T) ?? null)
      },
      (err) => {
        // 訂閱失敗（例如網路瞬斷、Firestore 連線問題）時，
        // 一定要呼叫 callback(null)，讓上層的 loading 狀態能夠結束，
        // 否則畫面會永遠卡在 Loading Skeleton，使用者會以為 App 打不開。
        console.error(`[firebase-storage] 訂閱 ${key} 失敗`, err)
        callback(null)
      },
    )
    return unsubscribe
  }

  async setDoc<T>(collectionKey: string, docId: string, value: T): Promise<void> {
    try {
      const ref = doc(collection(db, collectionKey), docId)
      const cleanValue = stripUndefined(value)
      await firestoreSetDoc(ref, { value: cleanValue, updatedAt: new Date().toISOString() })
    } catch (err) {
      console.error(`[firebase-storage] 寫入集合 ${collectionKey}/${docId} 失敗`, err)
      throw err
    }
  }

  async deleteDoc(collectionKey: string, docId: string): Promise<void> {
    try {
      const ref = doc(collection(db, collectionKey), docId)
      await firestoreDeleteDoc(ref)
    } catch (err) {
      console.error(`[firebase-storage] 刪除集合 ${collectionKey}/${docId} 失敗`, err)
      throw err
    }
  }

  subscribeCollection<T>(collectionKey: string, callback: (items: Record<string, T>) => void): () => void {
    const colRef = collection(db, collectionKey)
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        const result: Record<string, T> = {}
        snap.forEach((docSnap) => {
          const data = docSnap.data()
          result[docSnap.id] = data.value as T
        })
        callback(result)
      },
      (err) => {
        console.error(`[firebase-storage] 訂閱集合 ${collectionKey} 失敗`, err)
        callback({})
      },
    )
    return unsubscribe
  }
}
