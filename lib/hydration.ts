export { useHydrationSafeValue } from "@/hooks/use-hydration-safe"
export { HydrationSafe } from "@/components/ui/hydration-safe"
export { SafeDate } from "@/components/ui/safe-date"

/**
 * Formats a utility to detect if code is running on the client
 * Useful for conditional rendering that depends on browser APIs
 */
export const isClient = typeof window !== "undefined"

/**
 * Safely access browser APIs without causing hydration errors
 * @param callback Function that uses browser APIs
 * @returns The result of the callback or undefined if not on client
 */
export function safeClientSide<T>(callback: () => T): T | undefined {
    if (isClient) {
        try {
            return callback()
        } catch (error) {
            console.error("Error in client-side code:", error)
            return undefined
        }
    }
    return undefined
}
