'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Menu definition ──────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href?: string
  icon: string          // CSS class: "bx bx-home-circle" | "mdi mdi-cards-playing-outline"
  badge?: string
  children?: { label: string; href: string }[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',           href: '/admin',                  icon: 'bx bx-home-circle' },
  { label: 'Market Analysis',     href: '/admin/markets',           icon: 'bx bxs-bar-chart-alt-2' },
  { label: 'Multi Login Account', href: '/admin/accounts/active',   icon: 'bx bx-user-plus' },
  {
    label: 'Account',
    icon: 'bx bx-user-circle',
    children: [
      { label: 'Account List For Active Users', href: '/admin/accounts/active' },
      { label: 'Account List',                  href: '/admin/accounts' },
      { label: 'Create Account',                href: '/admin/accounts/create' },
    ],
  },
  { label: 'Assign Agent',   href: '/admin/assign-agent', icon: 'bx bx-user' },
  { label: 'Bank',           href: '/admin/bank',          icon: 'bx bxs-bank' },
  {
    label: 'Reports',
    icon: 'bx bx-file',
    children: [
      { label: 'Account Statement',    href: '/admin/reports/statement' },
      { label: 'Party Win Loss',       href: '/admin/reports/pnl' },
      { label: 'Current Bets',         href: '/admin/bets/open' },
      { label: 'User History',         href: '/admin/reports/user-history' },
      { label: 'General Lock',         href: '/admin/settings/userlock' },
      { label: 'Our Casino Result',    href: '/admin/reports/casino-result' },
      { label: 'Live Casino Result',   href: '/admin/reports/live-casino' },
      { label: 'Sportbook Report',     href: '/admin/reports/sportbook' },
      { label: 'Turn Over',            href: '/admin/reports/turnover' },
      { label: 'User Authentication',  href: '/admin/reports/auth-list' },
      { label: 'Fraud Report',         href: '/admin/reports/fraud' },
      { label: 'User Register Detail', href: '/admin/reports/user-register' },
      { label: 'Total Profit Loss',    href: '/admin/reports/total-pnl' },
      { label: 'User Win Loss',        href: '/admin/reports/user-winloss' },
    ],
  },
  { label: 'Our Casino',     href: '/admin/casino',         icon: 'mdi mdi-cards-playing-outline' },
  { label: 'Vip Casino',     href: '/admin/casino/vip',     icon: 'mdi mdi-cards-playing-outline', badge: 'New' },
  { label: 'Virtual Casino', href: '/admin/casino/virtual', icon: 'mdi mdi-cards-playing-outline', badge: 'New' },
  { label: 'Premium Casino', href: '/admin/casino/premium', icon: 'mdi mdi-cards-playing-outline', badge: 'New' },
  { label: 'Tembo Casino',   href: '/admin/casino/tembo',   icon: 'mdi mdi-cards-playing-outline', badge: 'New' },
  {
    label: 'Events',
    icon: 'bx bxs-calendar-event',
    children: [
      { label: 'Cricket',      href: '/admin/events/cricket' },
      { label: 'Football',     href: '/admin/events/football' },
      { label: 'Tennis',       href: '/admin/events/tennis' },
      { label: 'Horse Racing', href: '/admin/events/horse-racing' },
    ],
  },
  { label: 'Set Button',       href: '/admin/settings/setbutton', icon: 'bx bx-cog' },
  { label: 'Change Password',  href: '/admin/change-password',    icon: 'bx bx-lock-open' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    try { await authApi.logout() } catch { /* */ }
    logout()
    router.push('/admin/login')
  }

  return (
    <aside
      style={{ gridArea: 'sidebar', width: 240 }}
      className="bg-bg-sidebar flex flex-col h-screen sticky top-0 z-[100] border-r border-bg-body"
    >
      {/* Brand box */}
      <div className="bg-bg-body px-4 flex items-center h-[60px] flex-shrink-0 border-b border-[#2a3038]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-black text-md">
            B
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BetPlatform</span>
        </div>
      </div>

      {/* Scrollable nav */}
      <div
        id="sidebar-menu"
        className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 sidebar-scroll"
      >
        <ul className="list-none p-0 m-0">
          {NAV.map(item => (
            <SideNavItem key={item.label} item={item} pathname={pathname} />
          ))}
        </ul>
      </div>

      {/* User info + logout */}
      <div className="border-t border-bg-body flex-shrink-0">
        {user && (
          <div className="px-5 pt-2 pb-1">
            <div className="text-tx-secondary font-semibold text-sm">{user.username}</div>
            <div className="text-tx-muted text-2xs uppercase tracking-wide">{user.role}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-5 py-2.5 bg-transparent border-none text-loss text-base cursor-pointer hover:bg-bg-hover transition-colors"
        >
          <i className="bx bx-log-out text-md" />
          Logout
        </button>
      </div>
    </aside>
  )
}

// ─── Individual nav item ──────────────────────────────────────────────────────
function SideNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isLeafActive = item.href
    ? (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
    : false
  const childActive = item.children?.some(c => pathname.startsWith(c.href)) ?? false
  const active      = isLeafActive || childActive

  const [open, setOpen] = useState(childActive)

  const linkCls = cn(
    'flex items-center gap-2 px-4 py-2.5 text-base w-full border-none cursor-pointer transition-colors duration-150 text-left font-[inherit] no-underline',
    'border-l-[3px]',
    active
      ? 'text-white bg-primary/10 border-l-primary'
      : 'text-tx-secondary bg-transparent border-l-transparent hover:text-tx-primary hover:bg-bg-hover'
  )

  if (item.children) {
    return (
      <li>
        <button onClick={() => setOpen(v => !v)} className={linkCls}>
          <i className={cn(item.icon, 'text-md min-w-[20px] flex-shrink-0')} />
          <span className="flex-1">{item.label}</span>
          <i className={cn('text-[10px] opacity-50', open ? 'fas fa-angle-down' : 'fas fa-angle-right')} />
        </button>
        <ul className={`sub-menu${open ? ' open' : ''}`}>
          {item.children.map(c => {
            const cActive = pathname === c.href || pathname.startsWith(c.href + '/')
            return (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={cn(
                    'block py-2 pl-[46px] pr-4 text-sm no-underline border-l-[3px] transition-colors duration-150',
                    cActive
                      ? 'text-primary border-l-primary'
                      : 'text-[#8a96a3] border-l-transparent hover:text-tx-secondary'
                  )}
                >
                  {c.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }

  return (
    <li>
      <Link href={item.href!} className={linkCls}>
        <i className={cn(item.icon, 'text-md min-w-[20px] flex-shrink-0')} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="bg-primary/70 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}
