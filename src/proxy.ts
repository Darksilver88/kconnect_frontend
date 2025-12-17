import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has session in cookies
  const hasSession = request.cookies.get('kconnect_user');

  // Public paths that don't require authentication
  const isPublicPath = pathname === '/login';

  // Redirect to login if accessing protected route without session
  if (!isPublicPath && !hasSession && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing login with active session
  if (isPublicPath && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root to login or dashboard based on session
  if (pathname === '/') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/billing/:path*', '/resident/:path*', '/settings/:path*'],
};
