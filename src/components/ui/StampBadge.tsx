interface StampBadgeProps {
  label: string
  sub?: string
  colorClass?: string
}

/** 護照印章風格徽章，用於 Day 標記 / 成就徽章等，呼應旅行手帳意象 */
export function StampBadge({ label, sub, colorClass = 'border-sage text-sage-dark dark:text-sage-light' }: StampBadgeProps) {
  return (
    <div
      className={`flex h-16 w-16 -rotate-6 flex-col items-center justify-center rounded-full border-[1.5px] border-dashed ${colorClass} animate-stamp-in`}
    >
      <span className="font-display text-[11px] font-semibold leading-none tracking-wider">{label}</span>
      {sub && <span className="mt-0.5 text-[9px] leading-none opacity-80">{sub}</span>}
    </div>
  )
}
