import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/events', '/events/:slug*'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage')?.value; // Zustand persist uses localStorage, but we can check token in middleware via cookie (if we set it)

  // For simplicity, we'll check if the user is trying to access protected routes
  const { pathname } = request.nextUrl;

  // Protected routes (organizer, admin, profile)
  const isProtected =
    pathname.startsWith('/organizer') ||
    pathname.startsWith('/admin') ||
    pathname === '/profile';

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};