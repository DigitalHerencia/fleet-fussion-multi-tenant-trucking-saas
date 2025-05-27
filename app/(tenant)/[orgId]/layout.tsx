"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { PageHeader } from "@/components/ui/page-header"
import { MainNav } from "@/components/shared/main-nav"
import { MobileNav } from "@/components/shared/mobile-nav"
import { useState } from "react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (isMobile) {
    return (
      <div className="min-h-screen bg-zinc-600">
        <header className="fixed top-0 left-0 w-full z-50 border-b bg-zinc-800 border-black shadow-lg">
          <PageHeader />
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
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shadow-lg flex flex-col ${sidebarCollapsed ? "w-16" : "w-72"}`}
      >
        <MainNav collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </aside>
      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <header
          className="fixed top-0 right-0 z-50 h-16 border-b bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-border))] shadow-lg flex items-center"
          style={{ left: sidebarWidth }}
        >
          <PageHeader />
        </header>
        <main className="flex-1 pt-20 p-8 md:p-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
