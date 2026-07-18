import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, Plane } from 'lucide-react'
import { useFlights, type FlightDraft } from '@/hooks/useFlights'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'

const EMPTY: FlightDraft = {
  airline: '', flightNumber: '', departTime: '', arriveTime: '', departAirport: '', arriveAirport: '',
  terminal: '', gate: '', checkinTime: '', baggageWeightKg: undefined, eTicketNumber: '',
}

function countdownLabel(iso: string) {
  if (!iso) return null
  const diffMs = new Date(iso).getTime() - Date.now()
  if (diffMs <= 0) return null
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} 天後起飛`
  return `${hours} 小時後起飛`
}

export default function Flights() {
  const navigate = useNavigate()
  const { flights, loading, addFlight, updateFlight, removeFlight } = useFlights()
  const { show } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<FlightDraft>(EMPTY)

  function openAdd() { setEditingId(null); setDraft(EMPTY); setFormOpen(true) }
  function openEdit(id: string) {
    const f = flights.find((x) => x.id === id)
    if (!f) return
    setEditingId(id)
    setDraft({ ...f, terminal: f.terminal ?? '', gate: f.gate ?? '', checkinTime: f.checkinTime ?? '', eTicketNumber: f.eTicketNumber ?? '' })
    setFormOpen(true)
  }
  function handleSave() {
    if (!draft.airline.trim() || !draft.departTime) return show('請輸入航空公司與起飛時間', 'error')
    const clean: FlightDraft = { ...draft, airline: draft.airline.trim() }
    if (editingId) { updateFlight(editingId, clean); show('航班已更新', 'success') } else { addFlight(clean); show('航班已新增', 'success') }
    setFormOpen(false)
  }

  if (loading) return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>

  const sorted = [...flights].sort((a, b) => (a.departTime < b.departTime ? -1 : 1))

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">航班資訊</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">航班時刻與登機提醒</p>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {sorted.length === 0 ? (
          <EmptyState icon={<span className="text-4xl">✈️</span>} title="還沒有航班資訊" description="點右下角按鈕新增航班吧" />
        ) : (
          sorted.map((f) => {
            const countdown = countdownLabel(f.departTime)
            return (
              <Card key={f.id} className="!p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Plane size={16} className="text-mist" />
                    <div>
                      <p className="text-[15px] text-ink dark:text-cream-soft">{f.airline} {f.flightNumber}</p>
                      {countdown && <p className="text-[11px] text-apricot">⏱ {countdown}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(f.id)} className="text-warmgray/60 active:text-ink dark:text-warmgray-light/60"><Pencil size={15} /></button>
                    <button onClick={() => removeFlight(f.id)} className="text-warmgray/60 active:text-apricot"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[13px] text-ink dark:text-cream-soft">
                  <div>
                    <p className="font-display text-lg">{f.departAirport}</p>
                    <p className="text-[11px] text-warmgray dark:text-warmgray-light">{f.departTime ? new Date(f.departTime).toLocaleString('zh-Hant-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                  <span className="text-warmgray">→</span>
                  <div className="text-right">
                    <p className="font-display text-lg">{f.arriveAirport}</p>
                    <p className="text-[11px] text-warmgray dark:text-warmgray-light">{f.arriveTime ? new Date(f.arriveTime).toLocaleString('zh-Hant-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-warmgray dark:text-warmgray-light">
                  {f.terminal && <p>航廈：{f.terminal}</p>}
                  {f.gate && <p>登機門：{f.gate}</p>}
                  {f.checkinTime && <p>報到時間：{f.checkinTime}</p>}
                  {f.baggageWeightKg != null && <p>行李：{f.baggageWeightKg} kg</p>}
                </div>
              </Card>
            )
          })
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增航班" onClick={openAdd} />

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? '編輯航班' : '新增航班'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">航空公司 *</label>
              <input autoFocus value={draft.airline} onChange={(e) => setDraft((p) => ({ ...p, airline: e.target.value }))} placeholder="長榮航空" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">航班編號</label>
              <input value={draft.flightNumber} onChange={(e) => setDraft((p) => ({ ...p, flightNumber: e.target.value }))} placeholder="BR198" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">出發機場</label>
              <input value={draft.departAirport} onChange={(e) => setDraft((p) => ({ ...p, departAirport: e.target.value }))} placeholder="TPE" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">抵達機場</label>
              <input value={draft.arriveAirport} onChange={(e) => setDraft((p) => ({ ...p, arriveAirport: e.target.value }))} placeholder="NRT" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">起飛時間 *</label>
              <input type="datetime-local" value={draft.departTime} onChange={(e) => setDraft((p) => ({ ...p, departTime: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">抵達時間</label>
              <input type="datetime-local" value={draft.arriveTime} onChange={(e) => setDraft((p) => ({ ...p, arriveTime: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">航廈</label>
              <input value={draft.terminal} onChange={(e) => setDraft((p) => ({ ...p, terminal: e.target.value }))} placeholder="T2" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">登機門</label>
              <input value={draft.gate} onChange={(e) => setDraft((p) => ({ ...p, gate: e.target.value }))} placeholder="D7" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">報到時間</label>
              <input value={draft.checkinTime} onChange={(e) => setDraft((p) => ({ ...p, checkinTime: e.target.value }))} placeholder="10:00" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">行李重量（kg）</label>
              <input type="number" inputMode="numeric" value={draft.baggageWeightKg ?? ''} onChange={(e) => setDraft((p) => ({ ...p, baggageWeightKg: e.target.value ? Number(e.target.value) : undefined }))} placeholder="23" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">電子機票號碼</label>
            <input value={draft.eTicketNumber} onChange={(e) => setDraft((p) => ({ ...p, eTicketNumber: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">{editingId ? '儲存修改' : '加入航班'}</button>
        </div>
      </BottomSheet>
    </div>
  )
}
