import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
}

const THRESHOLD = 64
const MAX_PULL = 96

/** 下拉重新整理容器。需搭配可捲動的頁面使用，滾動位置在最上方時才會觸發拉動手勢。 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (refreshing) return
    const scrollTop = containerRef.current?.scrollTop ?? window.scrollY
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startY.current === null || refreshing) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) {
      setPull(Math.min(delta * 0.5, MAX_PULL))
    }
  }

  async function handleTouchEnd() {
    if (startY.current === null) return
    startY.current = null
    if (pull >= THRESHOLD) {
      setRefreshing(true)
      setPull(THRESHOLD)
      await onRefresh()
      setRefreshing(false)
    }
    setPull(0)
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div
        className="pointer-events-none absolute left-0 right-0 flex justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pull, top: 0 }}
      >
        <motion.div
          animate={{ rotate: refreshing ? 360 : (pull / MAX_PULL) * 180 }}
          transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
          className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream-card text-sage-dark shadow-card dark:bg-dusk-card dark:text-sage-light"
        >
          <RefreshCw size={16} />
        </motion.div>
      </div>
      <motion.div animate={{ y: pull }} transition={{ duration: refreshing ? 0.2 : 0 }}>
        {children}
      </motion.div>
    </div>
  )
}
