import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/services',
  '/privacy',
  '/terms',
  '/refund',
  '/api/webhooks/clerk', // Allow webhook endpoint
]);

// Define onboarding routes
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/settings/billing',
  '/settings/organization',
  '/settings/users',
]);

// Define dispatcher routes
const isDispatcherRoute = createRouteMatcher([
  '/dispatch(.*)',
  '/analytics(.*)',
]);

// Define driver routes (restricted to driver-specific data)
const isDriverRoute = createRouteMatcher([
  '/driver(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - this will redirect to sign-in if not authenticated
  const { userId, orgId, sessionClaims } = await auth.protect();

  // Get user metadata from session claims
  const userMetadata = sessionClaims?.metadata as any;
  const userRole = userMetadata?.role || 'viewer';
  const isActive = userMetadata?.isActive !== false;
  const onboardingCompleted = userMetadata?.onboardingCompleted === true;

  // Check if user is active
  if (!isActive) {
    return NextResponse.redirect(new URL('/sign-in?error=account_disabled', req.url));
  }

  // Handle onboarding flow
  if (!onboardingCompleted && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Prevent access to onboarding if already completed
  if (onboardingCompleted && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Check organization membership for tenant routes
  if (!isPublicRoute(req) && !isOnboardingRoute(req)) {
    if (!orgId) {
      return NextResponse.redirect(new URL('/onboarding/organization', req.url));
    }
  }

  // Role-based route protection
  if (isAdminRoute(req) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', req.url));
  }

  if (isDispatcherRoute(req) && !['admin', 'dispatcher'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', req.url));
  }

  if (isDriverRoute(req) && !['admin', 'dispatcher', 'driver'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', req.url));
  }

  // Add custom headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-id', userId);
  if (orgId) {
    response.headers.set('x-org-id', orgId);
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|static|favicon.ico|logo|icons|images).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};