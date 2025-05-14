/**
 * Security headers configuration for Next.js middleware
 * These headers help protect the application from various web vulnerabilities
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function addSecurityHeaders(
  request: NextRequest,
  response: NextResponse,
) {
  // Define CSP directives
  const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "driving-gelding-14.clerk.accounts.dev",
      "https://*.clerk.accounts.dev",
      "https://*.ngrok-free.app",
      "https://vercel.live"
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "images.clerk.dev",
      "https://img.clerk.com",
      "https://www.gravatar.com",
      "*.cloudinary.com",
      "https://fleet-fusion.vercel.app",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://api.clerk.dev",
      "https://*.clerk.accounts.dev",
      "https://driving-gelding-14.clerk.accounts.dev",
      "https://fleet-fusion.vercel.app",
      "vitals.vercel-insights.com",
      "https://clerk.accounts",
      "https://clerk-telemetry.com"
    ],
    "frame-src": ["'self'", "driving-gelding-14.clerk.accounts.dev"],
    "object-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
  };

  // Build the CSP header value
  const cspHeaderValue = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");

  // Set security headers
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", cspHeaderValue);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "1; mode=block");

  // Only in production, set HSTS header
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // If Permissions-Policy is needed
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  return headers;
}
