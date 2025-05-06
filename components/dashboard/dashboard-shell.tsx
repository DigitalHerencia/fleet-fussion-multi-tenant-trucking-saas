import type React from "react"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <MainNav />
          <div className="flex items-center gap-2 md:gap-4">
            <UserNav />
            <MobileNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-4 md:py-6 px-4 md:px-6">{children}</main>
    </div>
  )
}
