import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, QrCode } from 'lucide-react'
import { useTickets, type TicketDraft } from '@/hooks/useTickets'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FAB } from '@/components/ui/FAB'
import { BottomSheet } from '@/components/feedback/BottomSheet'
import { useToast } from '@/components/feedback/Toast'
import type { TicketType } from '@/types'

const TICKET_TYPE_META: Record<TicketType, { label: string; emoji: string }> = {
  suica: { label: 'Suica', emoji: '💳' },
  icoca: { label: 'ICOCA', emoji: '💳' },
  jrpass: { label: 'JR Pass', emoji: '🚄' },
  metropass: { label: '地鐵 Pass', emoji: '🚇' },
  airportbus: { label: '機場巴士', emoji: '🚌' },
  shinkansen: { label: '新幹線', emoji: '🚅' },
  other: { label: '其他', emoji: '🎫' },
}
const TYPE_OPTIONS = Object.entries(TICKET_TYPE_META) as [TicketType, { label: string; emoji: string }][]

const EMPTY: TicketDraft = { type: 'suica', name: '', purchaseDate: '', price: undefined, validUntil: '', qrCodeData: '', note: '' }

export default function Tickets() {
  const navigate = useNavigate()
  const { tickets, loading, addTicket, updateTicket, removeTicket } = useTickets()
  const { show } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TicketDraft>(EMPTY)

  function openAdd() {
    setEditingId(null)
    setDraft(EMPTY)
    setFormOpen(true)
  }
  function openEdit(id: string) {
    const t = tickets.find((x) => x.id === id)
    if (!t) return
    setEditingId(id)
    setDraft({ type: t.type, name: t.name, purchaseDate: t.purchaseDate ?? '', price: t.price, validUntil: t.validUntil ?? '', qrCodeData: t.qrCodeData ?? '', note: t.note ?? '' })
    setFormOpen(true)
  }
  function handleSave() {
    if (!draft.name.trim()) return show('請輸入票券名稱', 'error')
    const clean: TicketDraft = { ...draft, name: draft.name.trim(), purchaseDate: draft.purchaseDate || undefined, validUntil: draft.validUntil || undefined, qrCodeData: draft.qrCodeData || undefined, note: draft.note || undefined }
    if (editingId) { updateTicket(editingId, clean); show('票券已更新', 'success') } else { addTicket(clean); show('票券已新增', 'success') }
    setFormOpen(false)
  }

  if (loading) {
    return <div className="mx-auto max-w-lg px-5 pt-[calc(env(safe-area-inset-top)+16px)]"><Skeleton className="h-40 w-full" /></div>
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <header className="flex items-center gap-3 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <button onClick={() => navigate('/more')} aria-label="返回"><ArrowLeft size={20} className="text-ink dark:text-cream-soft" /></button>
        <div>
          <h1 className="font-display text-xl font-medium text-ink dark:text-cream-soft">交通票券</h1>
          <p className="text-[13px] text-warmgray dark:text-warmgray-light">Suica・JR Pass・QR Code</p>
        </div>
      </header>

      <div className="space-y-3 px-5">
        {tickets.length === 0 ? (
          <EmptyState icon={<span className="text-4xl">🎫</span>} title="還沒有加入任何票券" description="點右下角按鈕新增第一張票券吧" />
        ) : (
          tickets.map((t) => (
            <Card key={t.id} className="!p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TICKET_TYPE_META[t.type].emoji}</span>
                  <div>
                    <p className="text-[15px] text-ink dark:text-cream-soft">{t.name}</p>
                    <p className="text-[11px] text-warmgray dark:text-warmgray-light">{TICKET_TYPE_META[t.type].label}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t.id)} className="text-warmgray/60 active:text-ink dark:text-warmgray-light/60"><Pencil size={15} /></button>
                  <button onClick={() => removeTicket(t.id)} className="text-warmgray/60 active:text-apricot"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-warmgray dark:text-warmgray-light">
                {t.purchaseDate && <p>購買日：{t.purchaseDate}</p>}
                {t.validUntil && <p>期限：{t.validUntil}</p>}
                {t.price != null && <p>價格：¥{t.price.toLocaleString()}</p>}
              </div>
              {t.qrCodeData && (
                <div className="mt-3 flex items-center gap-3 rounded-soft bg-cream-soft px-3 py-2.5 dark:bg-dusk-bg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(t.qrCodeData)}`}
                    alt="QR Code"
                    className="h-16 w-16 rounded-soft bg-white p-1"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-warmgray dark:text-warmgray-light">
                    <QrCode size={12} /> {t.qrCodeData}
                  </div>
                </div>
              )}
              {t.note && <p className="mt-2 text-[12px] text-ink/70 dark:text-cream-soft/70">{t.note}</p>}
            </Card>
          ))
        )}
      </div>

      <FAB icon={<Plus size={24} />} label="新增票券" onClick={openAdd} />

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? '編輯票券' : '新增票券'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">票券類型</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(([key, meta]) => (
                <button key={key} onClick={() => setDraft((p) => ({ ...p, type: key }))} className={`rounded-pill px-3 py-1.5 text-[12px] ${draft.type === key ? 'bg-sage text-cream-card' : 'bg-cream text-warmgray dark:bg-dusk-bg dark:text-warmgray-light'}`}>
                  {meta.emoji} {meta.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">名稱 *</label>
            <input autoFocus value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="例如：西瓜卡" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">購買日期</label>
              <input type="date" value={draft.purchaseDate ?? ''} onChange={(e) => setDraft((p) => ({ ...p, purchaseDate: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">有效期限</label>
              <input type="date" value={draft.validUntil ?? ''} onChange={(e) => setDraft((p) => ({ ...p, validUntil: e.target.value }))} className="w-full rounded-soft border border-khaki/60 bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">價格（¥）</label>
            <input type="number" inputMode="numeric" value={draft.price ?? ''} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">QR Code 內容（選填，會自動產生 QR 圖）</label>
            <input value={draft.qrCodeData ?? ''} onChange={(e) => setDraft((p) => ({ ...p, qrCodeData: e.target.value }))} placeholder="貼上票券代碼或連結" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">備註</label>
            <input value={draft.note ?? ''} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="選填" className="w-full rounded-soft border border-khaki/60 bg-cream px-4 py-3 text-[14px] text-ink outline-none focus:border-sage dark:border-dusk-border dark:bg-dusk-bg dark:text-cream-soft" />
          </div>
          <button onClick={handleSave} className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark">{editingId ? '儲存修改' : '加入票券'}</button>
        </div>
      </BottomSheet>
    </div>
  )
}
