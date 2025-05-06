"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Loader2 } from "lucide-react"

interface Load {
  id: string
  referenceNumber: string
  customerName: string
  status: string
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  pickupDate: string
  deliveryDate: string
}

export default function CompanyLoadsPage() {
  const { companyId } = useParams() as { companyId: string }
  const [company, setCompany] = useState<any>(null)
  const [loads, setLoads] = useState<Load[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch company data
        const companyRes = await fetch(`/api/companies/${companyId}`)
        if (!companyRes.ok) throw new Error("Failed to fetch company")
        const companyData = await companyRes.json()
        setCompany(companyData)
        
        // In a real app, you'd fetch loads specific to this company
        // For now, we're using mock data
        const mockLoads: Load[] = [
          {
            id: "1",
            referenceNumber: "L-10045",
            customerName: "ABC Shipping",
            status: "completed",
            originCity: "Chicago",
            originState: "IL",
            destinationCity: "Indianapolis",
            destinationState: "IN",
            pickupDate: "2025-04-15T08:00:00Z",
            deliveryDate: "2025-04-15T16:00:00Z"
          },
          {
            id: "2",
            referenceNumber: "L-10046",
            customerName: "XYZ Logistics",
            status: "in-transit",
            originCity: "Detroit",
            originState: "MI",
            destinationCity: "Cleveland",
            destinationState: "OH",
            pickupDate: "2025-04-25T09:00:00Z",
            deliveryDate: "2025-04-25T17:00:00Z"
          }
        ]
        setLoads(mockLoads)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchData()
    }
  }, [companyId])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!company) {
    return <div>Company not found. Please check the URL or select a different company.</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading={`${company.name} Loads`} 
        text="Manage and track all your shipments" 
      />
      
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium">Ref #</th>
              <th className="p-2 text-left font-medium">Customer</th>
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-left font-medium">Origin</th>
              <th className="p-2 text-left font-medium">Destination</th>
              <th className="p-2 text-left font-medium">Pickup</th>
              <th className="p-2 text-left font-medium">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => (
              <tr key={load.id} className="border-b">
                <td className="p-2">{load.referenceNumber}</td>
                <td className="p-2">{load.customerName}</td>
                <td className="p-2 capitalize">{load.status}</td>
                <td className="p-2">{`${load.originCity}, ${load.originState}`}</td>
                <td className="p-2">{`${load.destinationCity}, ${load.destinationState}`}</td>
                <td className="p-2">{new Date(load.pickupDate).toLocaleDateString()}</td>
                <td className="p-2">{new Date(load.deliveryDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {loads.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-muted-foreground">
                  No loads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}