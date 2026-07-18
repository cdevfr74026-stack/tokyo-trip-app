// ============================================================
// 儲存層抽象 (Storage Adapter)
// 目前實作：LocalStorage（同步，包裝成 async 介面）
// 未來升級：實作相同的 StorageAdapter 介面即可換成 Firebase / Supabase，
// 上層的 hooks（useTrip, useExpenses...）完全不需要修改。
// ============================================================

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
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
}

// 未來替換為 FirebaseStorageAdapter / SupabaseStorageAdapter 即可無縫升級
// 目前透過環境變數 VITE_USE_FIREBASE 切換，預設仍使用 LocalStorage，
// 這樣在還沒設定好 Firebase 之前，App 依然可以正常運作。
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
}

export const STORAGE_KEYS = {
  trip: 'trip',
  days: 'days',
  itineraryItems: 'itinerary-items',
  expenses: 'expenses',
  budget: 'budget',
  packingItems: 'packing-items',
  tickets: 'tickets',
  flights: 'flights',
  accommodations: 'accommodations',
  reminders: 'reminders',
  favoriteSpots: 'favorite-spots',
  theme: 'theme-mode',
  onboardingSeen: 'onboarding-seen',
} as const
