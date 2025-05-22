"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

interface User {
  id: string
  name: string
  email: string
  role: string
}

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
  user: User | null
  company: Company | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Mock data
const mockUser: User = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "admin",
}

const mockCompany: Company = {
  id: "company-1",
  name: "C & J Express Inc.",
  dotNumber: "1565942",
  mcNumber: "580454",
  address: "710 Eagle Dr",
  city: "Anthony",
  state: "NM",
  zip: "88021",
  phone: "555-123-4567",
  email: "info@cjexpress.com",
  logoUrl: null,
  primaryColor: "#0f766e",
  isActive: true,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const userCookie = Cookies.get("fleetfusion_user")
      if (userCookie) {
        try {
          setUser(JSON.parse(userCookie))
          setCompany(mockCompany)
        } catch (e) {
          console.error("Error parsing user cookie:", e)
          Cookies.remove("fleetfusion_user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication - only accept test/test
    if (username === "test" && password === "test") {
      setUser(mockUser)
      setCompany(mockCompany)

      // Set cookie with 7 day expiration
      Cookies.set("fleetfusion_user", JSON.stringify(mockUser), {
        expires: 7,
        path: "/",
        sameSite: "lax",
      })

      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setCompany(null)
    Cookies.remove("fleetfusion_user", { path: "/" })
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, company, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
