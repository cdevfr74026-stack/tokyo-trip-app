import type { ItineraryCategory, ExpenseCategory, PackingCategory, TransportMode } from '@/types'

export const ITINERARY_CATEGORY_META: Record<ItineraryCategory, { label: string; emoji: string }> = {
  sightseeing: { label: '景點', emoji: '📍' },
  food: { label: '美食', emoji: '🍣' },
  shopping: { label: '購物', emoji: '🛍' },
  transport: { label: '交通', emoji: '🚆' },
  accommodation: { label: '住宿', emoji: '🏨' },
  experience: { label: '體驗', emoji: '🎡' },
  other: { label: '其他', emoji: '📌' },
}

export const EXPENSE_CATEGORY_META: Record<ExpenseCategory, { label: string; emoji: string }> = {
  accommodation: { label: '住宿', emoji: '🏨' },
  transport: { label: '交通', emoji: '🚆' },
  food: { label: '餐飲', emoji: '🍣' },
  shopping: { label: '購物', emoji: '🛍' },
  ticket: { label: '門票', emoji: '🎟' },
  souvenir: { label: '伴手禮', emoji: '🎁' },
  other: { label: '其他', emoji: '📌' },
}

export const PACKING_CATEGORY_META: Record<PackingCategory, { label: string; emoji: string }> = {
  documents: { label: '證件', emoji: '🛂' },
  clothing: { label: '衣物', emoji: '👕' },
  shoes: { label: '鞋子', emoji: '👟' },
  electronics: { label: '電子用品', emoji: '🔌' },
  charger: { label: '充電器', emoji: '🔋' },
  medicine: { label: '藥品', emoji: '💊' },
  skincare: { label: '保養品', emoji: '🧴' },
  makeup: { label: '化妝品', emoji: '💄' },
  other: { label: '其他', emoji: '🎒' },
}

export const TRANSPORT_MODE_META: Record<TransportMode, { label: string; emoji: string }> = {
  walk: { label: '步行', emoji: '🚶' },
  train: { label: '電車', emoji: '🚃' },
  subway: { label: '地鐵', emoji: '🚇' },
  bus: { label: '巴士', emoji: '🚌' },
  taxi: { label: '計程車', emoji: '🚕' },
  shinkansen: { label: '新幹線', emoji: '🚄' },
  flight: { label: '飛機', emoji: '✈️' },
  other: { label: '其他', emoji: '🧭' },
}
