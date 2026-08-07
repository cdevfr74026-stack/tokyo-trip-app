// ============================================================
// 旅行手帳 App - 核心資料型別
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export type ExpenseCategory =
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'shopping'
  | 'ticket'
  | 'souvenir'
  | 'other'

export type ItineraryCategory =
  | 'sightseeing'
  | 'food'
  | 'shopping'
  | 'transport'
  | 'accommodation'
  | 'experience'
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
  | 'happy'
  | 'love'
  | 'relaxed'
  | 'touched'
  | 'tired'
  | 'full'
  | 'excited'

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
  avatarColor: string
  avatarEmoji?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  coverEmoji?: string
  startDate: string
  endDate: string
  travelers: Traveler[]
  currencyBase: string
  currencyForeign: string
  exchangeRate: number
  createdAt: string
  startedAt?: string
  endedAt?: string
}

export interface ItineraryItem {
  id: string
  dayId: string
  order: number
  time?: string
  title: string
  address?: string
  googleMapsUrl?: string
  category: ItineraryCategory
  durationMinutes?: number
  transportMode?: TransportMode
  transportMinutes?: number
  note?: string
  photoUrls: string[]
  estimatedCost?: number
  completed: boolean
}

export interface TripDay {
  id: string
  tripId: string
  dayIndex: number
  date: string
  areaLabel?: string
  weather?: DayWeather
  moodEmoji?: MoodEmoji
  diaryText?: string
  steps?: number
}

export interface DayWeather {
  condition: string
  icon: string
  highTemp: number
  lowTemp: number
  precipitationChance: number
  outfitAdvice?: string
  needUmbrella: boolean
}

export interface Expense {
  id: string
  tripId: string
  dayId?: string
  date: string
  category: ExpenseCategory
  merchant: string
  amountForeign: number
  payerId: string
  isSplit: boolean
  splitWith: string[]
  note?: string
  receiptPhotoUrl?: string
}

export interface FundContribution {
  id: string
  tripId: string
  travelerId: string
  amount: number
  date: string
  note?: string
}

export interface Budget {
  tripId: string
  total: number
  accommodation?: number
  transport?: number
  food?: number
  shopping?: number
  dailyLimit?: number
}

export type PackingCategory =
  | 'documents'
  | 'clothing'
  | 'shoes'
  | 'electronics'
  | 'charger'
  | 'medicine'
  | 'skincare'
  | 'makeup'
  | 'other'

export interface PackingItem {
  id: string
  tripId: string
  category: PackingCategory
  name: string
  checked: boolean
  order: number
}

export interface MustBuyItem {
  id: string
  tripId: string
  travelerId: string
  name: string
  store?: string
  price?: number
  imageUrl?: string
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
  departTime: string
  arriveTime: string
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
  checkIn: string
  checkOut: string
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

export interface DailyStats {
  dayId: string
  spotCount: number
  restaurantCount: number
  photoCount: number
  steps?: number
  totalSpentForeign: number
}
