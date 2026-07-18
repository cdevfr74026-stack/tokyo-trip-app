import { useCallback, useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { ThemeMode } from '@/types'

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    storage.get<ThemeMode>(STORAGE_KEYS.theme).then((saved) => {
      const initial = saved ?? 'system'
      setMode(initial)
      applyThemeClass(initial)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    applyThemeClass(mode)
    storage.set(STORAGE_KEYS.theme, mode)
  }, [mode, loaded])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (mode === 'system') applyThemeClass('system')
    }
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'light'
      // system -> 依目前實際顯示反向切換
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'light' : 'dark'
    })
  }, [])

  return { mode, setMode, toggle }
}
