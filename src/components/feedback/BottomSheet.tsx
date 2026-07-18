import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
            className="safe-bottom fixed inset-x-0 bottom-0 z-[95] max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] bg-cream-card px-5 pb-6 pt-3 shadow-lift dark:bg-dusk-card"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-khaki dark:bg-dusk-border" />
            {title && <h3 className="mb-4 font-display text-lg font-medium text-ink dark:text-cream-soft">{title}</h3>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
