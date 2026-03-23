'use client'

import UserLayout from '@/components/layout/UserLayout'
import BetSlip from '@/components/betting/BetSlip'
import { useAuthStore, useBalanceStore } from '@/lib/store'
import { walletApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { connectWebSocket, disconnectWebSocket, subscribeBetUpdates, type BetSettledNotification } from '@/lib/websocket'

export default function UserRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore()
  const { setBalance, clearBalance } = useBalanceStore()
  const router = useRouter()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.replace('/login')
      return
    }

    // Fetch authoritative balance from wallet-service on session start
    walletApi.balance().then(setBalance).catch(() => { /* non-critical */ })

    connectWebSocket()

    // Subscribe to personal bet settlement notifications
    const unsubBets = subscribeBetUpdates(user.id, (event: BetSettledNotification) => {
      // Show result toast
      const resultLabel = event.result === 'WON'
        ? `Won ₹${event.payout.toLocaleString('en-IN')}`
        : event.result === 'VOID' ? 'Bet Void — refunded' : 'Bet Lost'

      if (event.result === 'WON') {
        toast.success(`${event.runnerName} — ${resultLabel}`, { duration: 6000 })
      } else if (event.result === 'VOID') {
        toast(`${event.runnerName} — ${resultLabel}`, { duration: 4000 })
      } else {
        toast.error(`${event.runnerName} — ${resultLabel}`, { duration: 4000 })
      }

      // Refresh balance from wallet-service after any settlement (WON credits, VOID refunds)
      if (event.result !== 'LOST') {
        walletApi.balance().then(setBalance).catch(() => { /* non-critical */ })
      }
    })

    return () => {
      unsubBets()
      disconnectWebSocket()
      clearBalance()
    }
  }, [user, _hasHydrated])

  if (!_hasHydrated || !user) return null

  return (
    <UserLayout>
      {children}
      <BetSlip />
    </UserLayout>
  )
}
