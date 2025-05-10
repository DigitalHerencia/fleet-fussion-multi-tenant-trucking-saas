/**
 * Helper functions to set up caching strategy for the application
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface CacheConfig {
    maxAge: number // Cache duration in seconds
    staleWhileRevalidate?: number // Additional time to serve stale content while revalidating
    isPublic?: boolean // Whether the response can be cached by CDNs/proxies
}

/**
 * Sets appropriate cache control headers based on the content type and route
 */
export function setCacheHeaders(request: NextRequest, response: NextResponse) {
    const url = new URL(request.url)
    const pathname = url.pathname
    let cacheConfig: CacheConfig | null = null

    // Static assets (images, fonts, etc.)
    if (pathname.match(/\.(jpe?g|png|gif|svg|webp|avif|ico|woff2?|ttf|otf|css)$/)) {
        cacheConfig = {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            staleWhileRevalidate: 60 * 60 * 24, // 1 day
            isPublic: true
        }
    }
    // JavaScript files
    else if (pathname.match(/\.(js|mjs)$/)) {
        cacheConfig = {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            staleWhileRevalidate: 60 * 60, // 1 hour
            isPublic: true
        }
    }
    // API routes that can be cached (e.g. public data)
    else if (pathname.startsWith("/api/public")) {
        cacheConfig = {
            maxAge: 60, // 1 minute
            staleWhileRevalidate: 60 * 10, // 10 minutes
            isPublic: true
        }
    }
    // Dynamic API routes (should not be cached by browsers)
    else if (pathname.startsWith("/api/")) {
        cacheConfig = {
            maxAge: 0, // No caching
            isPublic: false
        }
    }
    // Public marketing pages
    else if (["/about", "/features", "/pricing", "/services"].includes(pathname)) {
        cacheConfig = {
            maxAge: 60 * 60, // 1 hour
            staleWhileRevalidate: 60 * 60, // 1 hour
            isPublic: true
        }
    }
    // Homepage
    else if (pathname === "/") {
        cacheConfig = {
            maxAge: 60 * 5, // 5 minutes
            staleWhileRevalidate: 60 * 15, // 15 minutes
            isPublic: true
        }
    }
    // Authenticated pages (should not be cached by browsers or CDNs)
    else if (request.headers.get("cookie")?.includes("__session")) {
        cacheConfig = {
            maxAge: 0,
            isPublic: false
        }
    }
    // Other pages - default to light caching
    else {
        cacheConfig = {
            maxAge: 0,
            isPublic: false
        }
    }

    if (cacheConfig) {
        const headers = new Headers(response.headers)
        const directives = []

        directives.push(cacheConfig.isPublic ? "public" : "private")
        directives.push(`max-age=${cacheConfig.maxAge}`)

        if (cacheConfig.staleWhileRevalidate) {
            directives.push(`stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`)
        }

        headers.set("Cache-Control", directives.join(", "))

        return headers
    }

    return new Headers(response.headers)
}
