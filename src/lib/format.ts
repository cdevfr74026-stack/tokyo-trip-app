const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六']

export function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const sameYear = s.getFullYear() === e.getFullYear()
  const fmt = (d: Date, withYear: boolean) =>
    withYear ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
  return `${fmt(s, true)} - ${fmt(e, !sameYear)}`
}

export function formatDateWithWeekday(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}（週${WEEKDAYS_ZH[d.getDay()]}）`
}

export function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function formatCurrency(amount: number, currency: 'JPY' | 'TWD' = 'JPY') {
  const symbol = currency === 'JPY' ? '¥' : 'NT$'
  return `${symbol}${Math.round(amount).toLocaleString('zh-Hant-TW')}`
}

export function getDailyQuote(quotes: string[], seedDate: Date = new Date()) {
  const dayNumber = Math.floor(seedDate.getTime() / (1000 * 60 * 60 * 24))
  return quotes[dayNumber % quotes.length]
}
