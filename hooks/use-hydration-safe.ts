"use client"

import { useState, useEffect } from "react"

/**
 * Hook to safely handle values that might cause hydration mismatches
 * particularly useful for dates, times, and browser-specific information
 *
 * @example
 * // For date formatting that should only happen client-side
 * function FormattedDate({ date }: { date: Date }) {
 *   const formattedDate = useHydrationSafeValue(
 *     () => date.toLocaleDateString(),
 *     "Loading..."
 *   )
 *   return <span>{formattedDate}</span>
 * }
 */
export function useHydrationSafeValue<T>(getValue: () => T, initialValue: T): T {
    const [value, setValue] = useState<T>(initialValue)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
        setValue(getValue())
    }, [getValue])

    return isHydrated ? value : initialValue
}
