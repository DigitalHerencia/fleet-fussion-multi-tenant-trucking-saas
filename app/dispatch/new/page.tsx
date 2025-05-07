"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LoadForm } from "@/components/dispatch/load-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { getDriversForCompany, getVehiclesForCompany } from "@/lib/actions/load-actions"

export default function NewLoadPage() {
    const { company } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [drivers, setDrivers] = useState([])
    const [vehicles, setVehicles] = useState([])

    useEffect(() => {
        async function fetchData() {
            if (!company?.id) return
            setIsLoading(true)
            try {
                const [driversRes, vehiclesRes] = await Promise.all([
                    getDriversForCompany(company.id),
                    getVehiclesForCompany(company.id)
                ])
                setDrivers(driversRes.success ? driversRes.data : [])
                setVehicles(vehiclesRes.success ? vehiclesRes.data : [])
            } catch (error) {
                setDrivers([])
                setVehicles([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [company?.id])

    if (!company) {
        return <div>Company not found. Please create a company first.</div>
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Create New Load" text="Enter the details for a new load" />
            {isLoading ? (
                <div className="space-y-4 mt-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : (
                <div className="mt-6">
                    <LoadForm drivers={drivers} vehicles={vehicles} />
                </div>
            )}
        </DashboardShell>
    )
}
