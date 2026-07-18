import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Coins,
  CloudSun,
  TicketCheck,
  Plane,
  BedDouble,
  BellRing,
  Heart,
  BarChart3,
  BookHeart,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/feedback/Toast'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useTrip } from '@/hooks/useTrip'

const MENU_GROUPS: { title: string; items: { icon: React.ReactNode; label: string; desc: string; to?: string }[] }[] = [
  {
    title: '旅行工具',
    items: [
      { icon: <Coins size={18} />, label: '匯率換算', desc: '日幣／台幣即時換算' },
      { icon: <CloudSun size={18} />, label: '天氣預報', desc: '每日天氣與穿搭建議' },
      { icon: <TicketCheck size={18} />, label: '交通票券', desc: 'Suica・JR Pass・QR Code', to: '/tickets' },
      { icon: <Plane size={18} />, label: '航班資訊', desc: '航班時刻與登機提醒', to: '/flights' },
      { icon: <BedDouble size={18} />, label: '住宿資訊', desc: '飯店地址與訂房編號', to: '/accommodation' },
      { icon: <BellRing size={18} />, label: '旅行提醒', desc: '集合時間・退房提醒', to: '/reminders' },
    ],
  },
  {
    title: '回憶與收藏',
    items: [
      { icon: <Heart size={18} />, label: '景點收藏', desc: '想去・已去清單', to: '/favorites' },
      { icon: <BookHeart size={18} />, label: '旅行回憶', desc: '每日回憶卡與旅行紀念冊', to: '/memories' },
      { icon: <BarChart3 size={18} />, label: '統計分析', desc: '旅行結束後的完整摘要' },
    ],
  },
]

export default function More() {
  const { show } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const { trip, budget, updateTrip, updateBudget } = useTrip()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftNames, setDraftNames] = useState<Record<string, string>>({})
  const [draftRate, setDraftRate] = useState('')
  const [draftBudget, setDraftBudget] = useState({
    total: '',
    accommodation: '',
    transport: '',
    food: '',
    shopping: '',
    dailyLimit: '',
  })

  useEffect(() => {
    if ((location.state as { openSettings?: boolean } | null)?.openSettings) {
      setSettingsOpen(true)
    }
  }, [location.state])

  useEffect(() => {
    if (trip) {
      setDraftNames(Object.fromEntries(trip.travelers.map((t) => [t.id, t.name])))
      setDraftRate(String(trip.exchangeRate))
    }
  }, [trip])

  useEffect(() => {
    if (budget) {
      setDraftBudget({
        total: String(budget.total ?? ''),
        accommodation: budget.accommodation != null ? String(budget.accommodation) : '',
        transport: budget.transport != null ? String(budget.transport) : '',
        food: budget.food != null ? String(budget.food) : '',
        shopping: budget.shopping != null ? String(budget.shopping) : '',
        dailyLimit: budget.dailyLimit != null ? String(budget.dailyLimit) : '',
      })
    }
  }, [budget])

  function handleSave() {
    const rate = Number(draftRate)
    updateTrip((prev) => ({
      ...prev,
      travelers: prev.travelers.map((t) => ({
        ...t,
        name: draftNames[t.id]?.trim() || t.name,
      })),
      exchangeRate: rate > 0 ? rate : prev.exchangeRate,
    }))
    updateBudget((prev) => ({
      ...prev,
      total: draftBudget.total ? Number(draftBudget.total) : prev.total,
      accommodation: draftBudget.accommodation ? Number(draftBudget.accommodation) : undefined,
      transport: draftBudget.transport ? Number(draftBudget.transport) : undefined,
      food: draftBudget.food ? Number(draftBudget.food) : undefined,
      shopping: draftBudget.shopping ? Number(draftBudget.shopping) : undefined,
      dailyLimit: draftBudget.dailyLimit ? Number(draftBudget.dailyLimit) : undefined,
    }))
    setSettingsOpen(false)
    show('設定已更新', 'success')
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">更多</h1>
        <p className="text-[13px] text-warmgray dark:text-warmgray-light">旅行手帳的每一個角落</p>
      </header>

      <div className="space-y-6 px-5">
        {MENU_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-1 text-[13px] font-medium text-warmgray dark:text-warmgray-light">{group.title}</p>
            <Card padded={false} className="divide-y divide-khaki/40 dark:divide-dusk-border">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => (item.to ? navigate(item.to) : show(`「${item.label}」將於下一階段開放`, 'info'))}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-cream-soft/60 dark:active:bg-dusk-bg/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light/40 text-sage-dark dark:bg-sage-dark/20 dark:text-sage-light">
                    {item.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] text-ink dark:text-cream-soft">{item.label}</span>
                    <span className="block text-[12px] text-warmgray dark:text-warmgray-light">{item.desc}</span>
                  </span>
                  <ChevronRight size={16} className="text-warmgray/60" />
                </button>
              ))}
            </Card>
          </div>
        ))}

        <div>
          <p className="mb-2 px-1 text-[13px] font-medium text-warmgray dark:text-warmgray-light">其他</p>
          <Card padded={false}>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-cream-soft/60 dark:active:bg-dusk-bg/60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light/40 text-sage-dark dark:bg-sage-dark/20 dark:text-sage-light">
                <Settings size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] text-ink dark:text-cream-soft">設定</span>
                <span className="block text-[12px] text-warmgray dark:text-warmgray-light">旅伴・預算・幣別設定</span>
              </span>
              <ChevronRight size={16} className="text-warmgray/60" />
            </button>
          </Card>
        </div>
      </div>

      <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="旅行設定">
        {trip && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[13px] font-medium text-ink dark:text-cream-soft">旅伴名稱</p>
              <div className="space-y-3">
                {trip.travelers.map((t) => (
                  <div key={t.id}>
                    <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">
                      {t.avatarEmoji} 旅伴名稱
                    </label>
                    <input
                      value={draftNames[t.id] ?? ''}
                      onChange={(e) => setDraftNames((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      placeholder="輸入名稱"
                      className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink dark:text-cream-soft">匯率設定</p>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">
                1 日圓（JPY）= 多少台幣（TWD）
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.001"
                value={draftRate}
                onChange={(e) => setDraftRate(e.target.value)}
                placeholder="0.21"
                className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
              />
              <p className="mt-1 text-[11px] text-warmgray dark:text-warmgray-light">
                會用來換算花費頁與首頁的台幣金額，記得依當時實際匯率調整
              </p>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink dark:text-cream-soft">預算設定（新台幣）</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">總預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.total}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, total: e.target.value }))}
                    placeholder="45000"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">每日預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.dailyLimit}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, dailyLimit: e.target.value }))}
                    placeholder="6500"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">住宿預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.accommodation}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, accommodation: e.target.value }))}
                    placeholder="15000"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">交通預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.transport}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, transport: e.target.value }))}
                    placeholder="6000"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">餐飲預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.food}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, food: e.target.value }))}
                    placeholder="12000"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">購物預算</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draftBudget.shopping}
                    onChange={(e) => setDraftBudget((p) => ({ ...p, shopping: e.target.value }))}
                    placeholder="8000"
                    className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark"
            >
              儲存
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
