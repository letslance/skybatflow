'use client'

/**
 * Transaction code display page.
 *
 * Shown exactly once after account activation. Displays the system-generated
 * 6-digit transaction code which acts as 2FA for sensitive operations
 * (withdrawals, large bets, etc.).
 *
 * The backend stores a bcrypt hash of this code — it cannot be recovered.
 * If the user loses it, an admin must reset the password to trigger a new one.
 *
 * The code is passed via the URL `?code=` param (set by the /activate page after
 * successful activation). If no code param is present, the page shows a fallback.
 */

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ShieldCheck, AlertTriangle, Copy, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

function TransactionCodeContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const code         = searchParams.get('code') ?? ''

  // Split code into individual digits for display
  const digits = code.replace(/\D/g, '').split('')

  function copyCode() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Transaction code copied')
    })
  }

  function goToLogin() {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2025' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
               style={{ background: '#126e51' }}>
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-tx-primary">Account Activated!</h1>
          <p className="text-xs text-tx-muted mt-1">
            Your account is now active. Save your transaction code.
          </p>
        </div>

        <div className="card p-6">

          {code && digits.length === 6 ? (
            <>
              {/* Code display */}
              <p className="text-xs text-tx-secondary text-center mb-3">
                Your Transaction Code
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {digits.map((d, i) => (
                  <div
                    key={i}
                    className="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                    style={{ background: '#0d1a15', border: '2px solid #126e51', color: '#03b37f' }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium mb-4"
                style={{ background: '#0d1a15', border: '1px solid #2a3f35', color: '#7fc9a8' }}
              >
                <Copy size={13} />
                Copy Code
              </button>
            </>
          ) : (
            /* Fallback if code param is missing */
            <div className="text-center py-2 mb-4">
              <p className="text-xs text-tx-muted">
                No code available. Please contact your administrator.
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg px-4 py-3 mb-5 text-xs flex gap-2 items-start"
               style={{ background: '#2a1a0e', border: '1px solid #7c4a1a', color: '#e0a060' }}>
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">Save this code now.</strong> It will not be shown again.
              You will need it for withdrawals and other sensitive operations.
              If you lose it, ask your administrator to reset your password.
            </span>
          </div>

          <button
            type="button"
            onClick={goToLogin}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
          >
            <LogIn size={15} />
            Go to Login
          </button>
        </div>

        <p className="text-center text-[11px] text-tx-muted mt-4">
          Use your new password to log in.
        </p>
      </div>
    </div>
  )
}

export default function TransactionCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2025' }}>
        <div className="text-tx-muted text-sm">Loading...</div>
      </div>
    }>
      <TransactionCodeContent />
    </Suspense>
  )
}
