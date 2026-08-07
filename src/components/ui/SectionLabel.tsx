interface SectionLabelProps {
  children: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function SectionLabel({ children, icon, action }: SectionLabelProps) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5 text-ink/80 dark:text-cream-soft/85">
        {icon}
        <h2 className="font-display text-[15px] font-medium tracking-wide">{children}</h2>
      </div>
      {action}
    </div>
  )
}
