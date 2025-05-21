import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'tunnelvision_auth'; // Should match the one in lib/auth.ts

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthPage = pathname.startsWith('/login');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (isAuthPage) {
    if (isAuthenticated) {
      // If authenticated and trying to access login, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to login page if not authenticated
    return NextResponse.next();
  }

  if (isDashboardPage) {
    if (!isAuthenticated) {
      // If not authenticated and trying to access dashboard, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow access to dashboard if authenticated
    return NextResponse.next();
  }
  
  // For any other route, if not authenticated and not root, redirect to login.
  // If root, it will be handled by src/app/page.tsx which redirects to /login.
  if (pathname !== '/' && !isAuthenticated) {
     // return NextResponse.redirect(new URL('/login', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
