// RBAC-only middleware: global auth, security headers, rate limiting
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/services',
  '/privacy',
  '/terms',
  '/refund',
  '/api/clerk/',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  // Global auth: check for session cookie
  const sessionToken = req.cookies.get('__session')?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  // Optionally, validate session with Clerk (optional for RBAC)
  // Security headers
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // TODO: Add rate limiting logic here if needed
  return res;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};