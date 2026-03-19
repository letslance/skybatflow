'use client'

import AdminSidebar from './AdminSidebar'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { usePathname } from 'next/navigation'

function AdminHeader() {
  const { user } = useAuthStore()
  const pathname = usePathname()

  // Derive breadcrumb from pathname
  const parts = pathname.split('/').filter(Boolean)
  const crumb = parts.map(p => p.replace(/-/g, ' ')).join(' / ')

  return (
    <header
      className="flex items-center justify-between px-4 border-b border-[#3a444c] z-20"
      style={{ gridArea: 'header', height: 'var(--header-height)', background: '#1e2529' }}
    >
      <div className="text-xs text-tx-muted capitalize">{crumb || 'dashboard'}</div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tx-muted" />
          <input
            placeholder="Search..."
            className="input pl-7 h-7 text-xs w-48"
          />
        </div>
        <button className="p-1.5 rounded hover:bg-bg-hover text-tx-secondary">
          <Bell size={15} />
        </button>
        {user && (
          <div className="text-xs text-tx-secondary">
            {user.username}
          </div>
        )}
      </div>
    </header>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-admin">
      <AdminSidebar />
      <AdminHeader />
      <main
        className="overflow-y-auto bg-bg-body p-4"
        style={{ gridArea: 'main' }}
      >
        {children}
      </main>
    </div>
  )
}
