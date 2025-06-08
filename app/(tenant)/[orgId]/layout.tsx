"use client"

import { useState } from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { TopNavBar } from "@/components/shared/TopNavBar"
import { MainNav } from "@/components/shared/MainNav"
import { MobileNav } from "@/components/shared/MobileNav"
import { useUserContext } from "@/components/auth/context"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const userContext = useUserContext()
  const orgId = userContext?.organizationId || ""
  const userId = userContext?.userId || ""

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
  const sidebarWidth = sidebarCollapsed ? 80 : 256 // 80px (w-20) or 256px (w-64)

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Navigation Bar */}
      <TopNavBar />
      </header>
      {/* Sidebar */}
        <MainNav
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          orgId={orgId}
          userId={userId}
        />
      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  )
}
