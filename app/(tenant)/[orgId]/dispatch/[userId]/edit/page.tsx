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
  const [error, setError] = useState<string | null>(null)
  const { company } = useAuth()

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    setLoad(null)
    // Replace with your actual API endpoint
    fetch(`/api/dispatch/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch load")
        const data = await res.json()
        setLoad(data)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (!company) {
    return <div>Company not found. Please create a company first.</div>
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

  if (error) {
    return <div className="mt-6 text-red-500">Error: {error}</div>
  }

  if (!load) {
    return <div className="mt-6">Load not found</div>
  }

  return (
    <div className="mt-6">
      <LoadForm drivers={[]} vehicles={[]} load={load} />
    </div>
  )
}

