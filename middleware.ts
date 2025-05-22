import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/api/public(.*)", "/pricing", "/about", "/contact"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("(.*)")) {
      const baseRoute = route.replace("(.*)", "")
      return pathname === baseRoute || pathname.startsWith(baseRoute)
    }
    return pathname === route
  })

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const authCookie = request.cookies.get("fleetfusion_user")

  if (!authCookie?.value) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)"],
}
