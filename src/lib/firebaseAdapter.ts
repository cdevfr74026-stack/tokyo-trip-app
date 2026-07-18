import { doc, getDoc, setDoc, deleteDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { StorageAdapter } from '@/lib/storage'

// ============================================================
// Firebase Firestore 版本的 StorageAdapter
// 每個 key 對應 Firestore 內 "trip-data" collection 底下的一個文件，
// 文件內容為 { value: <實際資料> }。
//
// 這個檔案完全遵循 StorageAdapter 介面，
// 所以只要在 src/lib/storage.ts 把 LocalStorageAdapter
// 換成這個 FirebaseStorageAdapter，其他程式碼完全不用改。
//
// 之後若要做「多人即時同步」，可以再加上 onSnapshot 監聽，
// 目前先維持跟 LocalStorage 一致的 get/set 行為，方便你先跑起來。
// ============================================================

const COLLECTION_NAME = 'trip-data'

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
      await setDoc(ref, { value, updatedAt: new Date().toISOString() })
    } catch (err) {
      console.error(`[firebase-storage] 寫入 ${key} 失敗`, err)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const ref = doc(collection(db, COLLECTION_NAME), key)
      await deleteDoc(ref)
    } catch (err) {
      console.error(`[firebase-storage] 刪除 ${key} 失敗`, err)
    }
  }
}
