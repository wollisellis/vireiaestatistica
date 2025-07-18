import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/jogos',
  '/professor',
  '/dashboard',
  '/profile',
  '/settings'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/professor/registro',
  '/login',
  '/register'
]

// Define routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value
  const guestMode = request.cookies.get('guest-mode')?.value
  const professorGuestMode = request.cookies.get('professor-guest-mode')?.value

  // Check if user is authenticated (has valid token or is in any guest mode)
  const isAuthenticated = !!(authToken || guestMode === 'true' || professorGuestMode === 'true')
  
  // Determine user role based on authentication method
  const userRole = professorGuestMode === 'true' ? 'professor' : 'student'
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname)
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to home page with authentication form
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Handle role-based access control for protected routes
  if (isProtectedRoute && isAuthenticated) {
    // Check if user is trying to access professor pages without professor role
    if (pathname.startsWith('/professor') && userRole !== 'professor') {
      // Redirect students to their appropriate page
      return NextResponse.redirect(new URL('/jogos', request.url))
    }
    
    // Check if professor is trying to access student pages (allow but don't redirect)
    if (pathname.startsWith('/jogos') && userRole === 'professor') {
      // Allow professors to access student pages (they can view both)
      return NextResponse.next()
    }
  }
  
  // Handle auth routes when user is already authenticated
  if (isAuthRoute && isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    const redirectTo = userRole === 'professor' ? '/professor' : '/jogos'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Handle root path - allow access for login page
  if (pathname === '/') {
    // Root is now the login page, allow access for everyone
    return NextResponse.next()
  }
  
  // Allow the request to continue
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
