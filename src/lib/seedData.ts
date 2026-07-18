import type { Trip, TripDay, ItineraryItem, Budget, Traveler } from '@/types'

// ============================================================
// 東京 7 天 6 夜 - 初始種子資料
// 使用者可在 App 中修改，此檔案僅提供首次啟動的預設內容。
// ============================================================

const TRIP_ID = 'trip-tokyo-2026'

export const seedTravelers: Traveler[] = [
  { id: 'traveler-1', name: '蓁蓁', avatarColor: 'sage', avatarEmoji: '🌿' },
  { id: 'traveler-2', name: '阿豬', avatarColor: 'milktea', avatarEmoji: '🍵' },
]

export const seedTrip: Trip = {
  id: TRIP_ID,
  name: '東京自由行',
  destination: '日本・東京',
  coverEmoji: '✈️',
  startDate: '2026-09-06',
  endDate: '2026-09-12',
  travelers: seedTravelers,
  currencyBase: 'TWD',
  currencyForeign: 'JPY',
  exchangeRate: 0.21,
  createdAt: new Date().toISOString(),
}

function makeDay(dayIndex: number, date: string, areaLabel: string): TripDay {
  return {
    id: `day-${dayIndex}`,
    tripId: TRIP_ID,
    dayIndex,
    date,
    areaLabel,
  }
}

export const seedDays: TripDay[] = [
  makeDay(1, '2026-09-06', '淺草・晴空塔'),
  makeDay(2, '2026-09-07', '澀谷・原宿'),
  makeDay(3, '2026-09-08', '新宿'),
  makeDay(4, '2026-09-09', '台場・銀座'),
  makeDay(5, '2026-09-10', '上野・秋葉原'),
  makeDay(6, '2026-09-11', '橫濱一日遊'),
  makeDay(7, '2026-09-12', '機場・賦歸'),
]

let itemOrder = 0
function makeItem(partial: Omit<ItineraryItem, 'order' | 'photoUrls' | 'completed'>): ItineraryItem {
  return {
    ...partial,
    order: itemOrder++,
    photoUrls: [],
    completed: false,
  }
}

export const seedItineraryItems: ItineraryItem[] = [
  makeItem({
    id: 'item-1',
    dayId: 'day-1',
    time: '09:00',
    title: '淺草寺',
    address: '東京都台東区浅草2丁目3-1',
    category: 'sightseeing',
    durationMinutes: 90,
    transportMode: 'walk',
    transportMinutes: 10,
    note: '抽個籤，感受江戶老街氣息',
    estimatedCost: 0,
  }),
  makeItem({
    id: 'item-2',
    dayId: 'day-1',
    time: '10:30',
    title: '仲見世商店街',
    address: '東京都台東区浅草1丁目',
    category: 'shopping',
    durationMinutes: 60,
    transportMode: 'walk',
    transportMinutes: 15,
    estimatedCost: 1500,
  }),
  makeItem({
    id: 'item-3',
    dayId: 'day-1',
    time: '12:00',
    title: '午餐・壽司店',
    address: '東京都台東区浅草',
    category: 'food',
    durationMinutes: 60,
    transportMode: 'train',
    transportMinutes: 20,
    estimatedCost: 2500,
  }),
  makeItem({
    id: 'item-4',
    dayId: 'day-1',
    time: '15:00',
    title: '東京晴空塔',
    address: '東京都墨田区押上1丁目1-2',
    category: 'sightseeing',
    durationMinutes: 120,
    transportMode: 'walk',
    transportMinutes: 15,
    estimatedCost: 3200,
  }),
  makeItem({
    id: 'item-5',
    dayId: 'day-1',
    time: '18:00',
    title: '晴空塔夜景',
    address: '東京都墨田区押上1丁目1-2',
    category: 'experience',
    durationMinutes: 60,
    estimatedCost: 0,
  }),
]

export const seedBudget: Budget = {
  tripId: TRIP_ID,
  total: 45000,
  accommodation: 15000,
  transport: 6000,
  food: 12000,
  shopping: 8000,
  dailyLimit: 6500,
}

export const seedPackingItems: import('@/types').PackingItem[] = [
  { id: 'pack-1', tripId: TRIP_ID, category: 'documents', name: '護照', checked: false, order: 0 },
  { id: 'pack-2', tripId: TRIP_ID, category: 'documents', name: '機票電子憑證', checked: false, order: 1 },
  { id: 'pack-3', tripId: TRIP_ID, category: 'documents', name: '訂房確認單', checked: false, order: 2 },
  { id: 'pack-4', tripId: TRIP_ID, category: 'clothing', name: '換洗衣物 x7', checked: false, order: 3 },
  { id: 'pack-5', tripId: TRIP_ID, category: 'clothing', name: '薄外套', checked: false, order: 4 },
  { id: 'pack-6', tripId: TRIP_ID, category: 'shoes', name: '好走的鞋', checked: false, order: 5 },
  { id: 'pack-7', tripId: TRIP_ID, category: 'electronics', name: '手機', checked: false, order: 6 },
  { id: 'pack-8', tripId: TRIP_ID, category: 'electronics', name: '相機', checked: false, order: 7 },
  { id: 'pack-9', tripId: TRIP_ID, category: 'charger', name: '充電器 & 行動電源', checked: false, order: 8 },
  { id: 'pack-10', tripId: TRIP_ID, category: 'charger', name: '轉接頭', checked: false, order: 9 },
  { id: 'pack-11', tripId: TRIP_ID, category: 'medicine', name: '常備藥品', checked: false, order: 10 },
  { id: 'pack-12', tripId: TRIP_ID, category: 'skincare', name: '保養品分裝', checked: false, order: 11 },
  { id: 'pack-13', tripId: TRIP_ID, category: 'makeup', name: '隨身化妝包', checked: false, order: 12 },
  { id: 'pack-14', tripId: TRIP_ID, category: 'other', name: '折疊購物袋', checked: false, order: 13 },
]

export const TRIP_QUOTES = [
  '旅行不是逃離生活，而是讓生活更值得回憶。',
  '每一段旅程，都會成為未來懷念的風景。',
  '今天的腳步，會變成明天最珍貴的故事。',
  '慢慢走，才能把風景留在心裡。',
  '有些風景，只有親自抵達才算數。',
  '旅行的意義，是把陌生的地方走成回憶。',
]
