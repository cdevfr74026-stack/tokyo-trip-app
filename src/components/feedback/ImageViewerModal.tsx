import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageViewerModalProps {
  open: boolean
  onClose: () => void
  src: string
  title: string
}

const VIEWPORT_SELECTOR = 'meta[name="viewport"]'

/**
 * 全螢幕圖片檢視器，專門給地鐵圖這種「需要放大看清楚站名」的圖片用。
 *
 * App 全域的 viewport 設定關閉了手勢縮放（一般頁面操作起來才會像 App、不會不小心被縮放），
 * 但地圖偏偏需要放大才看得清楚，所以只在這個檢視器打開的當下，暫時把 viewport 設定
 * 改成「允許縮放」，關閉時再還原回去——這樣其他頁面完全不受影響，
 * 使用者可以直接用手指雙指縮放、拖曳查看地圖細節，體驗跟原生相簿看圖一樣直覺。
 */
export function ImageViewerModal({ open, onClose, src, title }: ImageViewerModalProps) {
  useEffect(() => {
    if (!open) return
    const meta = document.querySelector(VIEWPORT_SELECTOR)
    const original = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0, user-scalable=yes')
    return () => {
      if (original) meta?.setAttribute('content', original)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] flex flex-col bg-ink/95 dark:bg-black/95"
        >
          <div className="safe-top flex items-center justify-between px-5 py-3">
            <p className="text-[14px] font-medium text-cream-card">{title}</p>
            <button
              onClick={onClose}
              aria-label="關閉"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-card/15 text-cream-card active:bg-cream-card/25"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto overscroll-contain px-2 pb-6" style={{ touchAction: 'pinch-zoom pan-x pan-y' }}>
            <img src={src} alt={title} className="mx-auto w-full max-w-3xl select-none rounded-soft" draggable={false} />
          </div>
          <p className="safe-bottom pb-2 text-center text-[11px] text-cream-card/60">雙指縮放查看細節，點右上角關閉</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
