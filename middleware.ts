import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { DASHBOARD_ROOT_BY_ROLE } from '@/types/routes'
import type { UserRole } from '@/types'

// Route → required role
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/program-manager': ['admin', 'program_manager'],
  '/dashboard/mentor': ['admin', 'mentor'],
  '/dashboard/participant': ['admin', 'participant'],
}

export default auth((req: NextRequest & { auth: { user?: { role?: UserRole } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const user = session?.user

  // If user hits /dashboard, redirect to their role dashboard
  if (pathname === '/dashboard') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const target = DASHBOARD_ROOT_BY_ROLE[user.role as UserRole] ?? '/dashboard/participant'
    return NextResponse.redirect(new URL(target, req.url))
  }

  // Check protected dashboard routes
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!user) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      if (!allowedRoles.includes(user.role as UserRole)) {
        // Redirect to their own dashboard
        const target = DASHBOARD_ROOT_BY_ROLE[user.role as UserRole] ?? '/'
        return NextResponse.redirect(new URL(target, req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/api/enroll', '/api/enrollments/:path*'],
}
