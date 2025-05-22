"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LoadForm } from "@/components/dispatch/load-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"

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

// Mock load data
const mockLoads: Record<string, {
  id: string;
  referenceNumber: string;
  status: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerEmail: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  pickupDate: string;
  deliveryDate: string;
  commodity: string;
  weight: number;
  rate: number;
  miles: number;
  notes: string;
  driverId: string;
  vehicleId: string;
  trailerId: string;
}> = {
  "a81d4e2e-bcf2-11e6-869b-7df92533d2db": {
    id: "a81d4e2e-bcf2-11e6-869b-7df92533d2db",
    referenceNumber: "L-1001",
    status: "in_transit",
    customerName: "ABC Distributors",
    customerContact: "Jane Doe",
    customerPhone: "555-987-6543",
    customerEmail: "jane.doe@abcdist.com",
    originAddress: "123 Shipping Lane",
    originCity: "El Paso",
    originState: "TX",
    originZip: "79901",
    destinationAddress: "456 Receiving Blvd",
    destinationCity: "Albuquerque",
    destinationState: "NM",
    destinationZip: "87102",
    pickupDate: "2025-05-01T08:00",
    deliveryDate: "2025-05-02T14:00",
    commodity: "Electronics",
    weight: 15000,
    rate: 2500,
    miles: 267,
    notes: "High-value shipment, requires signature",
    driverId: "f81d4e2e-bcf2-11e6-869b-7df92533d2db",
    vehicleId: "d81d4e2e-bcf2-11e6-869b-7df92533d2db",
    trailerId: "e81d4e2e-bcf2-11e6-869b-7df92533d2db",
  },
  "a81d4e2e-bcf2-11e6-869b-7df92533d2dc": {
    id: "a81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    referenceNumber: "L-1002",
    status: "assigned",
    customerName: "XYZ Logistics",
    customerContact: "John Smith",
    customerPhone: "555-123-4567",
    customerEmail: "john.smith@xyzlogistics.com",
    originAddress: "789 Pickup Road",
    originCity: "Las Cruces",
    originState: "NM",
    originZip: "88001",
    destinationAddress: "321 Delivery Street",
    destinationCity: "Phoenix",
    destinationState: "AZ",
    destinationZip: "85001",
    pickupDate: "2025-05-02T10:00",
    deliveryDate: "2025-05-03T16:00",
    commodity: "Auto Parts",
    weight: 22000,
    rate: 3200,
    miles: 390,
    notes: "Delivery window: 2-5 PM",
    driverId: "f81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    vehicleId: "d81d4e2e-bcf2-11e6-869b-7df92533d2dc",
    trailerId: "e81d4e2e-bcf2-11e6-869b-7df92533d2dc",
  },
}

export default function EditLoadPage() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [load, setLoad] = useState<any>(null)
  const { company } = useAuth()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      if (typeof id === "string" && mockLoads[id]) {
        setLoad(mockLoads[id])
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [id])

  if (!company) {
    return <div>Company not found. Please create a company first.</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Edit Load ${load?.referenceNumber || ""}`} text="Update the load details" />
      {isLoading ? (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : load ? (
        <div className="mt-6">
          <LoadForm drivers={mockDrivers} vehicles={mockVehicles} load={load} />
        </div>
      ) : (
        <div className="mt-6">Load not found</div>
      )}
    </DashboardShell>
  )
}
