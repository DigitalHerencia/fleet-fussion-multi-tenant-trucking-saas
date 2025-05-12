"use client"

import { useAuth } from "@/context/auth-context"

/**
 * Custom hook to access the currently authenticated user's data
 *
 * @returns Object containing user data and userId from the auth context
 * 
 * @example
 * ```tsx
 * const { user, userId } = useCurrentUser();
 * 
 * if (user) {
 *   // User is authenticated
 *   console.log(`Hello, ${user.firstName}`);
 * }
 * ```
 * 
 * This hook abstracts the auth implementation details and provides
 * a consistent way to access user data across the application.
 */
export function useCurrentUser() {
    const { user, userId } = useAuth();
    // Optionally, add more logic or selectors here
    return { user, userId };
}
