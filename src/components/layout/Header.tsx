'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Bell, ChevronDown, LogOut, User, Wallet, Settings } from 'lucide-react'
import { useAuthStore, useBalanceStore, useSidebarStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { balance } = useBalanceStore()
  const { toggle } = useSidebarStore()
  const router = useRouter()
  const [dropOpen, setDropOpen] = useState(false)

  async function handleLogout() {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    router.push('/login')
  }

  const isAdmin = user && !['USER'].includes(user.role)

  return (
    <header
      className="flex items-center justify-between px-4 border-b border-[#3a444c] z-30"
      style={{ gridArea: 'header', height: 'var(--header-height)', background: '#1a2025' }}
    >
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-1.5 rounded hover:bg-bg-hover text-tx-secondary hover:text-tx-primary transition-colors"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">
            B
          </div>
          <span className="font-bold text-sm text-tx-primary hidden sm:block">BetPlatform</span>
        </Link>
      </div>

      {/* Right: balance + user */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Balances */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="text-tx-muted">Main</div>
              <div className="font-semibold text-tx-primary">
                ₹{formatCurrency(balance?.main ?? 0)}
              </div>
            </div>
            {!isAdmin && (
              <>
                <div className="text-center">
                  <div className="text-tx-muted">Casino</div>
                  <div className="font-semibold text-tx-primary">
                    ₹{formatCurrency(balance?.casino ?? 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-tx-muted">Exposure</div>
                  <div className="font-semibold text-loss">
                    ({formatCurrency(balance?.exposure ?? 0)})
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="p-1.5 rounded hover:bg-bg-hover text-tx-secondary hover:text-tx-primary transition-colors relative">
            <Bell size={16} />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-hover transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-xs font-medium text-tx-primary hidden sm:block">{user.username}</span>
              <span className="text-[9px] text-tx-muted hidden sm:block">{user.role}</span>
              <ChevronDown size={12} className="text-tx-muted" />
            </button>

            {dropOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-bg-card border border-[#3a444c] rounded shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-[#3a444c]">
                    <div className="text-xs font-semibold text-tx-primary">{user.username}</div>
                    <div className="text-[10px] text-tx-muted">{user.role}</div>
                  </div>

                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-xs text-tx-secondary hover:bg-bg-hover hover:text-tx-primary" onClick={() => setDropOpen(false)}>
                    <User size={13} /> My Profile
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-2 px-3 py-2 text-xs text-tx-secondary hover:bg-bg-hover hover:text-tx-primary" onClick={() => setDropOpen(false)}>
                    <Wallet size={13} /> Wallet
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-tx-secondary hover:bg-bg-hover hover:text-tx-primary" onClick={() => setDropOpen(false)}>
                    <Settings size={13} /> Settings
                  </Link>

                  <div className="border-t border-[#3a444c] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-loss hover:bg-bg-hover text-left"
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
