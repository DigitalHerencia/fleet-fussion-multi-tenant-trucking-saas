import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IFTA_TAX_RATES } from "@/lib/constants/ifta-tax-rates"

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

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
