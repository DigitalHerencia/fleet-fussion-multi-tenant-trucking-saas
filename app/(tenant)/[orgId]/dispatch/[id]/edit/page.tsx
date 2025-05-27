"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { LoadForm } from "@/components/dispatch/load-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/context"

// Add index signature to allow string indexing
export type Dispatches = Record<string, {
  id: string;
  referenceNumber: string;
  status: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerEmail: string;
  // ...other properties...
  trailerId: string;
}>;

export default function EditLoadPage() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [load, setLoad] = useState<any>(null)
  const { company } = useAuth()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      if (typeof id === "string" && load[id]) {
        setLoad(load[id])
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [id])

  if (!company) {
    return <div>Company not found. Please create a company first.</div>
  }

  return (
    <>
    <div className="space-y-4 mt-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
    <div className="mt-6">
      <LoadForm drivers={ [] } vehicles={ [] } load={ load } />
    </div>
    <div className="mt-6">
      Load not found
      </div>
    </>
  )
}

