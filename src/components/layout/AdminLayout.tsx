'use client'

import AdminSidebar from './AdminSidebar'
import { useAuthStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { authApi, adminApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { applyTheme } from '@/lib/theme'

const FIXTURES = [
  'CS Dinamo Bucuresti - CS Municipal Ploiesti  25/03/2026 19:30:00',
  'Mumbai Indians - Chennai Super Kings  25/03/2026 19:00:00',
  'Real Madrid - Barcelona  25/03/2026 20:00:00',
  'Australia - India Test Match  26/03/2026 05:30:00',
]

// ─── Admin Navbar ─────────────────────────────────────────────────────────────
function AdminNavbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuthStore()
  const router   = useRouter()
  const [dropOpen, setDropOpen] = useState(false)
  const [tickerIdx, setTickerIdx] = useState(0)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % FIXTURES.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    try { await authApi.logout() } catch { /* */ }
    logout()
    router.push('/admin/login')
  }

  function handleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return (
    <header className="h-[60px] bg-bg-body border-b border-[#2a3038] flex items-center px-4 gap-2.5 flex-shrink-0 sticky top-0 z-[50]">
      <button
        onClick={onToggleSidebar}
        className="bg-transparent border-none text-tx-secondary text-xl cursor-pointer px-1 flex-shrink-0 leading-none hover:text-tx-primary transition-colors"
      >
        <i className="fas fa-bars" />
      </button>

      <div className="flex-shrink-0 hidden sm:block">
        <input
          placeholder="Search..."
          className="bg-white border-none rounded px-3 py-1 text-base w-40 text-[#333] outline-none"
        />
      </div>

      <div className="hidden md:flex items-stretch flex-1 overflow-hidden min-w-0 h-9 rounded">
        <div className="bg-tableHeader text-white text-2xs font-bold px-3 flex flex-col items-center justify-center flex-shrink-0 leading-snug rounded-l">
          Upcoming<br />Fixtures
        </div>
        <div style={{ width:0, height:0, borderTop:'18px solid transparent', borderBottom:'18px solid transparent', borderLeft:'14px solid #126e51', flexShrink:0 }} />
        <div className="bg-bg-card text-tx-secondary text-sm px-3.5 flex items-center overflow-hidden flex-1 rounded-r whitespace-nowrap text-ellipsis">
          {FIXTURES[tickerIdx]}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
        <button
          onClick={handleFullscreen}
          className="hidden sm:block bg-transparent border-none text-tx-secondary text-xl cursor-pointer leading-none hover:text-tx-primary transition-colors"
          title="Fullscreen"
        >
          <i className="bx bx-fullscreen" />
        </button>

        <a href="#" className="hidden sm:block text-void text-base font-semibold no-underline hover:opacity-80">Rules</a>

        {user && (
          <span className="hidden sm:inline text-tx-secondary text-sm">
            Pts: <strong className="text-white">0.00</strong>
          </span>
        )}

        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen(v => !v)}
            className="bg-transparent border border-[#3a444c] rounded text-tx-secondary text-base cursor-pointer px-3 py-1 flex items-center gap-1.5 hover:text-tx-primary transition-colors"
          >
            <i className="bx bx-user-circle text-md" />
            <span>{user?.username ?? 'Admin'}</span>
            <i className="mdi mdi-chevron-down text-sm" />
          </button>

          {dropOpen && (
            <div className="absolute top-[calc(100%+4px)] right-0 bg-bg-card border border-[#3a444c] rounded min-w-[160px] z-[200] shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
              <div className="px-3.5 py-2.5 border-b border-[#3a444c]">
                <div className="text-white font-semibold text-base">{user?.username}</div>
                <div className="text-tx-muted text-2xs uppercase tracking-wide">{user?.role}</div>
              </div>
              <div className="px-3.5 py-2 flex gap-2.5 border-b border-[#3a444c]">
                <a href="#" className="text-tx-secondary hover:text-tx-primary"><i className="bx bx-phone-call text-md" /></a>
                <a href="#" className="text-tx-secondary hover:text-tx-primary"><i className="bx bxs-city text-md" /></a>
                <a href="#" className="text-tx-secondary hover:text-tx-primary"><i className="bx bx-wallet text-md" /></a>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-transparent border-none text-loss text-base cursor-pointer hover:bg-bg-hover transition-colors"
              >
                <i className="bx bx-log-out text-md" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Admin Layout shell ───────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Desktop: collapsed = icon-only mode (false = full 240px, true = 56px icons)
  const [collapsed,   setCollapsed]   = useState(false)
  // Mobile: mobileOpen = drawer visible
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [isDesktop,   setIsDesktop]   = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      if (!e.matches) setMobileOpen(false) // close drawer when resizing to desktop
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleToggle() {
    if (isDesktop) setCollapsed(v => !v)   // desktop: toggle icon-only mode
    else           setMobileOpen(v => !v)  // mobile: toggle drawer
  }

  useEffect(() => {
    adminApi.getSettings()
      .then((d: any) => {
        if (d) applyTheme({
          primaryColor:   d.primaryColor,
          secondaryColor: d.secondaryColor,
          siteTitle:      d.siteTitle,
          logoUrl:        d.logoUrl,
          faviconUrl:     d.faviconUrl,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminNavbar onToggleSidebar={handleToggle} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-16 bg-bg-body">
          {children}
        </main>
      </div>
    </div>
  )
}
