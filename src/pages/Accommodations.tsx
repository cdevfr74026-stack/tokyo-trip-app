import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, BedDouble, Navigation, Phone } from 'lucide-react'
import { useAccommodations, type AccommodationDraft } from '@/hooks/useAccommodations'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'

const EMPTY: AccommodationDraft = { name: '', address: '', checkIn: '', checkOut: '', bookingSite: '', bookingNumber: '', googleMapsUrl: '', phone: '', note: '' }

export default function Accommodations() {
  const navigate = useNavigate()
  const { accommodations, loading, addAccommodation, updateAccommodation, removeAccommodation } = useAccommodations()
  const { show } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccommodationDraft>(EMPTY)

  function openAdd() { setEditingId(null); setDraft(EMPTY); setFormOpen(true) }
  function openEdit(id: string) {
    const a = accommodations.find((x) => x.id === id)
    if (!a) return
    setEditingId(id)
    setDraft({ ...a, bookingSite: a.bookingSite ?? '', bookingNumber: a.bookingNumber ?? '', googleMapsUrl: a.googleMapsUrl ?? '', phone: a.phone ?? '', note: a.note ?? '' })
    setFormOpen(true)
  }
  function handleSave() {
    if (!draft.name.trim() || !draft.checkIn) return show('請輸入飯店名稱與入住時間', 'error')
    const clean: AccommodationDraft = { ...draft, name: draft.name.trim() }
    if (editingId) { updateAccommodation(editingId, clean); show('住宿已更新', 'success') } else { addAccommodation(clean); show('住宿已新增', 'success') }
    setFormOpen(false)
  }

  if (loading) return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>

  const sorted = [...accommodations].sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">住宿資訊</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">飯店地址與訂房編號</p>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {sorted.length === 0 ? (
          <EmptyState icon={<span className="text-4xl">🏨</span>} title="還沒有住宿資訊" description="點右下角按鈕新增飯店吧" />
        ) : (
          sorted.map((a) => (
            <Card key={a.id} className="!p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BedDouble size={16} className="text-wood" />
                  <p className="text-[15px] text-ink dark:text-cream-soft">{a.name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a.id)} className="text-warmgray/60 active:text-ink dark:text-warmgray-light/60"><Pencil size={15} /></button>
                  <button onClick={() => removeAccommodation(a.id)} className="text-warmgray/60 active:text-apricot"><Trash2 size={15} /></button>
                </div>
              </div>
              {a.address && <p className="mt-1 text-[12px] text-warmgray dark:text-warmgray-light">{a.address}</p>}
              <div className="mt-3 flex items-center justify-between text-[12px] text-ink dark:text-cream-soft">
                <span>入住 {a.checkIn ? new Date(a.checkIn).toLocaleString('zh-Hant-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                <span>退房 {a.checkOut ? new Date(a.checkOut).toLocaleString('zh-Hant-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
              {(a.bookingSite || a.bookingNumber) && (
                <p className="mt-1.5 text-[11px] text-warmgray dark:text-warmgray-light">
                  {a.bookingSite}{a.bookingSite && a.bookingNumber ? '・' : ''}{a.bookingNumber && `訂房編號 ${a.bookingNumber}`}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                {a.googleMapsUrl && (
                  <a href={a.googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-pill bg-sage-light/40 px-3 py-1.5 text-[12px] text-sage-dark active:bg-sage-light/70 dark:bg-sage-dark/20 dark:text-sage-light">
                    <Navigation size={12} /> 導航
                  </a>
                )}
                {a.phone && (
                  <a href={`tel:${a.phone}`} className="flex items-center gap-1 rounded-pill bg-mist-light/40 px-3 py-1.5 text-[12px] text-mist dark:bg-mist/20">
                    <Phone size={12} /> {a.phone}
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增住宿" onClick={openAdd} />

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? '編輯住宿' : '新增住宿'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">飯店名稱 *</label>
            <input autoFocus value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="例如：淺草View飯店" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">地址</label>
            <input value={draft.address} onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">入住時間 *</label>
              <input type="datetime-local" value={draft.checkIn} onChange={(e) => setDraft((p) => ({ ...p, checkIn: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">退房時間</label>
              <input type="datetime-local" value={draft.checkOut} onChange={(e) => setDraft((p) => ({ ...p, checkOut: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">訂房網站</label>
              <input value={draft.bookingSite} onChange={(e) => setDraft((p) => ({ ...p, bookingSite: e.target.value }))} placeholder="Booking.com" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">訂房編號</label>
              <input value={draft.bookingNumber} onChange={(e) => setDraft((p) => ({ ...p, bookingNumber: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">Google Maps 連結</label>
            <input value={draft.googleMapsUrl} onChange={(e) => setDraft((p) => ({ ...p, googleMapsUrl: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">電話</label>
            <input value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">備註</label>
            <input value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">{editingId ? '儲存修改' : '加入住宿'}</button>
        </div>
      </BottomSheet>
    </div>
  )
}
