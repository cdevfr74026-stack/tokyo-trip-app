// ============================================================
// 儲存層抽象 (Storage Adapter)
// ============================================================

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  subscribe<T>(key: string, callback: (value: T | null) => void): () => void
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
  tickets: 'tickets',
  flights: 'flights',
  accommodations: 'accommodations',
  reminders: 'reminders',
  favoriteSpots: 'favorite-spots',
  theme: 'theme-mode',
  onboardingSeen: 'onboarding-seen',
} as const
