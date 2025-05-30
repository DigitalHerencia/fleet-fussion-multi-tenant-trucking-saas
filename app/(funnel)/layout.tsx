import type React from "react"
import { PublicNav } from "@/components/shared/public-nav"
import { requireAuth } from '@/lib/auth/auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
