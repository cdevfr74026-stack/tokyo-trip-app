import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('請輸入帳號與密碼')
      return
    }
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ''
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setError('帳號或密碼不正確')
      } else if (code.includes('too-many-requests')) {
        setError('嘗試次數過多，請稍後再試')
      } else {
        setError('登入失敗，請檢查網路連線後再試一次')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 paper-texture dark:bg-dusk-bg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">✈️</div>
          <h1 className="font-display text-2xl font-medium text-ink dark:text-cream-soft">旅行手帳</h1>
          <p className="mt-1 text-[13px] text-warmgray dark:text-warmgray-light">東京 7 天 6 夜・輸入密碼繼續</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">帳號</label>
            <div className="flex items-center gap-2 rounded-soft border border-khaki/60 bg-cream-card px-4 py-3 focus-within:border-sage dark:border-dusk-border dark:bg-dusk-card">
              <Mail size={16} className="text-warmgray dark:text-warmgray-light" />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="輸入帳號"
                className="w-full bg-transparent text-[15px] text-ink outline-none dark:text-cream-soft"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-warmgray dark:text-warmgray-light">密碼</label>
            <div className="flex items-center gap-2 rounded-soft border border-khaki/60 bg-cream-card px-4 py-3 focus-within:border-sage dark:border-dusk-border dark:bg-dusk-card">
              <Lock size={16} className="text-warmgray dark:text-warmgray-light" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼"
                className="w-full bg-transparent text-[15px] text-ink outline-none dark:text-cream-soft"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="顯示密碼" className="text-warmgray dark:text-warmgray-light">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-[13px] text-apricot">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-soft bg-sage text-[15px] font-medium text-cream-card active:bg-sage-dark disabled:opacity-60"
          >
            {submitting ? '登入中…' : '登入'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
