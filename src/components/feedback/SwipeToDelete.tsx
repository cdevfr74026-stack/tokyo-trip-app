import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface SwipeToDeleteProps {
  onDelete: () => void
  children: ReactNode
}

/** 向左滑動即可刪除的手勢包裝元件，用於清單列項目 */
export function SwipeToDelete({ onDelete, children }: SwipeToDeleteProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-16 items-center justify-center bg-apricot text-cream-card">
        <Trash2 size={16} />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -64, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.x < -48) onDelete()
        }}
        className="relative z-10 bg-cream-card dark:bg-dusk-card"
      >
        {children}
      </motion.div>
    </div>
  )
}
