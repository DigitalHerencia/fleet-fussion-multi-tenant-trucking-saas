import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RouteProtection } from "@/lib/auth/permissions";
import type { UserContext, ClerkOrganizationMetadata } from "@/types/auth";
import { SystemRoles, getPermissionsForRole, type SystemRole } from "@/types/abac";

// Pre-compiled route matchers for better performance
const publicRoutePatterns = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/api/clerk/webhook-handler', // Ensure webhook-handler is public
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

// Utility: Get dashboard path by role
function getDashboardPath(userContext: UserContext): string {
  const orgId = userContext.organizationId;
  const userId = userContext.userId;
  switch (userContext.role) {
    case 'admin':
      return `/${orgId}/dashboard/${userId}`;
    case 'dispatcher':
      return `/${orgId}/dashboard/${userId}`;
    case 'driver':
      return `/${orgId}/dashboard/${userId}`;
    case 'compliance_officer':
      return `/${orgId}/dashboard/${userId}`;
    case 'accountant':
      return `/${orgId}/dashboard/${userId}`;
    case 'viewer':
      return `/${orgId}/dashboard/${userId}`;
    default:
      return '/';
  }
}

// Provide a default ClerkOrganizationMetadata object for type safety
const defaultOrgMetadata: ClerkOrganizationMetadata = {
  subscriptionTier: 'free',
  subscriptionStatus: 'inactive',
  maxUsers: 5,
  features: [],
  billingEmail: '',
  createdAt: new Date().toISOString(),
  settings: {
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    distanceUnit: 'miles',
    fuelUnit: 'gallons',
  },
};

// Extracted helper functions for better performance and readability
async function handlePublicRoute(auth: any, req: NextRequest) {
  const authData = await auth();

  // Special handling for webhook endpoint - immediate return
  if (req.nextUrl.pathname.startsWith('/api/clerk/webhook-handler')) {
    return NextResponse.next();
  }

  // Authenticated user on sign-in/up: route to correct dashboard or onboarding
  if (authData.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    // Fetch user context (from session or DB)
    const userContext = getCachedUserContext( authData.userId );
    if (userContext) {
      if (userContext.role === 'admin' && !userContext.onboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
      // All other roles go to their dashboard
      return NextResponse.redirect(new URL(getDashboardPath(userContext), req.url));
    }
  }

  // Block onboarding for non-admins
  if (req.nextUrl.pathname.startsWith('/onboarding')) {
    const userContext = authData.userId ? getCachedUserContext(authData.userId) : null;
    if (!userContext || userContext.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
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
    organizationMetadata: orgMetadata || defaultOrgMetadata,
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
  return NextResponse.redirect(new URL('/sign-in', req.url));
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
      // Always redirect to correct org dashboard for this user
      return NextResponse.redirect(new URL(getDashboardPath(userContext), req.url));
    }
  }

  // Check route permissions with optimized lookup
  if (!RouteProtection.canAccessRoute(userContext, req.nextUrl.pathname)) {
    return forbiddenOrRedirect(req, '/sign-in');
  }

  // Set optimized headers
  return createResponseWithHeaders(userContext, orgId || null);
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};