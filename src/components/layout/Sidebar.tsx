'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Tv2, Flame, Trophy, Gamepad2, Wallet, FileText,
  ChevronRight, ChevronDown, Star, LogOut
} from 'lucide-react'
import { useState } from 'react'
import { useSidebarStore, useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: NavItem[]
  badge?: string
}

const NAV: NavItem[] = [
  { label: 'Home',       href: '/',        icon: <Home size={14} /> },
  { label: 'In-Play',    href: '/inplay',  icon: <Flame size={14} />, badge: 'LIVE' },
  {
    label: 'Sports',
    icon: <Trophy size={14} />,
    children: [
      { label: 'Cricket',     href: '/sports/cricket' },
      { label: 'Football',    href: '/sports/football' },
      { label: 'Tennis',      href: '/sports/tennis' },
      { label: 'Horse Racing', href: '/sports/horse-racing' },
      { label: 'Kabaddi',     href: '/sports/kabaddi' },
    ],
  },
  { label: 'Live TV',    href: '/live-tv', icon: <Tv2 size={14} /> },
  { label: 'Casino',     href: '/casino',  icon: <Gamepad2 size={14} /> },
  {
    label: 'My Account',
    icon: <Star size={14} />,
    children: [
      { label: 'Open Bets',    href: '/my-bets/open' },
      { label: 'Bet History',  href: '/my-bets' },
      { label: 'Casino History', href: '/casino/history' },
    ],
  },
  { label: 'Wallet',     href: '/wallet',  icon: <Wallet size={14} /> },
  { label: 'Statement',  href: '/statement', icon: <FileText size={14} /> },
]

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'nav-link w-full justify-between',
            depth > 0 && 'pl-6 text-[11px]'
          )}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </span>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {open && (
          <div className="pl-2">
            {item.children!.map(child => (
              <NavLink key={child.label} item={child} depth={depth + 1} />
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
        'nav-link justify-between',
        isActive && 'active',
        depth > 0 && 'pl-7 text-[11px]'
      )}
    >
      <span className="flex items-center gap-2">
        {item.icon}
        {item.label}
      </span>
      {item.badge && (
        <span className="text-[8px] font-bold bg-loss text-white px-1 rounded">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar() {
  const { collapsed } = useSidebarStore()
  const { logout } = useAuthStore()
  const router = useRouter()

  async function handleLogout() {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'bg-bg-input overflow-y-auto overflow-x-hidden transition-all duration-200 border-r border-[#3a444c]',
        'flex flex-col',
        collapsed ? 'w-0' : 'w-[var(--sidebar-width)]'
      )}
      style={{ gridArea: 'sidebar' }}
    >
      {!collapsed && (
        <>
          <nav className="flex-1 p-2 flex flex-col gap-0.5">
            <div className="section-title">Menu</div>
            {NAV.map(item => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          <div className="p-2 border-t border-[#3a444c]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-loss hover:bg-bg-hover rounded transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
