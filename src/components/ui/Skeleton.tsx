export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-soft bg-khaki/40 dark:bg-dusk-border ${className}`}
    />
  )
}
