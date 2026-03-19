'use client'

import { useSidebarStore } from '@/lib/store'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore()

  return (
    <div
      className={cn('layout-user', collapsed && 'sidebar-collapsed')}
    >
      <Header />
      <Sidebar />
      <main
        className="overflow-y-auto"
        style={{ gridArea: 'main' }}
      >
        {children}
      </main>
    </div>
  )
}
