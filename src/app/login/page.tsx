'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  username: z.string().min(3, 'Username required'),
  password: z.string().min(4, 'Password required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      // authApi.login calls the Next.js BFF route which sets httpOnly cookies.
      // It returns only non-sensitive user info (no tokens).
      const user = await authApi.login(data.username, data.password)
      setAuth(user)

      const isAdmin = !['PLAYER', 'USER'].includes(user.role)
      router.push(isAdmin ? '/admin' : '/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2025' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            B
          </div>
          <h1 className="text-xl font-bold text-tx-primary">BetPlatform</h1>
          <p className="text-xs text-tx-muted mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">Username</label>
              <input
                {...register('username')}
                placeholder="Enter username"
                className="input"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-[11px] text-loss mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="input pr-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-loss mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-tx-muted mt-4">
          Bet responsibly. Must be 18+.
        </p>
      </div>
    </div>
  )
}
