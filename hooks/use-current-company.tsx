"use client"

import { useCompany } from "../context/company-context"

/**
 * Custom hook to access the currently active company in the multi-tenant application
 *
 * @returns Object containing the current company ID and related company data
 * 
 * @example
 * ```tsx
 * const { companyId } = useCurrentCompany();
 * // Use companyId in component logic or server actions
 * ```
 * 
 * This hook is part of the multi-tenant pattern and should be used
 * in client components that need to access or filter data by company.
 */
export function useCurrentCompany() {
    const { companyId } = useCompany();
    // Fetch or select company data based on companyId if needed
    return { companyId };
}
