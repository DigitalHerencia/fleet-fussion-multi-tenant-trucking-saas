import type React from "react"
import { PublicNav } from "@/components/shared/public-nav"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
