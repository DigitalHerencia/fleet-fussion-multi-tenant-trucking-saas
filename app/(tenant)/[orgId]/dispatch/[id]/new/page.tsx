"use client"

import { useEffect, useState } from "react"
import { LoadForm } from "@/components/dispatch/load-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/context"
import { useParams } from "next/navigation"

export default function NewLoadPage() {
  const authContext = useAuth();
  const params = useParams();
  const orgId = params?.orgId as string;
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Simple check for authentication/organization access
  if (!authContext || !orgId) {
    return <div>Please ensure you are logged in and have access to this organization.</div>
  }

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mt-6">
      <LoadForm drivers={[]} vehicles={[]} />
    </div>
  )
}
