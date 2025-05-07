
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { clerkMiddleware, type ClerkMiddlewareAuth } from "@clerk/nextjs/server"
import { UserRole } from "@/db/schema"

//
// ——— 1) Routes requiring login vs. public routes ———
//
const publicRoutes = [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/about",
    "/contact",
    "/pricing",
    "/features",
    "/privacy",
    "/terms",
    "/refund",
    "/services",
    "/api/public(.*)",
    "/favicon.ico"
]

function isPublicRoute(path: string) {
    return publicRoutes.some(pattern => new RegExp(`^${pattern}$`).test(path))
}

//
// ——— 2) Minimum roles per protected path prefix ———
//
const routeRoles: Record<string, UserRole> = {
    "/dispatch": UserRole.DISPATCHER,
    "/drivers": UserRole.DISPATCHER,
    "/vehicles": UserRole.DISPATCHER,
    "/compliance": UserRole.SAFETY_MANAGER,
    "/ifta": UserRole.ACCOUNTANT,
    "/settings": UserRole.ADMIN,
    "/analytics": UserRole.ADMIN
}

//
// ——— 3) The actual middleware ———
//
export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
    const userId = (await auth()).userId
    const { pathname } = req.nextUrl
    const { getUserRoleInCompany } = await import("@/lib/auth")
    const { UserRole } = await import("@/db/schema")
    // A) Public → do nothing
    if (isPublicRoute(pathname)) {
        return
    }

    // B) Not signed in → redirect to Clerk sign-in
    if (!userId) {
        const signInUrl = new URL("/sign-in", req.url)
        signInUrl.searchParams.set("redirect_url", req.url)
        return NextResponse.redirect(signInUrl)
    }

    // C) Signed in + non-public → enforce company selection
    const selectedCompany = req.cookies.get("selectedCompany")?.value
    const companyId = selectedCompany ? parseInt(selectedCompany, 10) : NaN
    if (!selectedCompany || isNaN(companyId)) {
        return NextResponse.redirect(new URL("/company-selection", req.url))
    }

    // D) Route-level RBAC
    for (const [prefix, minRole] of Object.entries(routeRoles)) {
        if (pathname.startsWith(prefix)) {
            try {
                const role = await getUserRoleInCompany(userId, companyId)
                const isAdminOrOwner = [UserRole.ADMIN, UserRole.OWNER].includes(role)
                if (!(isAdminOrOwner || role === minRole)) {
                    return NextResponse.redirect(new URL("/unauthorized", req.url))
                }
            } catch {
                // e.g. user not in company
                return NextResponse.redirect(new URL("/unauthorized", req.url))
            }
        }
    }

    // E) If we reach here, request is allowed
})

export const config = {
    // Run on all pages & API routes except Next.js internals & static assets
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
