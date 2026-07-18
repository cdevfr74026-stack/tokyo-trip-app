import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  colorClass?: string
  trackClass?: string
  heightClass?: string
}

export function ProgressBar({
  value,
  colorClass = 'bg-sage',
  trackClass = 'bg-khaki/50 dark:bg-dusk-border',
  heightClass = 'h-2',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const isOver = value > 100
  return (
    <div className={`w-full overflow-hidden rounded-pill ${heightClass} ${trackClass}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-pill ${isOver ? 'bg-apricot' : colorClass}`}
      />
    </div>
  )
}
