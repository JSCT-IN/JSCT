import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get('jsct_admin_token')?.value;
  const adminRole = request.cookies.get('jsct_admin_role')?.value;
  const standardToken = request.cookies.get('jsct_session')?.value;
  const standardRole = request.cookies.get('jsct_role')?.value;

  const isAuthenticatedAdmin = Boolean(adminToken && adminRole === 'admin');
  const isStandardMember = Boolean(standardRole === 'MEMBER' || (adminRole && adminRole !== 'admin'));

  // ============================================================================
  // 1. HARDENED ADMIN ROUTE PROTECTION (/admin* and /console-secure-admin*)
  // ============================================================================
  if (pathname.startsWith('/console-secure-admin') || pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/console-secure-admin/login' || pathname === '/admin/login';

    // If an authenticated admin visits login -> redirect straight to dashboard
    if (isLoginPage) {
      if (isAuthenticatedAdmin) {
        return NextResponse.redirect(new URL('/console-secure-admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // If user is authenticated as a regular member (not admin) -> access denied
    if (isStandardMember && !isAuthenticatedAdmin) {
      const deniedUrl = new URL('/login', request.url);
      deniedUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(deniedUrl);
    }

    // If unauthenticated -> redirect to admin login gate
    if (!isAuthenticatedAdmin) {
      const loginUrl = new URL('/console-secure-admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing legacy /admin directly -> cleanly route to /console-secure-admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/console-secure-admin/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // ============================================================================
  // 2. MEMBER DASHBOARD ROUTES (/dashboard/*)
  // ============================================================================
  if (pathname.startsWith('/dashboard')) {
    if (!standardToken && !adminToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/console-secure-admin',
    '/console-secure-admin/:path*',
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
  ],
};
