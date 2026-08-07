import type { DayWeather } from '@/types'

const TOKYO_LAT = 35.6762
const TOKYO_LON = 139.6503

const WMO_META: Record<number, { condition: string; icon: string }> = {
  0: { condition: '晴朗', icon: '☀️' },
  1: { condition: '晴時多雲', icon: '🌤️' },
  2: { condition: '多雲時晴', icon: '⛅' },
  3: { condition: '陰天', icon: '☁️' },
  45: { condition: '有霧', icon: '🌫️' },
  48: { condition: '有霧', icon: '🌫️' },
  51: { condition: '毛毛雨', icon: '🌦️' },
  53: { condition: '毛毛雨', icon: '🌦️' },
  55: { condition: '毛毛雨', icon: '🌦️' },
  61: { condition: '小雨', icon: '🌧️' },
  63: { condition: '中雨', icon: '🌧️' },
  65: { condition: '大雨', icon: '🌧️' },
  71: { condition: '小雪', icon: '🌨️' },
  73: { condition: '中雪', icon: '🌨️' },
  75: { condition: '大雪', icon: '❄️' },
  80: { condition: '陣雨', icon: '🌦️' },
  81: { condition: '陣雨', icon: '🌦️' },
  82: { condition: '強陣雨', icon: '⛈️' },
  95: { condition: '雷雨', icon: '⛈️' },
  96: { condition: '雷雨挾冰雹', icon: '⛈️' },
  99: { condition: '雷雨挾冰雹', icon: '⛈️' },
}

function outfitAdvice(highTemp: number, precipitationChance: number) {
  const parts: string[] = []
  if (highTemp >= 28) parts.push('短袖、防曬是必備')
  else if (highTemp >= 22) parts.push('薄長袖或短袖外搭薄外套')
  else if (highTemp >= 15) parts.push('長袖加一件外套')
  else parts.push('記得穿保暖外套')
  if (precipitationChance >= 50) parts.push('降雨機率高，建議帶傘')
  return parts.join('，')
}

export interface WeatherFetchResult {
  byDate: Record<string, DayWeather>
  outOfForecastRange: boolean
}

export async function fetchTokyoWeather(startDate: string, endDate: string): Promise<WeatherFetchResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(TOKYO_LAT))
  url.searchParams.set('longitude', String(TOKYO_LON))
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max')
  url.searchParams.set('timezone', 'Asia/Tokyo')
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`天氣 API 錯誤：${res.status}`)
  }
  const data = await res.json()

  const byDate: Record<string, DayWeather> = {}
  const dates: string[] = data?.daily?.time ?? []
  const codes: number[] = data?.daily?.weathercode ?? []
  const highs: number[] = data?.daily?.temperature_2m_max ?? []
  const lows: number[] = data?.daily?.temperature_2m_min ?? []
  const rains: number[] = data?.daily?.precipitation_probability_max ?? []

  dates.forEach((date, i) => {
    const meta = WMO_META[codes[i]] ?? { condition: '天氣多變', icon: '🌥️' }
    const highTemp = Math.round(highs[i])
    const precipitationChance = Math.round(rains[i] ?? 0)
    byDate[date] = {
      condition: meta.condition,
      icon: meta.icon,
      highTemp,
      lowTemp: Math.round(lows[i]),
      precipitationChance,
      outfitAdvice: outfitAdvice(highTemp, precipitationChance),
      needUmbrella: precipitationChance >= 50,
    }
  })

  return { byDate, outOfForecastRange: dates.length === 0 }
}
