"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { getLoadsForCompany } from "@/lib/loads"
import { toast } from "@/components/ui/use-toast"
import type { Load, Driver, Vehicle } from "@/types/types"

export default function DispatchPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [loads, setLoads] = useState<Load[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const { company } = useAuth()

    useEffect(() => {
        async function fetchData() {
            if (!company?.id) return

            try {
                setIsLoading(true)

                // Fetch loads using our server action
                const loadsResult = await getLoadsForCompany(company.id)

                if (loadsResult.success) {
                    // Transform data to match expected format if needed
                    const formattedLoads = loadsResult.data.map((load: Load) => ({
                        ...load,
                        pickupDate: load.pickupDate ? new Date(load.pickupDate) : new Date(),
                        deliveryDate: load.deliveryDate ? new Date(load.deliveryDate) : new Date()
                    }))
                    setLoads(formattedLoads)

                    // Extract unique drivers from loads for now
                    // In a real app, you would fetch all drivers from a driver-specific endpoint
                    const uniqueDrivers = new Map<string, Driver>()
                    formattedLoads.forEach(load => {
                        if (load.driver) {
                            uniqueDrivers.set(load.driver.id, {
                                id: load.driver.id,
                                firstName: load.driver.firstName,
                                lastName: load.driver.lastName,
                                status: "active"
                            })
                        }
                    })
                    setDrivers(Array.from(uniqueDrivers.values()))

                    // Extract unique vehicles from loads for now
                    // In a real app, you would fetch all vehicles from a vehicle-specific endpoint
                    const uniqueVehicles = new Map<string, Vehicle>()
                    formattedLoads.forEach(load => {
                        if (load.vehicle) {
                            uniqueVehicles.set(load.vehicle.id, {
                                id: load.vehicle.id,
                                unitNumber: load.vehicle.unitNumber,
                                type: "tractor",
                                status: "active"
                            })
                        }
                        if (load.trailer) {
                            uniqueVehicles.set(load.trailer.id, {
                                id: load.trailer.id,
                                unitNumber: load.trailer.unitNumber,
                                type: "trailer",
                                status: "active"
                            })
                        }
                    })
                    setVehicles(Array.from(uniqueVehicles.values()))
                } else {
                    console.error("Error fetching loads:", loadsResult.error)
                    toast({
                        title: "Error",
                        description: `Failed to load dispatch data: ${loadsResult.error}`,
                        variant: "destructive"
                    })
                    // Set empty arrays as fallback
                    setLoads([])
                    setDrivers([])
                    setVehicles([])
                }
            } catch (error) {
                console.error("Error in data fetching:", error)
                toast({
                    title: "Error",
                    description: "An unexpected error occurred while loading data",
                    variant: "destructive"
                })
                // Set empty arrays as fallback
                setLoads([])
                setDrivers([])
                setVehicles([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [company?.id])

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
                <DispatchBoard loads={ [] } drivers={ [] } vehicles={ [] } />
            )}
        </DashboardShell>
    )
}
