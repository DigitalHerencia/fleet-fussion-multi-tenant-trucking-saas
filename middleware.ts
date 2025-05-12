// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { addSecurityHeaders } from "./lib/security"
import { rateLimit } from "./lib/rate-limit"

const isOnboardingRoute = createRouteMatcher(["/onboarding"])
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
    "/api(.*)"
])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId, sessionClaims } = await auth()

    // For users visiting /onboarding, don't try to redirect
    if (userId && isOnboardingRoute(req)) {
        const response = NextResponse.next()
        const securityHeaders = addSecurityHeaders(req, response)
        return NextResponse.next({ headers: securityHeaders })
    }

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && !isPublicRoute(req)) {
        const signInUrl = new URL("/sign-in", req.url) // Construct base sign-in URL
        const returnUrl = new URL(req.url)

        // Remove potentially problematic query parameters to avoid nesting/loops
        returnUrl.searchParams.delete("redirect_url")
        returnUrl.searchParams.delete("returnBackUrl")

        // Set the cleaned returnBackUrl
        signInUrl.searchParams.set("returnBackUrl", returnUrl.toString())
        return NextResponse.redirect(signInUrl)
    }

    // Catch users who do not have `onboardingComplete: true` in their publicMetadata
    // Redirect them to the /onboarding route to complete onboarding
    if (userId && !sessionClaims?.metadata?.onboardingComplete) {
        const onboardingUrl = new URL("/onboarding", req.url)
        return NextResponse.redirect(onboardingUrl)
    }

    // Protect /admin routes for admin users only
    if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin") {
        const url = new URL("/", req.url)
        return NextResponse.redirect(url)
    }

    // If the user is logged in and the route is protected, let them view.
    if (userId && !isPublicRoute(req)) {
        const response = NextResponse.next()
        const securityHeaders = addSecurityHeaders(req, response)
        return NextResponse.next({ headers: securityHeaders })
    }
    // Check for rate limits on API routes
    if (req.url.includes("/api/")) {
        const rateLimitResponse = rateLimit(req)
        // If rate limit is exceeded, return the 429 response
        if (rateLimitResponse.headers?.get("status") === "429") {
            return rateLimitResponse
        }
    }

    // For public routes, still add security headers
    const response = NextResponse.next()
    const securityHeaders = addSecurityHeaders(req, response)
    return NextResponse.next({ headers: securityHeaders })
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)"
    ]
}
