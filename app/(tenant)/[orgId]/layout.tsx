"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { TopNavBar } from "@/components/shared/TopNavBar"
import { MainNav } from "@/components/shared/MainNav"
import { MobileNav } from "@/components/shared/MobileNav"
import { useState } from "react"
import type { UserContext } from "@/types/auth" // <-- Import types

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Use a valid SystemRole value for role
  const userContext: UserContext = {
    organizationId: "demo-org", // Replace with real orgId from session/auth
    userId: "demo-user",        // Replace with real userId from session/auth
    role: "admin",              // Must be a valid SystemRole, not just string
    permissions: [],            // Example: permissions array
    isActive: true,
    name: "Demo User",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    onboardingComplete: true,
    organizationMetadata: {
      subscriptionTier: "free",
      subscriptionStatus: "active",
      maxUsers: 5,
      features: [],
      billingEmail: "",
      createdAt: new Date().toISOString(),
      settings: {
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        distanceUnit: "miles",
        fuelUnit: "gallons",
      },
    },
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="fixed top-0 left-0 w-full z-50 border-b bg-gray-800 border-gray-700 shadow-lg">
          <TopNavBar />
        </header>
        <div className="pt-[64px]"> {/* Height of header */}
          <MobileNav />
          <main className="p-4 md:p-8 max-w-3xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? 64 : 288 // 16px or 72px (w-16/w-72)

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-gray-800 border-r border-gray-700 shadow-lg flex flex-col ${sidebarCollapsed ? "w-16" : "w-72"}`}
      >
        <MainNav
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          userContext={userContext}
        />
      </aside>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50">
        <TopNavBar />
      </header>
      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="flex-1 pt-16 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
