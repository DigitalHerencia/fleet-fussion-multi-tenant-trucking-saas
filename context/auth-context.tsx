"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useUser, useOrganization } from "@clerk/nextjs"

export interface AuthContextType {
    user: ReturnType<typeof useUser>["user"]
    organization: ReturnType<typeof useOrganization>["organization"] | null
    isSignedIn: boolean
    isOrgSelected: boolean
    orgId: string | null
    userId: string | null
    orgRole: string | null
    redirectToSignIn: (redirectUrl?: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user, isSignedIn: isUserSignedIn } = useUser()
    const { organization } = useOrganization()
    const router = useRouter()
    const isOrgSelected = !!organization?.id
    const orgId = organization?.id ?? null
    const userId = user?.id ?? null
    // Clerk org role is available on user.organizationMemberships
    const orgRole = user?.organizationMemberships?.find(m => m.organization.id === orgId)?.role ?? null

    const redirectToSignIn = (redirectUrl?: string) => {
        const baseUrl = "/sign-in"
        const url = redirectUrl
            ? `${baseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`
            : baseUrl
        router.push(url)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                organization,
                isSignedIn: !!isUserSignedIn,
                isOrgSelected,
                orgId,
                userId,
                orgRole,
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
