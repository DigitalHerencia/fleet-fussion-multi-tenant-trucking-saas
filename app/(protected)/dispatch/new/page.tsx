"use client"

import { useEffect, useState } from "react"
import { LoadForm } from "@/components/dispatch/load-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"

// Mock data
const mockDrivers = [
  {
    id: "f81d4e2e-bcf2-11e6-869b-7df92533d2db",
    firstName: "John",
    lastName: "Smith",
  },
  {
    id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    firstName: "Maria",
    lastName: "Garcia",
  },
  {
    id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dd",
    firstName: "Robert",
    lastName: "Johnson",
  },
  {
    id: "f81d4e2e-bcf2-11e6-869b-7df92533d2de",
    firstName: "Sarah",
    lastName: "Williams",
  },
]

const mockVehicles = [
  {
    id: "d81d4e2e-bcf2-11e6-869b-7df92533d2db",
    unitNumber: "T-101",
    type: "tractor",
  },
  {
    id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    unitNumber: "T-102",
    type: "tractor",
  },
  {
    id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dd",
    unitNumber: "T-103",
    type: "tractor",
  },
  {
    id: "e81d4e2e-bcf2-11e6-869b-7df92533d2db",
    unitNumber: "TR-201",
    type: "trailer",
  },
  {
    id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    unitNumber: "TR-202",
    type: "trailer",
  },
  {
    id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dd",
    unitNumber: "TR-203",
    type: "trailer",
  },
]

export default function NewLoadPage() {
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
          <LoadForm drivers={mockDrivers} vehicles={mockVehicles} />
        </div>
    </>
  )
}
