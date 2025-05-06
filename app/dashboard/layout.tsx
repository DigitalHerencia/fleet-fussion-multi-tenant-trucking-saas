import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { companies } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the authenticated user's organization ID
  const { userId, orgId } = await auth()
  
  // If user is authenticated but has no organization, redirect to onboarding
  if (userId && !orgId) {
    redirect("/onboarding")
  }
  
  // If user is authenticated and has an organization
  if (userId && orgId) {
    // Check if the company exists for this organization
    const company = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, orgId),
    })
    
    // If no company is found, redirect to onboarding
    if (!company) {
      redirect("/onboarding")
    }
  }
  
  return <ProtectedRoute>{children}</ProtectedRoute>
}
