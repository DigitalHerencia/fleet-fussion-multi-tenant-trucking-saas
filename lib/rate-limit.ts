/**
 * API rate limiting middleware for Next.js
 * Helps prevent abuse and protects API endpoints from excessive requests
 */

import { NextRequest, NextResponse } from "next/server"

// Simple in-memory store for rate limiting
// Note: In production with multiple instances, use Redis or similar
const ipRequestStore = new Map()
// Clean up old entries periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, { timestamp }] of ipRequestStore.entries()) {
        if (now - timestamp > 60 * 1000) {
            // Remove entries older than 1 minute
            ipRequestStore.delete(key)
        }
    }
}, 60 * 1000) // Run cleanup every minute

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 60 // Number of requests allowed
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // Time window in milliseconds (1 minute)

export function rateLimit(req: NextRequest) {
    // Skip rate limiting for non-API routes or trusted sources
    if (!req.url.includes("/api/")) {
        return NextResponse.next()
    }
    // Get IP address
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const key = `${ip}:${req.url}`

    // Get current timestamp
    const now = Date.now()

    // Initialize or get current request count for this IP
    const currentRequests = ipRequestStore.get(key) || { count: 0, timestamp: now }

    // Reset count if outside the window
    if (now - currentRequests.timestamp > RATE_LIMIT_WINDOW_MS) {
        currentRequests.count = 0
        currentRequests.timestamp = now
    }

    // Increment count and update store
    currentRequests.count++
    ipRequestStore.set(key, currentRequests)

    // Check if rate limit exceeded
    if (currentRequests.count > RATE_LIMIT_REQUESTS) {
        return NextResponse.json(
            { error: "Too many requests", message: "Please try again later." },
            { status: 429, headers: { "Retry-After": "60" } }
        )
    }

    // Add rate-limit headers to response
    const response = NextResponse.next()
    const headers = new Headers(response.headers)
    headers.set("X-RateLimit-Limit", RATE_LIMIT_REQUESTS.toString())
    headers.set(
        "X-RateLimit-Remaining",
        Math.max(0, RATE_LIMIT_REQUESTS - currentRequests.count).toString()
    )
    headers.set(
        "X-RateLimit-Reset",
        Math.ceil((currentRequests.timestamp + RATE_LIMIT_WINDOW_MS) / 1000).toString()
    )

    return NextResponse.next({
        headers
    })
}
