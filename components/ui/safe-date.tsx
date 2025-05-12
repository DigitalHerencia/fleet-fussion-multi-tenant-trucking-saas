"use client"

import { useHydrationSafeValue } from "../../hooks/use-hydration-safe"

interface SafeDateProps {
    date: string | Date
    format?: "short" | "long" | "numeric" | "relative"
    fallback?: string
    className?: string
}

/**
 * A component for safely displaying dates without hydration warnings
 *
 * @example
 * // Basic usage
 * <SafeDate date="2025-05-01" />
 *
 * // With formatting options
 * <SafeDate date={new Date()} format="long" />
 *
 * // With custom fallback
 * <SafeDate date={expiryDate} fallback="Loading..." />
 */
export function SafeDate({ date, format = "short", fallback = "—", className }: SafeDateProps) {
    const dateObj = typeof date === "string" ? new Date(date) : date

    const formattedDate = useHydrationSafeValue(() => {
        if (isNaN(dateObj.getTime())) {
            return fallback
        }

        switch (format) {
            case "long":
                return dateObj.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
            case "numeric":
                return dateObj.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                })
            case "relative":
                return formatRelative(dateObj)
            default:
                return dateObj.toLocaleDateString()
        }
    }, fallback)

    return <span className={className}>{formattedDate}</span>
}

/**
 * Format a date in a relative way (e.g., "2 days ago", "in 3 months")
 */
function formatRelative(date: Date): string {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `in ${diffDays} days`
}
