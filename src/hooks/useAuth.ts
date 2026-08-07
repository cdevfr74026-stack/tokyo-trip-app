import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const AUTH_ENABLED = import.meta.env.VITE_USE_FIREBASE === 'true'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(AUTH_ENABLED)

  useEffect(() => {
    if (!AUTH_ENABLED) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return {
    // 如果沒有啟用 Firebase（本機模式），視為一律已登入，不擋畫面
    isAuthenticated: AUTH_ENABLED ? !!user : true,
    authEnabled: AUTH_ENABLED,
    user,
    loading,
    signIn,
    signOut,
  }
}
