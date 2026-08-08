// ============================================================
// 儲存層抽象 (Storage Adapter)
// ============================================================

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  subscribe<T>(key: string, callback: (value: T | null) => void): () => void
  // 集合模式：把資料拆成很多份「各自獨立」的小文件，而不是擠在同一份大文件裡。
  // 專門用來放照片這種「單筆可能很肥大、加總起來很容易超過 1MB 上限」的內容——
  // 拆開之後，每一份各自有 1MB 額度，彼此不會互相排擠，容量寬裕非常多。
  subscribeCollection<T>(collectionKey: string, callback: (items: Record<string, T>) => void): () => void
  setDoc<T>(collectionKey: string, docId: string, value: T): Promise<void>
  deleteDoc(collectionKey: string, docId: string): Promise<void>
}

const NAMESPACE = 'travel-journal:'

class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = window.localStorage.getItem(NAMESPACE + key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch (err) {
      console.error(`[storage] 讀取 ${key} 失敗`, err)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
    } catch (err) {
      console.error(`[storage] 寫入 ${key} 失敗`, err)
      throw err
    }
  }

  async remove(key: string): Promise<void> {
    window.localStorage.removeItem(NAMESPACE + key)
  }

  subscribe<T>(key: string, callback: (value: T | null) => void): () => void {
    const fullKey = NAMESPACE + key
    // 訂閱當下立即回傳目前的值（模擬 Firestore onSnapshot 訂閱時會先給目前快取值的行為），
    // 這樣上層就不需要另外再發一次 get() 去要初始值，避免兩邊互相競速覆蓋。
    this.get<T>(key).then((current) => callback(current))
    const listener = (e: StorageEvent) => {
      if (e.key !== fullKey) return
      try {
        callback(e.newValue ? (JSON.parse(e.newValue) as T) : null)
      } catch {
        callback(null)
      }
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }

  async setDoc<T>(collectionKey: string, docId: string, value: T): Promise<void> {
    const map = (await this.get<Record<string, T>>(collectionKey)) ?? {}
    map[docId] = value
    await this.set(collectionKey, map)
  }

  async deleteDoc(collectionKey: string, docId: string): Promise<void> {
    const map = (await this.get<Record<string, unknown>>(collectionKey)) ?? {}
    delete map[docId]
    await this.set(collectionKey, map)
  }

  subscribeCollection<T>(collectionKey: string, callback: (items: Record<string, T>) => void): () => void {
    return this.subscribe<Record<string, T>>(collectionKey, (val) => callback(val ?? {}))
  }
}

async function createAdapter(): Promise<StorageAdapter> {
  if (import.meta.env.VITE_USE_FIREBASE === 'true') {
    const { FirebaseStorageAdapter } = await import('@/lib/firebaseAdapter')
    return new FirebaseStorageAdapter()
  }
  return new LocalStorageAdapter()
}

let adapterPromise: Promise<StorageAdapter> | null = null
function getAdapter(): Promise<StorageAdapter> {
  if (!adapterPromise) adapterPromise = createAdapter()
  return adapterPromise
}

export const storage: StorageAdapter = {
  async get<T>(key: string) {
    const adapter = await getAdapter()
    return adapter.get<T>(key)
  },
  async set<T>(key: string, value: T) {
    const adapter = await getAdapter()
    return adapter.set(key, value)
  },
  async remove(key: string) {
    const adapter = await getAdapter()
    return adapter.remove(key)
  },
  subscribe<T>(key: string, callback: (value: T | null) => void) {
    let unsub: (() => void) | null = null
    let cancelled = false
    getAdapter().then((adapter) => {
      if (cancelled) return
      unsub = adapter.subscribe<T>(key, callback)
    })
    return () => {
      cancelled = true
      unsub?.()
    }
  },
  async setDoc<T>(collectionKey: string, docId: string, value: T) {
    const adapter = await getAdapter()
    return adapter.setDoc(collectionKey, docId, value)
  },
  async deleteDoc(collectionKey: string, docId: string) {
    const adapter = await getAdapter()
    return adapter.deleteDoc(collectionKey, docId)
  },
  subscribeCollection<T>(collectionKey: string, callback: (items: Record<string, T>) => void) {
    let unsub: (() => void) | null = null
    let cancelled = false
    getAdapter().then((adapter) => {
      if (cancelled) return
      unsub = adapter.subscribeCollection<T>(collectionKey, callback)
    })
    return () => {
      cancelled = true
      unsub?.()
    }
  },
}

export const STORAGE_KEYS = {
  trip: 'trip',
  days: 'days',
  itineraryItems: 'itinerary-items',
  expenses: 'expenses',
  fundContributions: 'fund-contributions',
  budget: 'budget',
  packingItems: 'packing-items',
  mustBuyItems: 'must-buy-items',
  mustBuyCategories: 'must-buy-categories',
  tickets: 'tickets',
  flights: 'flights',
  accommodations: 'accommodations',
  reminders: 'reminders',
  favoriteSpots: 'favorite-spots',
  theme: 'theme-mode',
  onboardingSeen: 'onboarding-seen',
} as const
