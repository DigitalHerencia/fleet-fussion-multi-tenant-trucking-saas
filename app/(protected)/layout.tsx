"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { PageHeader } from "@/components/ui/page-header"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800">
        <header className="sticky top-0 z-50 w-full border-b bg-zinc-800 border-black">
          <PageHeader />
        </header>
        <MobileNav />
        <main className="p-4 md:p-8 max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800">
      {/* Sidebar */}
      <MainNav />
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 w-full border-b bg-zinc-800 border-black">
          <PageHeader />
        </header>
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
