import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { DASHBOARD_ROOT_BY_ROLE } from '@/types/routes'
import type { UserRole } from '@/types'

// Route → required role
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/program-manager': ['admin', 'program_manager'],
  '/dashboard/mentor': ['admin', 'mentor'],
  '/dashboard/participant': ['admin', 'participant'],
}

async function readAuthToken(req: NextRequest) {
  const secureCookie = req.nextUrl.protocol === 'https:'
  const cookieName = secureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token'

  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
    cookieName,
  })
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await readAuthToken(req)
  const userRole = token?.role as UserRole | undefined

  // If user hits /dashboard, redirect to their role dashboard
  if (pathname === '/dashboard') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const target = DASHBOARD_ROOT_BY_ROLE[userRole ?? 'participant'] ?? '/dashboard/participant'
    return NextResponse.redirect(new URL(target, req.url))
  }

  // Check protected dashboard routes
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!token) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to their own dashboard
        const target = DASHBOARD_ROOT_BY_ROLE[userRole ?? 'participant'] ?? '/'
        return NextResponse.redirect(new URL(target, req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/api/enroll', '/api/enrollments/:path*'],
}
