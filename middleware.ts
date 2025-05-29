import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RouteProtection } from "@/lib/auth/permissions";
import type { UserContext, ClerkUserMetadata, ClerkOrganizationMetadata } from "@/types/auth";
import { SystemRoles, getPermissionsForRole, type SystemRole } from "@/types/abac";
import { authCache } from "@/lib/cache/auth-cache";

// Pre-compiled route matchers for better performance
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

// Cache for session data to avoid repeated processing
const sessionCache = new Map<string, {
  userContext: UserContext;
  timestamp: number;
  ttl: number;
}>();

const SESSION_CACHE_TTL = 30 * 1000; // 30 seconds for session cache

function getCachedUserContext(sessionId: string): UserContext | null {
  const cached = sessionCache.get(sessionId);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.userContext;
  }
  if (cached) {
    sessionCache.delete(sessionId);
  }
  return null;
}

function setCachedUserContext(sessionId: string, userContext: UserContext): void {
  sessionCache.set(sessionId, {
    userContext,
    timestamp: Date.now(),
    ttl: SESSION_CACHE_TTL,
  });
}

// Pre-compile regex patterns for better performance
const orgPathRegex = /\/([^\/]+)\/dashboard/;

// Extracted helper functions for better performance and readability
async function handlePublicRoute(auth: any, req: NextRequest) {
  const authData = await auth();

  // Special handling for webhook endpoint - immediate return
  if (req.nextUrl.pathname.startsWith('/api/clerk/webhook-handler')) {
    return NextResponse.next();
  }

  // Optimized authenticated user redirection
  if (authData.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    const { sessionClaims } = authData;
    const userMetadata = sessionClaims?.metadata || sessionClaims?.publicMetadata;
    
    if (!userMetadata?.onboardingComplete) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    const orgId = authData.orgId || userMetadata?.organizationId;
    if (orgId) {
      return NextResponse.redirect(new URL(`/${orgId}/dashboard/${authData.userId}`, req.url));
    }
    
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }
  
  return NextResponse.next();
}

function buildUserContext(userId: string, sessionClaims: any, orgId: string | null): UserContext {
  // Extract ABAC session attributes with fallback optimization
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
  const orgMetadata = sessionClaims?.org_public_metadata as ClerkOrganizationMetadata | undefined;

  return {
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
}

function createResponseWithHeaders(userContext: UserContext, orgId: string | null): NextResponse {
  const response = NextResponse.next();
  
  // Set optimized headers
  response.headers.set('x-user-role', userContext.role);
  if (userContext.permissions.length > 0) {
    response.headers.set('x-user-permissions', JSON.stringify(userContext.permissions));
  }
  if (orgId) {
    response.headers.set('x-organization-id', orgId);
  }
  
  return response;
}

function forbiddenOrRedirect(req: NextRequest, redirectUrl?: string) {
  const isApi = req.nextUrl.pathname.startsWith('/api/') || req.headers.get('accept')?.includes('application/json');
  if (isApi) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }
  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  return NextResponse.redirect(new URL('/sign-in?error=forbidden', req.url));
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Check if it's a public route - early return for better performance
  if (isPublicRoute(req)) {
    return handlePublicRoute(auth, req);
  }

  // For protected routes, ensure user is authenticated
  const { userId, sessionClaims, orgId } = await auth();
  
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Try to get cached user context first
  const sessionId = `${userId}-${orgId || 'no-org'}`;
  let userContext = getCachedUserContext(sessionId);
  
  if (!userContext) {
    // Build user context with optimized extraction
    userContext = buildUserContext(userId, sessionClaims, orgId || null);
    setCachedUserContext(sessionId, userContext);
  }


  // Organization tenant handling with optimized regex
  const matches = req.nextUrl.pathname.match(orgPathRegex);
  if (matches && matches[1]) {
    const requestedOrgId = matches[1];
    if (userContext.organizationId && userContext.organizationId !== requestedOrgId) {
      return NextResponse.redirect(new URL(`/${userContext.organizationId}/dashboard/${userId}?error=wrong-org`, req.url));
    }
  }

  // Check route permissions with optimized lookup
  if (!RouteProtection.canAccessRoute(userContext, req.nextUrl.pathname)) {
    return forbiddenOrRedirect(req, '/sign-in?error=unauthorized');
  }

  // Set optimized headers
  return createResponseWithHeaders(userContext, orgId || null);
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};