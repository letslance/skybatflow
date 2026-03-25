'use client'

/**
 * Forced activation screen.
 *
 * Shown when admin creates a new account (or resets a password).
 * The user arrives here with a short-lived fpc JWT in the access_token cookie.
 * They must set a new password before the account becomes active.
 *
 * On success: the backend generates a 6-digit transaction code, expires all sessions,
 * and returns the code once. We forward the user to /transaction-code to display it.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/lib/api'
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(d => d.newPassword !== d.currentPassword, {
  message: 'New password must differ from the temporary password',
  path: ['newPassword'],
})

type FormData = z.infer<typeof schema>

export default function ActivatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew,     setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const result = await authApi.activate(data.currentPassword, data.newPassword)
      // Pass the one-time code via URL — backend will never return it again.
      router.push(`/transaction-code?code=${encodeURIComponent(result.transactionCode)}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message
             || err?.response?.data?.error
             || 'Activation failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2025' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
               style={{ background: '#126e51' }}>
            <KeyRound size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-tx-primary">Activate Account</h1>
          <p className="text-xs text-tx-muted mt-1 px-4">
            Set a new password to activate your account
          </p>
        </div>

        {/* Info banner */}
        <div className="rounded-lg px-4 py-3 mb-4 text-xs flex gap-2 items-start"
             style={{ background: '#1c3a2e', border: '1px solid #126e51', color: '#7fc9a8' }}>
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          <span>
            Your administrator set a temporary password for this account.
            Choose a new password to complete activation. You will also receive a
            <strong className="font-semibold"> transaction code</strong> used for sensitive operations.
          </span>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Current password */}
            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <input
                  {...register('currentPassword')}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter temporary password"
                  className="input pr-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] text-loss mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="input pr-9"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-loss mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="input pr-9"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-loss mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Activating...' : 'Activate Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-tx-muted mt-4">
          Having trouble? Contact your administrator.
        </p>
      </div>
    </div>
  )
}
