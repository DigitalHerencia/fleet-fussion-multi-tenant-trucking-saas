import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import logger from "./lib/utils/logger";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/about",
  "/features",
  "/services",
  "/pricing",
  "/terms",
  "/privacy",
  "/refund",
  "/contact",
  "/api(.*)",
]);

// Define onboarding routes
const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)"
]);

// Define admin routes
const isAdminRoute = createRouteMatcher([
  "/admin(.*)"
]);

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Add security headers to the response
function addSecurityHeaders(req: NextRequest, res: NextResponse): Headers {
  const headers = new Headers(res.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return headers;
}

// Use the authMiddleware pattern recommended by Clerk
export default clerkMiddleware((auth, req) => {
  logger.debug("Middleware: request received", { url: req.url });

  // First apply security headers to all requests
  const secureResponse = (res: NextResponse) => {
    const securityHeaders = addSecurityHeaders(req, res);
    return NextResponse.next({ headers: securityHeaders });
  };

  // Handle requests to public routes - allow access without authentication
  if (isPublicRoute(req)) {
    logger.debug("Middleware: public route", { url: req.url });
    return secureResponse(NextResponse.next());
  }

  // For all other routes, we need to check authentication
  return auth().then(({ userId, sessionClaims }) => {
    logger.debug("Middleware: auth check", { userId, sessionClaims });
    // Log all sessionClaims for debugging
    logger.debug("Middleware: full sessionClaims", sessionClaims);
    // Log publicMetadata for debugging
    logger.debug("Middleware: sessionClaims.publicMetadata", sessionClaims && typeof sessionClaims.publicMetadata === 'object' ? sessionClaims.publicMetadata : undefined);

    // Fix: Check onboardingComplete in both root and publicMetadata (safe type check)
    const publicMetadata = sessionClaims && typeof sessionClaims.publicMetadata === 'object' && sessionClaims.publicMetadata !== null
      ? sessionClaims.publicMetadata as Record<string, unknown>
      : undefined;
    const onboardingComplete =
      sessionClaims?.onboardingComplete === true ||
      publicMetadata?.onboardingComplete === true;

    // For users on onboarding route, let them proceed regardless of onboarding status
    if (userId && isOnboardingRoute(req)) {
      logger.debug("Middleware: onboarding route", { url: req.url });
      return secureResponse(NextResponse.next());
    }

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    if (userId && !onboardingComplete && !isOnboardingRoute(req)) {
      const onboardingUrl = new URL("/onboarding", req.url);
      logger.info("Middleware: redirect to onboarding", { onboardingUrl: onboardingUrl.toString() });
      return NextResponse.redirect(onboardingUrl);
    }

    // Protect /admin routes for admin users only
    if (isAdminRoute(req)) {
      // Allow only users with admin or org:admin claims
      const userRoleClaim = sessionClaims?.role || sessionClaims?.orgRole;
      if (userRoleClaim !== "admin" && userRoleClaim !== "org:admin") {
        const url = new URL("/admin", req.url);
        logger.warn("Middleware: unauthorized admin access", { url: url.toString(), userRoleClaim });
        return NextResponse.redirect(url);
      }
    }

    // If we get here, the user is authenticated and has completed onboarding
    logger.debug("Middleware: access granted", { url: req.url });
    return secureResponse(NextResponse.next());
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};