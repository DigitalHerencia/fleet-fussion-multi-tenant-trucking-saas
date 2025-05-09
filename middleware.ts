// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";

// List of public routes that don't require authentication
const publicPaths = [
  "/",
  "/sign-in*",
  "/sign-up*",
  "/api/clerk*",
  "/pricing",
  "/about",
  "/contact",
  "/services",
  "/terms",
  "/privacy",
  "/refund",
  "/features"
];

const isPublic = (path: string) => {
  return publicPaths.some(publicPath => {
    if (publicPath.endsWith("*")) {
      return path.startsWith(publicPath.slice(0, -1));
    }
    return path === publicPath;
  });
};

export default clerkMiddleware((auth, req) => {
  const { userId, orgId } = getAuth(req);
  const path = req.nextUrl.pathname;

  // If the path is public, allow access
  if (isPublic(path)) {
    return NextResponse.next();
  }

  // If user is not signed in, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is signed in but has no organization
  if (userId && !orgId) {
    // Exclude onboarding and org-selection from the redirect chain
    if (path === '/onboarding' || path === '/org-selection') {
      return NextResponse.next();
    }

    // Redirect to organization selection or onboarding
    // We use a simple check here - if path includes org or company, likely they need to select one
    const needsOrgSelection = path.includes('dashboard');
    const redirectUrl = needsOrgSelection ? '/org-selection' : '/onboarding';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // For authenticated users with an org, allow access to protected routes
  return NextResponse.next();
});

// Stop the middleware from running on static files and Next.js internals
export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
};
