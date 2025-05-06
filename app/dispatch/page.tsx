"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function DispatchPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { company } = useAuth()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!company) {
    return <div className="p-4">Company not found. Please create a company first.</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dispatch Board" text="Manage and track your loads">
        <Link href="/dispatch/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Load
          </Button>
        </Link>
      </DashboardHeader>
      {isLoading ? (
        <DispatchSkeleton />
      ) : (
        <DispatchBoard loads={[]} drivers={[]} vehicles={[]} />
      )}
    </DashboardShell>
  )
}
