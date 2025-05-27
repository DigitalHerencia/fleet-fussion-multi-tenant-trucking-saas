import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RouteProtection } from "@/lib/auth/permissions";
import type { UserContext, ClerkUserMetadata, ClerkOrganizationMetadata } from "@/types/auth";
import { UserRole } from "@/types/auth";

const publicRoutePatterns = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/clerk/(.*)', // Clerk webhooks
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/services',
  '/privacy',
  '/terms',
  '/refund',
];

const isPublicRoute = createRouteMatcher(publicRoutePatterns);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Check if it's a public route
  if (isPublicRoute(req)) {
    // Get auth data to check if user is authenticated
    const authData = await auth();

    // Special handling for webhook endpoint
    if (req.nextUrl.pathname.startsWith('/api/clerk/webhook-handler')) {
      return NextResponse.next();
    }

    // If user is authenticated and trying to access sign-in/sign-up, redirect appropriately
    if (authData.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      const { sessionClaims } = authData;
      const userMetadata = sessionClaims?.metadata;
      
      // Check if onboarding is completed
      if (!userMetadata?.onboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // If user has org context, redirect to org dashboard
      if (authData.orgId) {
        return NextResponse.redirect(new URL(`/org/${authData.orgId}/dashboard`, req.url));
      }
      
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // For protected routes, ensure user is authenticated
  const { userId, sessionClaims, orgId } = await auth();
  
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Get user metadata from session claims
  const userMetadata = sessionClaims?.metadata;
  const userRole = userMetadata?.role;
  const userPermissions = userMetadata?.permissions || [];
  const isActive = userMetadata?.isActive !== false;

  // Get organization metadata
  const orgMetadata = sessionClaims?.org_public_metadata as ClerkOrganizationMetadata | undefined;

  // Build user context for route protection
  const userContext: UserContext = {
    userId,
    organizationId: orgId || userMetadata?.organizationId || '',
    role: (userRole as UserRole) || UserRole.USER,
    permissions: userPermissions,
    isActive,
    name: sessionClaims?.firstName || sessionClaims?.fullName?.split(' ')[0] || '',
    email: sessionClaims?.primaryEmail || '',
    firstName: sessionClaims?.firstName || '',
    lastName: sessionClaims?.lastName || '',
    onboardingCompleted: userMetadata?.onboardingComplete || false,
    organizationMetadata: orgMetadata || {
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      maxUsers: 1,
      features: [],
      billingEmail: sessionClaims?.primaryEmail || '',
      createdAt: new Date().toISOString(),
      settings: {
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        distanceUnit: 'miles',
        fuelUnit: 'gallons'
      }
    },
  };

  // Check if user needs to complete onboarding
  if (!userContext.onboardingCompleted && !req.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Prevent users who have completed onboarding from accessing onboarding page again
  if (userContext.onboardingCompleted && req.nextUrl.pathname.startsWith('/onboarding')) {
    // Redirect to org dashboard if org context exists, else to dashboard
    if (userContext.organizationId) {
      return NextResponse.redirect(new URL(`/org/${userContext.organizationId}/dashboard`, req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Organization tenant handling
  const orgPath = /\/org\/([^\/]+)/;
  const matches = req.nextUrl.pathname.match(orgPath);
  
  if (matches && matches[1]) {
    const requestedOrgId = matches[1];
    // If user is not a member of the requested org, deny access
    if (userContext.organizationId && userContext.organizationId !== requestedOrgId) {
      return NextResponse.redirect(new URL(`/org/${userContext.organizationId}/dashboard?error=wrong-org`, req.url));
    }
  }

  // Check route permissions
  if (!RouteProtection.canAccessRoute(userContext, req.nextUrl.pathname)) {
    return forbiddenOrRedirect(req, '/dashboard?error=unauthorized');
  }

  // Set headers with user context
  const response = NextResponse.next();
  
  response.headers.set('x-user-role', userRole || UserRole.USER);
  if (userPermissions.length > 0) {
    response.headers.set('x-user-permissions', userPermissions.join(','));
  }
  if (orgId) {
    response.headers.set('x-organization-id', orgId);
  }
  
  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

function forbiddenOrRedirect(req: NextRequest, redirectUrl?: string) {
  const isApi = req.nextUrl.pathname.startsWith('/api/') || req.headers.get('accept')?.includes('application/json');
  if (isApi) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }
  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url));
}
