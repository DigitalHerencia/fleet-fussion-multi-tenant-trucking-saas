"use client"

import { useState, useEffect, useMemo } from "react"
import { safeClientSide } from "../lib/hydration"

type StorageType = "localStorage" | "sessionStorage"

/**
 * Hook for safely using localStorage/sessionStorage without hydration mismatches
 *
 * @example
 * const [value, setValue] = useSafeStorage('theme', 'light')
 * // Later
 * setValue('dark')
 */
export function useSafeStorage<T>(
    key: string,
    initialValue: T,
    storageType: StorageType = "localStorage"
): [T, (value: T) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue)
    const [isHydrated, setIsHydrated] = useState(false)

    // Get from storage on mount, but only client-side
    useEffect(() => {
        try {
            const storage = window[storageType]
            const item = storage.getItem(key)
            if (item) {
                setStoredValue(JSON.parse(item))
            }
            setIsHydrated(true)
        } catch (error) {
            console.warn(`Error reading from ${storageType}:`, error)
        }
    }, [key, storageType])

    // Return a wrapped version of useState's setter function that
    // persists the new value to storage
    const setValue = useMemo(
        () => (value: T) => {
            if (!isHydrated) return // Don't try to set before hydration

            try {
                // Save state
                setStoredValue(value)

                // Save to storage
                safeClientSide(() => {
                    const storage = window[storageType]
                    storage.setItem(key, JSON.stringify(value))
                })
            } catch (error) {
                console.warn(`Error writing to ${storageType}:`, error)
            }
        },
        [key, storageType, isHydrated]
    )

    return [storedValue, setValue]
}
