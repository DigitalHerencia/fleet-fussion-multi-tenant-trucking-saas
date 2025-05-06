"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { 
  useOrganization, 
  useUser, 
  useAuth as useClerkAuth} from "@clerk/nextjs"

interface Company {
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
}

interface AuthContextType {
  company: Company | null
  isLoading: boolean
  user: any
  signIn: () => void
  signOut: () => void
  isSignedIn: boolean
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
  isActive: true,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { organization } = useOrganization()
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerkAuth()
  const router = useRouter()

  // Load company data when organization is available
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!organization || !user || !isLoaded) {
        setIsLoading(false)
        return
      }
      
      try {
        // Fetch real company data from the API
        const res = await fetch(`/api/companies/${organization.id}`);
        if (!res.ok) throw new Error("Company lookup failed");
        const companyData = await res.json();
        
        setCompany(companyData)
      } catch (error) {
        console.error("Error loading company data:", error)
        setCompany(defaultCompany)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded) {
      loadCompanyData()
    }
  }, [organization, user, isLoaded])

  // Render appropriate UI based on authentication state
  const handleSignIn = () => {
    // This is just a placeholder - the actual SignInButton component 
    // from Clerk will handle the redirect
  }

  return (
    <AuthContext.Provider 
      value={{ 
        company, 
        isLoading, 
        user, 
        signIn: handleSignIn, 
        signOut, 
        isSignedIn: !!isSignedIn
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
