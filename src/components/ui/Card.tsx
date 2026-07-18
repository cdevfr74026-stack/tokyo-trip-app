import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, className = '', padded = true, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card bg-cream-card shadow-card dark:bg-dusk-card dark:shadow-none dark:border dark:border-dusk-border ${
        padded ? 'p-5' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
