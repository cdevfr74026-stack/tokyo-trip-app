import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { PageTransition } from '@/components/layout/PageTransition'
import { ToastProvider } from '@/components/feedback/Toast'
import Dashboard from '@/pages/Dashboard'
import Itinerary from '@/pages/Itinerary'
import Expenses from '@/pages/Expenses'
import Packing from '@/pages/Packing'
import MapView from '@/pages/MapView'
import More from '@/pages/More'
import Tickets from '@/pages/Tickets'
import Flights from '@/pages/Flights'
import Accommodations from '@/pages/Accommodations'
import Reminders from '@/pages/Reminders'
import FavoriteSpots from '@/pages/FavoriteSpots'
import Memories from '@/pages/Memories'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/itinerary" element={<PageTransition><Itinerary /></PageTransition>} />
        <Route path="/expenses" element={<PageTransition><Expenses /></PageTransition>} />
        <Route path="/packing" element={<PageTransition><Packing /></PageTransition>} />
        <Route path="/map" element={<PageTransition><MapView /></PageTransition>} />
        <Route path="/more" element={<PageTransition><More /></PageTransition>} />
        <Route path="/tickets" element={<PageTransition><Tickets /></PageTransition>} />
        <Route path="/flights" element={<PageTransition><Flights /></PageTransition>} />
        <Route path="/accommodation" element={<PageTransition><Accommodations /></PageTransition>} />
        <Route path="/reminders" element={<PageTransition><Reminders /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoriteSpots /></PageTransition>} />
        <Route path="/memories" element={<PageTransition><Memories /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <div className="min-h-screen bg-cream paper-texture dark:bg-dusk-bg">
          <AnimatedRoutes />
          <BottomTabBar />
        </div>
      </ToastProvider>
    </HashRouter>
  )
}

export default App
