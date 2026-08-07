import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { PageTransition } from '@/components/layout/PageTransition'
import { ToastProvider } from '@/components/feedback/Toast'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Itinerary from '@/pages/Itinerary'
import Expenses from '@/pages/Expenses'
import Packing from '@/pages/Packing'
import MustBuy from '@/pages/MustBuy'
import More from '@/pages/More'
import Tickets from '@/pages/Tickets'
import Flights from '@/pages/Flights'
import Accommodations from '@/pages/Accommodations'
import Reminders from '@/pages/Reminders'
import Weather from '@/pages/Weather'
import Converter from '@/pages/Converter'
import Statistics from '@/pages/Statistics'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/itinerary" element={<PageTransition><Itinerary /></PageTransition>} />
        <Route path="/expenses" element={<PageTransition><Expenses /></PageTransition>} />
        <Route path="/packing" element={<PageTransition><Packing /></PageTransition>} />
        <Route path="/mustbuy" element={<PageTransition><MustBuy /></PageTransition>} />
        <Route path="/more" element={<PageTransition><More /></PageTransition>} />
        <Route path="/tickets" element={<PageTransition><Tickets /></PageTransition>} />
        <Route path="/flights" element={<PageTransition><Flights /></PageTransition>} />
        <Route path="/accommodation" element={<PageTransition><Accommodations /></PageTransition>} />
        <Route path="/reminders" element={<PageTransition><Reminders /></PageTransition>} />
        <Route path="/weather" element={<PageTransition><Weather /></PageTransition>} />
        <Route path="/converter" element={<PageTransition><Converter /></PageTransition>} />
        <Route path="/statistics" element={<PageTransition><Statistics /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-dusk-bg">
        <div className="animate-pulse text-3xl">✈️</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

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
