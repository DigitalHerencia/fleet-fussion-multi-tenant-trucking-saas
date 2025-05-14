import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
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
  // First apply security headers to all requests
  const secureResponse = (res: NextResponse) => {
    const securityHeaders = addSecurityHeaders(req, res);
    return NextResponse.next({ headers: securityHeaders });
  };

  // Handle requests to public routes - allow access without authentication
  if (isPublicRoute(req)) {
    return secureResponse(NextResponse.next());
  }

  // For all other routes, we need to check authentication
  return auth().then(({ userId, sessionClaims }) => {
    // If no user and not on public route, redirect to sign-in
    if (!userId && !isPublicRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      const returnUrl = new URL(req.url);

      // Clean returnUrl to avoid redirect loops
      returnUrl.searchParams.delete("redirect_url");
      returnUrl.searchParams.delete("returnBackUrl");

      // Set the returnUrl parameter
      signInUrl.searchParams.set("returnBackUrl", returnUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    // Check if user needs to complete onboarding (safe access with optional chaining)
    const onboardingComplete = sessionClaims?.onboardingComplete === true;
    
    // For users on onboarding route, let them proceed regardless of onboarding status
    if (userId && isOnboardingRoute(req)) {
      return secureResponse(NextResponse.next());
    }

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    if (userId && !onboardingComplete && !isOnboardingRoute(req)) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Protect /admin routes for admin users only
    if (isAdminRoute(req) && sessionClaims?.role !== "admin") {
      const url = new URL("/admin", req.url);
      return NextResponse.redirect(url);
    }

    // If we get here, the user is authenticated and has completed onboarding
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