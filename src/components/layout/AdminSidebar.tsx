'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Landmark, BarChart3, Settings,
  TrendingUp, Gamepad2, LogOut, ChevronDown, ChevronRight, Gift
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
  roles?: string[]
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/admin',           icon: <LayoutDashboard size={15} /> },
  {
    label: 'Accounts',
    icon: <Users size={15} />,
    children: [
      { label: 'Account List',     href: '/admin/accounts' },
      { label: 'Active Users',     href: '/admin/accounts/active' },
      { label: 'Create Account',   href: '/admin/accounts/create' },
    ],
  },
  {
    label: 'Markets',
    icon: <Landmark size={15} />,
    children: [
      { label: 'Events',   href: '/admin/markets' },
      { label: 'Fancy',    href: '/admin/markets/fancy' },
      { label: 'Results',  href: '/admin/markets/results' },
    ],
  },
  {
    label: 'Betting',
    icon: <TrendingUp size={15} />,
    children: [
      { label: 'All Bets',     href: '/admin/bets' },
      { label: 'Open Bets',    href: '/admin/bets/open' },
      { label: 'Bet History',  href: '/admin/bets/history' },
    ],
  },
  { label: 'Casino',      href: '/admin/casino',    icon: <Gamepad2 size={15} /> },
  {
    label: 'Reports',
    icon: <BarChart3 size={15} />,
    children: [
      { label: 'P&L Report',      href: '/admin/reports/pnl' },
      { label: 'Commission',      href: '/admin/reports/commission' },
      { label: 'Wallet',          href: '/admin/reports/wallet' },
      { label: 'Account Statement', href: '/admin/reports/statement' },
      { label: 'Party Win/Loss',  href: '/admin/reports/party-wl' },
      { label: 'Turnover',        href: '/admin/reports/turnover' },
      { label: 'GGR Report',      href: '/admin/reports/ggr' },
      { label: 'User History',    href: '/admin/reports/user-history' },
    ],
  },
  {
    label: 'Bonus',
    icon: <Gift size={15} />,
    children: [
      { label: 'All Bonuses',    href: '/admin/bonus' },
      { label: 'Create Bonus',   href: '/admin/bonus/create' },
    ],
  },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={15} />, roles: ['SUPERADMIN', 'ADMIN'] },
]

function AdminNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(() => item.children?.some(c => pathname.startsWith(c.href)) ?? false)
  const isActive = item.href ? pathname === item.href : false

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-tx-secondary hover:bg-bg-hover hover:text-tx-primary rounded transition-colors"
        >
          <span className="flex items-center gap-2">{item.icon} {item.label}</span>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {open && (
          <div className="pl-6 mt-0.5 flex flex-col gap-0.5">
            {item.children.map(c => (
              <Link
                key={c.href}
                href={c.href}
                className={cn(
                  'block px-3 py-1.5 text-[11px] rounded transition-colors',
                  pathname === c.href
                    ? 'bg-primary/15 text-primary'
                    : 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary'
                )}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded transition-colors',
        isActive ? 'bg-primary/15 text-primary' : 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary'
      )}
    >
      {item.icon} {item.label}
    </Link>
  )
}

export default function AdminSidebar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  async function handleLogout() {
    try { await authApi.logout() } catch { /* */ }
    logout()
    router.push('/admin/login')
  }

  return (
    <aside
      className="flex flex-col border-r border-[#3a444c] overflow-y-auto"
      style={{ gridArea: 'sidebar', background: '#1a2025', width: 240 }}
    >
      {/* Logo */}
      <div className="h-[var(--header-height)] flex items-center px-4 border-b border-[#3a444c]">
        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-bold text-xs mr-2">B</div>
        <div>
          <div className="text-sm font-bold text-tx-primary">BetPlatform</div>
          <div className="text-[10px] text-tx-muted">Admin Panel</div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-3 py-2 border-b border-[#3a444c]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-tx-primary">{user.username}</div>
              <div className="text-[10px] text-primary font-medium">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        <div className="section-title">Navigation</div>
        {ADMIN_NAV.map(item => (
          <AdminNavLink key={item.label} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-[#3a444c]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-loss hover:bg-bg-hover rounded transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  )
}
