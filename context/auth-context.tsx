"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useOrganization, useUser, useAuth as useClerkAuth, RedirectToSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Company interface for multi-tenant TMS SaaS
export interface Company {
    id: string
    name: string
    dotNumber: string
    mcNumber: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email: string
    logoUrl: string | null
    primaryColor: string
    isActive: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface AuthContextType {
    company: Company | null
    isLoading: boolean
    user: ReturnType<typeof useUser>["user"]
    organization: ReturnType<typeof useOrganization>["organization"]
    signOut: () => Promise<void>
    isSignedIn: boolean
    isOrgSelected: boolean
    redirectToSignIn: (redirectUrl?: string) => void
}

// Default company when none is available
const defaultCompany: Company = {
    id: "company-default",
    name: "Your Company Name",
    dotNumber: "",
    mcNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    logoUrl: null,
    primaryColor: "#0f766e",
    isActive: true
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [company, setCompany] = useState<Company | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
    const { signOut } = useClerkAuth()
    const router = useRouter()
    const isOrgSelected = !!organization?.id

    // Custom redirect to sign-in that uses our custom sign-in page
    const redirectToSignIn = (redirectUrl?: string) => {
        const baseUrl = "/sign-in"
        const url = redirectUrl
            ? `${baseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`
            : baseUrl
        router.push(url)
    }

    // Load company data when organization is available
    useEffect(() => {
        const loadCompanyData = async () => {
            if (!organization || !user || !isUserLoaded || !isOrgLoaded) {
                if (isUserLoaded && isOrgLoaded) {
                    setIsLoading(false) // Only stop loading when we know auth is loaded
                }
                return
            }

            try {
                // Fetch real company data from the API
                const res = await fetch(`/api/companies/${organization.id}`)
                if (!res.ok) throw new Error("Company lookup failed")
                const companyData = await res.json()

                setCompany(companyData)
            } catch (error) {
                console.error("Error loading company data:", error)
                setCompany(defaultCompany)
            } finally {
                setIsLoading(false)
            }
        }

        if (isUserLoaded && isOrgLoaded) {
            loadCompanyData()
        }
    }, [organization, user, isUserLoaded, isOrgLoaded])

    return (
        <AuthContext.Provider
            value={{
                company,
                isLoading,
                user,
                organization,
                signOut,
                isSignedIn: !!isSignedIn,
                isOrgSelected,
                redirectToSignIn
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
