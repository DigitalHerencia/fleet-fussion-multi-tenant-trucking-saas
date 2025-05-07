import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { ClerkMiddlewareAuth as Auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { companies, companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cookies } from "next/headers"
import { getUserRoleInCompany, UserRole } from "@/lib/auth"

// Define public routes that don't require authentication
const publicRoutes = [
    "/",
    "/sign-in(.*)", // Updated to include any sign-in paths
    "/sign-up(.*)", // Updated to include any sign-up paths
    "/about",
    "/contact",
    "/pricing",
    "/features",
    "/services",
    "/privacy",
    "/terms",
    "/refund"
]

// Routes that are accessible after authentication but before company selection
const authOnlyRoutes = ["/onboarding(.*)", "/company-selection(.*)"]

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher([...publicRoutes])

// Create a matcher for auth-only routes
const isAuthOnlyRoute = createRouteMatcher([...authOnlyRoutes])

// Map of protected routes to required roles
const protectedRouteRoles: { [route: string]: UserRole } = {
    "/dispatch": UserRole.DISPATCHER,
    "/drivers": UserRole.DISPATCHER,
    "/vehicles": UserRole.DISPATCHER,
    "/compliance": UserRole.SAFETY_MANAGER,
    "/settings": UserRole.ADMIN
    // Add more as needed
}

interface ClerkAuth extends Auth {
    userId?: string | null
}

export default clerkMiddleware(async (auth: ClerkAuth, req: NextRequest) => {
    // Handle public routes - allow access
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // If the user isn't authenticated, redirect to sign-in
    if (!auth.userId) {
        const signInUrl = new URL("/sign-in", req.url)
        // Preserve the redirect URL
        signInUrl.searchParams.set("redirect_url", req.url)
        return NextResponse.redirect(signInUrl)
    }

    // Allow access to auth-only routes (like onboarding) for authenticated users without companies
    if (isAuthOnlyRoute(req)) {
        return NextResponse.next()
    }

    // Get current company from cookie
    const cookieStore = await cookies()
    const selectedCompanyId = cookieStore.get("selectedCompany")?.value

    // If there's no company selected but the user is authenticated,
    // redirect to company selection
    if (!selectedCompanyId && !req.nextUrl.pathname.startsWith("/company-selection")) {
        return NextResponse.redirect(new URL("/company-selection", req.url))
    }

    // If company is selected, verify it exists and user is a member
    if (selectedCompanyId && !req.nextUrl.pathname.startsWith("/onboarding")) {
        try {
            // Check if user belongs to this company
            const userCompany = await db.query.companyUsers.findFirst({
                where: and(
                    eq(companyUsers.userId, auth.userId),
                    eq(companyUsers.companyId, selectedCompanyId)
                ),
                with: {
                    company: true
                }
            })

            // If user doesn't belong to company, redirect to company selection
            if (!userCompany) {
                cookieStore.delete("selectedCompany")
                return NextResponse.redirect(new URL("/company-selection", req.url))
            }

            // If company doesn't exist, redirect to onboarding
            if (!userCompany.company) {
                return NextResponse.redirect(new URL("/onboarding", req.url))
            }

            // Role-based route protection
            for (const [route, requiredRole] of Object.entries(protectedRouteRoles)) {
                if (req.nextUrl.pathname.startsWith(route)) {
                    const userRole = await getUserRoleInCompany()
                    if (
                        !userRole ||
                        (userRole !== requiredRole &&
                            userRole !== UserRole.ADMIN &&
                            userRole !== UserRole.OWNER)
                    ) {
                        return NextResponse.redirect(new URL("/unauthorized", req.url))
                    }
                }
            }
        } catch (error) {
            console.error("Error checking company in middleware:", error)
            // Continue to the app if we can't check the company
            // The application will handle this error state
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|static|favicon.ico|logo|icons|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
        // Force include only specific API routes that need auth
        "/(api|trpc)/((?!public).*)"
    ]
}
