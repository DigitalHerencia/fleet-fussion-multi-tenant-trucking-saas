import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RouteProtection } from "@/lib/auth/permissions";
import type { UserContext, ClerkUserMetadata, ClerkOrganizationMetadata } from "@/types/auth";
import { SystemRoles, getPermissionsForRole, type SystemRole } from "@/types/abac";

const publicRoutePatterns = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
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

    // If user is authenticated and trying to access sign-in/sign-up, redirect appropriately (contingency)
    if (authData.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      const { sessionClaims } = authData;
      const userMetadata = sessionClaims?.metadata || sessionClaims?.publicMetadata;
      
      // Check if onboarding is completed
      if (!userMetadata?.onboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // If user has org context, redirect to org dashboard
      if (authData.orgId) {
        return NextResponse.redirect(new URL(`/${authData.orgId}/dashboard/${authData.userId}`, req.url));
      }
      
      // If no org context but has organization in metadata, use that
      if (userMetadata?.organizationId) {
        return NextResponse.redirect(new URL(`/${userMetadata.organizationId}/dashboard/${authData.userId}`, req.url));
      }
      
      // Fallback: redirect to onboarding if no organization context
      return NextResponse.redirect(new URL('/onboarding', req.url));
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

  // Extract ABAC session attributes (prioritize new structure)
  const abacAttributes = sessionClaims?.abac;
  const userRole = abacAttributes?.role || 
                   sessionClaims?.publicMetadata?.role ||
                   sessionClaims?.metadata?.role ||
                   SystemRoles.VIEWER;
  
  const userPermissions = abacAttributes?.permissions || 
                         getPermissionsForRole(userRole as SystemRole);
  
  const organizationId = abacAttributes?.organizationId ||
                        orgId || 
                        sessionClaims?.publicMetadata?.organizationId ||
                        sessionClaims?.metadata?.organizationId || 
                        '';
  
  const onboardingComplete = sessionClaims?.publicMetadata?.onboardingComplete ||
                            sessionClaims?.metadata?.onboardingComplete ||
                            false;
  
  const isActive = sessionClaims?.metadata?.isActive !== false;

  // Get organization metadata
  const orgMetadata = sessionClaims?.org_public_metadata as ClerkOrganizationMetadata | undefined;

  // Build user context for route protection
  const userContext: UserContext = {
    userId,
    organizationId,
    role: userRole as SystemRole,
    permissions: userPermissions,
    isActive,
    name: sessionClaims?.firstName || sessionClaims?.fullName?.split(' ')[0] || '',
    email: sessionClaims?.primaryEmail || '',
    firstName: sessionClaims?.firstName || '',
    lastName: sessionClaims?.lastName || '',
    onboardingComplete: onboardingComplete,
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
  if (!userContext.onboardingComplete && !req.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Prevent users who have completed onboarding from accessing onboarding page again
  if (userContext.onboardingComplete && req.nextUrl.pathname.startsWith('/onboarding')) {
    // Redirect to org dashboard if org context exists
    if (userContext.organizationId) {
      return NextResponse.redirect(new URL(`/${userContext.organizationId}/dashboard/${userId}`, req.url));
    }
    // If no organization context, redirect to onboarding to complete setup
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Organization tenant handling
  const orgPath = /\/([^\/]+)\/dashboard/;
  const matches = req.nextUrl.pathname.match(orgPath);
  
  if (matches && matches[1]) {
    const requestedOrgId = matches[1];
    // If user is not a member of the requested org, deny access
    if (userContext.organizationId && userContext.organizationId !== requestedOrgId) {
      return NextResponse.redirect(new URL(`/${userContext.organizationId}/dashboard/${userId}?error=wrong-org`, req.url));
    }
  }

  // Check route permissions
  if (!RouteProtection.canAccessRoute(userContext, req.nextUrl.pathname)) {
    return forbiddenOrRedirect(req, '/sign-in?error=unauthorized');
  }

  // Set headers with user context
  const response = NextResponse.next();
  
  response.headers.set('x-user-role', userRole as string);
  if (userPermissions.length > 0) {
    response.headers.set('x-user-permissions', JSON.stringify(userPermissions));
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
  // Redirect to sign-in instead of non-existent /dashboard
  return NextResponse.redirect(new URL('/sign-in?error=forbidden', req.url));
}
