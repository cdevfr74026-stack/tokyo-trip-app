import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-3 rounded-card bg-cream-card/60 px-6 py-14 text-center dark:bg-dusk-card/60"
    >
      <div className="animate-float-slow text-warmgray/70 dark:text-warmgray-light/70">{icon}</div>
      <p className="font-display text-[15px] text-ink/70 dark:text-cream-soft/80">{title}</p>
      {description && (
        <p className="max-w-[240px] text-[13px] leading-relaxed text-warmgray dark:text-warmgray-light">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  )
}
