"use client";

import { useState, useEffect, type ReactNode } from "react";

type HydrationSafeProps = {
  children: ReactNode;
  /**
   * Content to display during server-side rendering and initial hydration
   * If not provided, nothing will be rendered until client-side hydration completes
   */
  fallback?: ReactNode;
  /**
   * Whether to skip rendering on server - use this for truly client-only components
   * that should never render on the server
   */
  skipSSR?: boolean;
};

/**
 * Wrapper component that prevents hydration mismatch warnings by
 * only rendering its children after hydration is complete.
 *
 * @example
 * // For date/time displays that vary between server and client
 * <HydrationSafe fallback="Loading...">
 *   <span>{new Date().toLocalString()}</span>
 * </HydrationSafe>
 *
 * // For components that should only render client-side
 * <HydrationSafe skipSSR>
 *   <DynamicClientComponent />
 * </HydrationSafe>
 */
export function HydrationSafe({
  children,
  fallback,
  skipSSR = false,
}: HydrationSafeProps) {
  // Start with hydrated false during SSR, early client render
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // If skipSSR is true and we're not hydrated, render nothing (never SSR)
  if (skipSSR && !hydrated) return null;
  // If not hydrated, render fallback if provided
  if (!hydrated) return fallback ?? null;
  // Only render children after hydration
  return <>{children}</>;
}
