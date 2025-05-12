import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IFTA_TAX_RATES } from "@/lib/constants/ifta-tax-rates"

/**
 * Formats a date to YYYY-MM-DD string format
 * 
 * @param date - Date to format (Date object or string)
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 * Formats a number as USD currency
 * 
 * @param amount - Numeric amount to format
 * @returns Formatted currency string (e.g., $1,234.56)
 */
export function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
}

/**
 * Utility for combining Tailwind CSS classes with proper deduplication
 * 
 * @param inputs - List of class values to be combined
 * @returns Optimized class string with duplicates removed
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calculates IFTA tax for a jurisdiction based on miles driven and gallons consumed
 * 
 * @param options - Calculation parameters
 * @param options.miles - Miles driven in jurisdiction
 * @param options.gallons - Gallons consumed in jurisdiction
 * @param options.state - State code (e.g., "CA", "TX")
 * @param options.county - Optional county name (special handling for some jurisdictions)
 * @returns Tax calculation result with rates and totals
 */
export function calculateJurisdictionTax({
    miles,
    gallons,
    state,
    county
}: {
    miles: number
    gallons: number
    state: string
    county?: string
}) {
    // Use county-specific rate if in Dona Ana, NM
    let rateKey = state
    if (state === "NM" && county?.toLowerCase() === "dona ana") {
        rateKey = "NM-DA"
    }
    const stateRate = IFTA_TAX_RATES[rateKey] || 0
    const federalRate = IFTA_TAX_RATES.FEDERAL || 0
    const lustRate = IFTA_TAX_RATES.LUST || 0
    const totalRate = stateRate + federalRate + lustRate
    const taxOwed = gallons * totalRate
    return {
        state,
        county,
        gallons,
        miles,
        stateRate,
        federalRate,
        lustRate,
        totalRate,
        taxOwed
    }
}
