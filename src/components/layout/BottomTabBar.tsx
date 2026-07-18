import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, CalendarDays, Wallet, Luggage, MapPin, Menu } from 'lucide-react'

const TABS = [
  { to: '/', label: '首頁', icon: Home },
  { to: '/itinerary', label: '行程', icon: CalendarDays },
  { to: '/expenses', label: '花費', icon: Wallet },
  { to: '/packing', label: '行李', icon: Luggage },
  { to: '/map', label: '地圖', icon: MapPin },
  { to: '/more', label: '更多', icon: Menu },
]

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom border-t border-khaki/60 bg-cream-card/90 backdrop-blur-lg dark:border-dusk-border dark:bg-dusk-card/90"
      aria-label="主要導覽"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className="group relative flex flex-col items-center gap-1 py-2.5 outline-none"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-sage dark:bg-sage-light"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className={
                      isActive
                        ? 'text-sage-dark dark:text-sage-light'
                        : 'text-warmgray group-active:scale-90 transition-transform dark:text-warmgray-light'
                    }
                  />
                  <span
                    className={`text-[11px] font-body ${
                      isActive
                        ? 'font-medium text-sage-dark dark:text-sage-light'
                        : 'text-warmgray dark:text-warmgray-light'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
