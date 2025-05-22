"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Mock data
const mockCompany = {
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
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "admin",
}

// Get the current authenticated user
export async function getCurrentUser() {
  const userCookie = ( await cookies() ).get("fleetfusion_user")

  if (!userCookie?.value) {
    return null
  }

  try {
    return mockUser
  } catch (error) {
    console.error("Error parsing user cookie:", error)
    return null
  }
}

// Get the current company
export async function getCurrentCompany() {
  const userCookie = ( await cookies() ).get("fleetfusion_user")

  if (!userCookie?.value) {
    return null
  }

  return mockCompany
}

// Check if the user has the required role
export async function checkUserRole(requiredRole: string) {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  return user.role === requiredRole
}

// Require authentication and redirect to login if not authenticated
export async function requireAuth() {
  const userCookie = ( await cookies() ).get("fleetfusion_user")

  if (!userCookie?.value) {
    redirect("/login")
  }

  return { userId: mockUser.id, companyId: mockCompany.id }
}
