"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useUser, useOrganization } from "@clerk/nextjs"

export interface AuthContextType {
    user: ReturnType<typeof useUser>["user"]
    organization: ReturnType<typeof useOrganization>["organization"] | null
    isSignedIn: boolean
    isOrgSelected: boolean
    redirectToSignIn: (redirectUrl?: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user, isSignedIn: isUserSignedIn } = useUser()
    const { organization } = useOrganization()
    const router = useRouter()
    const isOrgSelected = !!organization?.id

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
