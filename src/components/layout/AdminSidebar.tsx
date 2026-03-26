'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Menu definition ──────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href?: string
  icon: string
  badge?: string
  children?: { label: string; href: string }[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',           href: '/admin',                 icon: 'bx bx-home-circle' },
  { label: 'Market Analysis',     href: '/admin/markets',          icon: 'bx bxs-bar-chart-alt-2' },
  { label: 'Multi Login Account', href: '/admin/accounts/active',  icon: 'bx bx-user-plus' },
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
  { label: 'Set Button',      href: '/admin/settings/setbutton', icon: 'bx bx-cog' },
  { label: 'Change Password', href: '/admin/change-password',    icon: 'bx bx-lock-open' },
]

const SETTINGS_NAV: NavItem[] = [
  {
    label: 'Settings',
    icon: 'bx bx-slider-alt',
    children: [
      { label: 'Global Settings', href: '/admin/settings/global' },
      { label: 'Sport Settings',  href: '/admin/settings/sports' },
    ],
  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onClose,
}: {
  collapsed: boolean    // desktop: false = full 240px, true = 56px icon-only
  mobileOpen: boolean   // mobile: true = drawer visible
  onClose: () => void
}) {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router   = useRouter()

  // Auto-close mobile drawer on route change
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (window.innerWidth < 1024) onClose()
  }, [pathname])

  async function handleLogout() {
    try { await authApi.logout() } catch { /* */ }
    logout()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-bg-sidebar border-r border-bg-body h-screen flex-shrink-0 z-[100]',
          // ── Desktop: always in flex flow, animate between full ↔ icon-only
          'lg:relative lg:translate-x-0 lg:transition-[width] lg:duration-200',
          collapsed ? 'lg:w-14' : 'lg:w-[240px]',
          // ── Mobile: fixed drawer, slide in/out
          'fixed top-0 left-0 w-[240px] transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* ── Brand ─────────────────────────────────────────────────────────── */}
        <div className={cn(
          'bg-bg-body flex items-center h-[60px] flex-shrink-0 border-b border-[#2a3038] overflow-hidden',
          collapsed ? 'lg:justify-center lg:px-0 px-4' : 'px-4',
        )}>
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-black text-md flex-shrink-0">
            B
          </div>
          <span
            id="sidebar-site-title"
            className={cn(
              'text-white font-bold text-lg tracking-tight ml-2 whitespace-nowrap transition-all duration-200',
              collapsed && 'lg:hidden',
            )}
          >
            BetPlatform
          </span>
        </div>

        {/* ── Scrollable nav ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 sidebar-scroll">
          <ul className="list-none p-0 m-0">
            {NAV.map(item => (
              <SideNavItem key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
            ))}

            {['SUPERADMIN', 'ADMIN'].includes(user?.role ?? '') && (
              <>
                {/* Section label — hidden in icon-only mode */}
                <li className={cn('px-5 pt-3 pb-1', collapsed && 'lg:hidden')}>
                  <span className="text-[10px] text-tx-muted uppercase tracking-widest font-semibold">
                    Configuration
                  </span>
                </li>
                {/* Divider shown in icon-only mode instead of label */}
                {collapsed && (
                  <li className="hidden lg:block mx-3 my-1 border-t border-[#2a3038]" />
                )}
                {SETTINGS_NAV.map(item => (
                  <SideNavItem key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
                ))}
              </>
            )}
          </ul>
        </div>

        {/* ── User info + logout ────────────────────────────────────────────── */}
        <div className="border-t border-bg-body flex-shrink-0">
          {user && (
            <div className={cn('px-5 pt-2 pb-1', collapsed && 'lg:hidden')}>
              <div className="text-tx-secondary font-semibold text-sm">{user.username}</div>
              <div className="text-tx-muted text-2xs uppercase tracking-wide">{user.role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className={cn(
              'flex items-center gap-2 w-full px-5 py-2.5 bg-transparent border-none text-loss text-base cursor-pointer hover:bg-bg-hover transition-colors',
              collapsed && 'lg:justify-center lg:px-0',
            )}
          >
            <i className="bx bx-log-out text-md flex-shrink-0" />
            <span className={cn(collapsed && 'lg:hidden')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Individual nav item ──────────────────────────────────────────────────────
function SideNavItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const isLeafActive = item.href
    ? (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
    : false
  const childActive = item.children?.some(c => pathname.startsWith(c.href)) ?? false
  const active = isLeafActive || childActive

  const [open, setOpen] = useState(childActive)

  const baseCls = cn(
    'flex items-center gap-2 w-full border-none cursor-pointer transition-colors duration-150 text-left font-[inherit] no-underline',
    'border-l-[3px] py-2.5',
    // Full mode: normal padding. Icon-only mode: center icon, no left border highlight
    collapsed ? 'lg:justify-center lg:px-0 lg:border-l-transparent px-4' : 'px-4',
    active
      ? 'text-white bg-primary/10 border-l-primary'
      : 'text-tx-secondary bg-transparent border-l-transparent hover:text-tx-primary hover:bg-bg-hover',
  )

  if (item.children) {
    return (
      <li title={collapsed ? item.label : undefined}>
        <button
          onClick={() => { if (!collapsed) setOpen(v => !v) }}
          className={baseCls}
        >
          <i className={cn(item.icon, 'text-md min-w-[20px] flex-shrink-0')} />
          <span className={cn('flex-1 whitespace-nowrap', collapsed && 'lg:hidden')}>{item.label}</span>
          {!collapsed && (
            <i className={cn('text-[10px] opacity-50 lg:block hidden', open ? 'fas fa-angle-down' : 'fas fa-angle-right')} />
          )}
          {/* Always show chevron on mobile */}
          <i className={cn('text-[10px] opacity-50 lg:hidden', open ? 'fas fa-angle-down' : 'fas fa-angle-right')} />
        </button>

        {/* Sub-menu: hidden in icon-only mode on desktop */}
        <ul className={cn(
          `sub-menu${open ? ' open' : ''}`,
          collapsed && 'lg:hidden',
        )}>
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
                      : 'text-[#8a96a3] border-l-transparent hover:text-tx-secondary',
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
    <li title={collapsed ? item.label : undefined}>
      <Link href={item.href!} className={baseCls}>
        <i className={cn(item.icon, 'text-md min-w-[20px] flex-shrink-0')} />
        <span className={cn('flex-1 whitespace-nowrap', collapsed && 'lg:hidden')}>{item.label}</span>
        {item.badge && !collapsed && (
          <span className="bg-primary/70 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold lg:inline hidden">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}
