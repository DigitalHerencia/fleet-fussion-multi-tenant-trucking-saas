"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { 
  useUser, 
  useOrganization, 
  useAuth as useClerkAuth, 
  SignOutButton,
  SignInButton,
  OrganizationSwitcher
} from "@clerk/nextjs"

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
    user: ReturnType<typeof useUser>['user']
    organization: ReturnType<typeof useOrganization>['organization'] | null
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
    const { user, isSignedIn: isUserSignedIn } = useUser()
    const { organization } = useOrganization()
    const { signOut: clerkSignOut } = useClerkAuth()
    const router = useRouter()
    const isOrgSelected = !!organization?.id

    // SignOut function using Clerk
    const signOut = async () => {
        await clerkSignOut()
        router.push('/sign-in')
    }

    // Custom redirect to sign-in using Clerk
    const redirectToSignIn = (redirectUrl?: string) => {
        const baseUrl = "/sign-in"
        const url = redirectUrl
            ? `${baseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`
            : baseUrl
        router.push(url)
    }

    // Load company data when organization changes
    useEffect(() => {
        const loadCompanyData = async () => {
            if (!organization?.id) {
                setCompany(null)
                setIsLoading(false)
                return
            }

            try {
                const res = await fetch(`/api/companies?clerkOrgId=${organization.id}`)
                if (res.ok) {
                    const companyData = await res.json()
                    setCompany(companyData)
                } else {
                    // If company doesn't exist yet, use default
                    setCompany({
                        ...defaultCompany,
                        name: organization.name || defaultCompany.name
                    })
                }
            } catch (error) {
                console.error("Error loading company data:", error)
                setCompany({
                    ...defaultCompany,
                    name: organization?.name || defaultCompany.name
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (isUserSignedIn) {
            loadCompanyData()
        } else {
            setIsLoading(false)
        }
    }, [organization?.id, isUserSignedIn]);    return (
        <AuthContext.Provider
            value={{
                company,
                isLoading,
                user,
                organization,
                signOut,
                isSignedIn: !!isUserSignedIn,
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
