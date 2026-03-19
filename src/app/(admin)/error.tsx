'use client'

import { useEffect } from 'react'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-loss font-semibold mb-2">Something went wrong</p>
        <p className="text-tx-muted text-xs mb-4">{error.message || 'An unexpected error occurred.'}</p>
        <button className="btn-primary btn-sm" onClick={reset}>Try again</button>
      </div>
    </div>
  )
}
