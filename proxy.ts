import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/organizer') ||
    pathname.startsWith('/admin') ||
    pathname === '/profile';

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
