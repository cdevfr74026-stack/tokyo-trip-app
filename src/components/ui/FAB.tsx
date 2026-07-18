import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FABProps {
  icon: ReactNode
  onClick?: () => void
  label?: string
}

export function FAB({ icon, onClick, label }: FABProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label ?? '新增'}
      className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-cream-card shadow-lift active:bg-sage-dark dark:bg-sage-dark"
    >
      {icon}
    </motion.button>
  )
}
