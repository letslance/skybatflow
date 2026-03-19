'use client'

import AdminLayout from '@/components/layout/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { ADMIN_ROLES } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait until Zustand has rehydrated from localStorage before making redirect decisions.
    // Without this guard, `user` is always null on the first render after a page refresh,
    // causing a spurious redirect to /login even when the user is authenticated.
    if (!_hasHydrated) return
    if (!user) { router.replace('/login'); return }
    if (!ADMIN_ROLES.includes(user.role)) { router.replace('/'); }
  }, [user, _hasHydrated])

  // Show nothing while hydrating — the edge middleware already protects the route
  // via the access_token httpOnly cookie, so no flash of unprotected content is possible.
  if (!_hasHydrated) return null

  if (!user || !ADMIN_ROLES.includes(user.role)) return null

  return <AdminLayout>{children}</AdminLayout>
}
