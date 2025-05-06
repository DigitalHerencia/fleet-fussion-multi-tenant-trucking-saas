import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
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
  '/onboarding' // Add onboarding to public routes
]);

export default clerkMiddleware(async (auth, req) => {
  // If the request is for a public route, proceed without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // For all other routes, protect them
  await auth.protect();
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|static|favicon.ico|logo|icons|images).*)',
    // Force include paths with a dot, like API routes
    '/(api|trpc)(.*)',
  ],
};