import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DASHBOARD_ROOT_BY_ROLE } from '@/types/routes'
import type { UserRole } from '@/types'

export default async function DashboardRootPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard')
  const target = DASHBOARD_ROOT_BY_ROLE[session.user.role as UserRole] ?? '/dashboard/participant'
  redirect(target)
}
