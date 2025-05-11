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
import type { LoadWithRelations } from "@/lib/actions/load-actions"

// Redefine types to match DispatchBoard expectations
interface Driver {
    id: string
    firstName: string
    lastName: string
    status: string
    email?: string
    phone?: string
}

interface Vehicle {
    id: string
    unitNumber: string
    make: string
    model: string
    year: number
    status: string
    type: string
}

interface Load {
    id: string
    referenceNumber: string
    status: string
    customerName: string
    originCity: string
    originState: string
    destinationCity: string
    destinationState: string
    pickupDate: Date
    deliveryDate: Date
    driver?: {
        id: string
        firstName: string
        lastName: string
    } | null
    vehicle?: {
        id: string
        unitNumber: string
    } | null
    trailer?: {
        id: string
        unitNumber: string
    } | null
    commodity: string
    weight: number
    rate: number
    miles: number
}

export default function DispatchPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [loads, setLoads] = useState<Load[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const { organization } = useAuth()

    useEffect(() => {
        async function fetchData() {
            if (!organization?.id) return

            try {
                setIsLoading(true)

                // Fetch loads using our server action
                const loadsResult = await getLoadsForCompany(organization.id)

                if (loadsResult.success) {
                    // Transform data to match expected format for DispatchBoard
                    const formattedLoads = (loadsResult.data as LoadWithRelations[]).map(load => ({
                        id: load.id,
                        referenceNumber: load.referenceNumber || "",
                        status: load.status || "pending",
                        customerName: load.customerName || "",
                        originCity: load.originCity || "",
                        originState: load.originState || "",
                        destinationCity: load.destinationCity || "",
                        destinationState: load.destinationState || "",
                        pickupDate: load.pickupDate ? new Date(load.pickupDate) : new Date(),
                        deliveryDate: load.deliveryDate ? new Date(load.deliveryDate) : new Date(),
                        driver: load.driver
                            ? {
                                  id: load.driver.id,
                                  firstName: load.driver.firstName,
                                  lastName: load.driver.lastName
                              }
                            : null,
                        vehicle:
                            load.vehicle !== undefined
                                ? load.vehicle
                                    ? { id: load.vehicle.id, unitNumber: load.vehicle.unitNumber }
                                    : null
                                : null,
                        trailer:
                            load.trailer !== undefined
                                ? load.trailer
                                    ? { id: load.trailer.id, unitNumber: load.trailer.unitNumber }
                                    : null
                                : null,
                        commodity: load.commodity || "",
                        weight: Number(load.weight) || 0,
                        rate: Number(load.rate) || 0,
                        miles: Number(load.miles) || 0
                    }))
                    setLoads(formattedLoads)

                    // Extract unique drivers from loads for now
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
                    const uniqueVehicles = new Map<string, Vehicle>()
                    formattedLoads.forEach(load => {
                        if (load.vehicle) {
                            uniqueVehicles.set(load.vehicle.id, {
                                id: load.vehicle.id,
                                unitNumber: load.vehicle.unitNumber,
                                make: "",
                                model: "",
                                year: 0,
                                status: "active",
                                type: "tractor"
                            })
                        }
                        if (load.trailer) {
                            uniqueVehicles.set(load.trailer.id, {
                                id: load.trailer.id,
                                unitNumber: load.trailer.unitNumber,
                                make: "",
                                model: "",
                                year: 0,
                                status: "active",
                                type: "trailer"
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
                setLoads([])
                setDrivers([])
                setVehicles([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [organization?.id])

    if (!organization) {
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
                <DispatchBoard drivers={drivers} vehicles={vehicles} loads={loads} />
            )}
        </DashboardShell>
    )
}
