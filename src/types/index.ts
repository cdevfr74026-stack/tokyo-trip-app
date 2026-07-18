// ============================================================
// 旅行手帳 App - 核心資料型別
// 此檔案定義所有跨 Phase 共用的資料結構。
// 設計原則：純資料介面，不綁定儲存方式（LocalStorage / Firebase / Supabase 皆可套用）。
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export type ExpenseCategory =
  | 'accommodation' // 住宿
  | 'transport' // 交通
  | 'food' // 餐飲
  | 'shopping' // 購物
  | 'ticket' // 門票
  | 'souvenir' // 伴手禮
  | 'other' // 其他

export type ItineraryCategory =
  | 'sightseeing' // 景點
  | 'food' // 美食
  | 'shopping' // 購物
  | 'transport' // 交通
  | 'accommodation' // 住宿
  | 'experience' // 體驗
  | 'other'

export type TransportMode =
  | 'walk'
  | 'train'
  | 'subway'
  | 'bus'
  | 'taxi'
  | 'shinkansen'
  | 'flight'
  | 'other'

export type MoodEmoji =
  | 'happy' // 😊 很開心
  | 'love' // 😍 超喜歡
  | 'relaxed' // 😌 放鬆
  | 'touched' // 🥹 感動
  | 'tired' // 😴 很累
  | 'full' // 😋 吃超飽
  | 'excited' // 🤩 今天超精彩

export const MOOD_META: Record<MoodEmoji, { emoji: string; label: string }> = {
  happy: { emoji: '😊', label: '很開心' },
  love: { emoji: '😍', label: '超喜歡' },
  relaxed: { emoji: '😌', label: '放鬆' },
  touched: { emoji: '🥹', label: '感動' },
  tired: { emoji: '😴', label: '很累' },
  full: { emoji: '😋', label: '吃超飽' },
  excited: { emoji: '🤩', label: '今天超精彩' },
}

export interface Traveler {
  id: string
  name: string
  avatarColor: string // tailwind 色票 key，用於頭像底色
  avatarEmoji?: string
}

export interface Trip {
  id: string
  name: string // 旅遊名稱
  destination: string // 目的地
  coverEmoji?: string
  startDate: string // ISO date
  endDate: string // ISO date
  travelers: Traveler[]
  currencyBase: string // 主要幣別，例如 TWD
  currencyForeign: string // 當地幣別，例如 JPY
  exchangeRate: number // 1 外幣 = ? 本幣，例如 1 JPY = 0.21 TWD
  createdAt: string
  startedAt?: string // 實際開始旅程時間戳（用於開場動畫僅顯示一次）
  endedAt?: string // 旅程結束時間戳（用於結尾動畫僅顯示一次）
}

export interface ItineraryItem {
  id: string
  dayId: string
  order: number
  time?: string // HH:mm
  title: string // 地點名稱
  address?: string
  googleMapsUrl?: string
  category: ItineraryCategory
  durationMinutes?: number // 停留時間
  transportMode?: TransportMode
  transportMinutes?: number // 到下個景點的交通時間
  note?: string
  photoUrls: string[]
  estimatedCost?: number // 預估花費（當地幣別）
  completed: boolean
}

export interface TripDay {
  id: string
  tripId: string
  dayIndex: number // Day 1, Day 2...
  date: string // ISO date
  areaLabel?: string // 今日主要區域，例如「淺草」
  weather?: DayWeather
  moodEmoji?: MoodEmoji
  diaryText?: string // 今日一句旅行日記
  steps?: number // 今日步數（手動輸入）
}

export interface DayWeather {
  condition: string // 例如「晴時多雲」
  icon: string // lucide icon key 或 emoji
  highTemp: number
  lowTemp: number
  precipitationChance: number // 0-100
  outfitAdvice?: string
  needUmbrella: boolean
}

export interface Expense {
  id: string
  tripId: string
  dayId?: string
  date: string
  category: ExpenseCategory
  merchant: string // 店家
  amountForeign: number // 當地幣別金額
  payerId: string // Traveler id
  isSplit: boolean // 是否共同分攤
  splitWith: string[] // 分攤者 Traveler ids
  note?: string
  receiptPhotoUrl?: string
}

export interface Budget {
  tripId: string
  total: number // 主幣別
  accommodation?: number
  transport?: number
  food?: number
  shopping?: number
  dailyLimit?: number
}

export type PackingCategory =
  | 'documents' // 證件
  | 'clothing' // 衣物
  | 'shoes' // 鞋子
  | 'electronics' // 電子用品
  | 'charger' // 充電器
  | 'medicine' // 藥品
  | 'skincare' // 保養品
  | 'makeup' // 化妝品
  | 'other'

export interface PackingItem {
  id: string
  tripId: string
  category: PackingCategory
  name: string
  checked: boolean
  order: number
}

export type TicketType = 'suica' | 'icoca' | 'jrpass' | 'metropass' | 'airportbus' | 'shinkansen' | 'other'

export interface TransitTicket {
  id: string
  tripId: string
  type: TicketType
  name: string
  purchaseDate?: string
  price?: number
  validUntil?: string
  qrCodeData?: string
  note?: string
}

export interface Flight {
  id: string
  tripId: string
  airline: string
  flightNumber: string
  departTime: string // ISO datetime
  arriveTime: string // ISO datetime
  departAirport: string
  arriveAirport: string
  terminal?: string
  gate?: string
  checkinTime?: string
  baggageWeightKg?: number
  eTicketNumber?: string
}

export interface Accommodation {
  id: string
  tripId: string
  name: string
  address: string
  checkIn: string // ISO datetime
  checkOut: string // ISO datetime
  bookingSite?: string
  bookingNumber?: string
  googleMapsUrl?: string
  phone?: string
  note?: string
}

export type ReminderType = 'general' | 'meetup' | 'flight' | 'checkout' | 'shopping'

export interface Reminder {
  id: string
  tripId: string
  type: ReminderType
  title: string
  datetime: string
  note?: string
  completed: boolean
}

export type SpotStatus = 'wishlist' | 'saved' | 'visited'

export interface FavoriteSpot {
  id: string
  tripId: string
  name: string
  googleMapsUrl?: string
  address?: string
  area?: string
  category?: ItineraryCategory
  status: SpotStatus
  addedAt: string
}

export interface AchievementDef {
  id: string
  title: string
  emoji: string
  description: string
  check: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  ramenCount: number
  sushiCount: number
  cafeCount: number
  shoppingCount: number
  totalWalkKm: number
  spotsVisited: number
  photoCount: number
}

export interface DailyStats {
  dayId: string
  spotCount: number
  restaurantCount: number
  photoCount: number
  steps?: number
  totalSpentForeign: number
}
