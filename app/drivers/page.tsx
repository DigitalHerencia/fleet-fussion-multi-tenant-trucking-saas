"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DriverCard } from "@/components/drivers/driver-card"
import { DriverDetailsDialog } from "@/components/drivers/driver-details-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { PageHeader } from "@/components/ui/page-header"

// Mock data
const mockDrivers = [
    {
        id: "f81d4e2e-bcf2-11e6-869b-7df92533d2db",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "555-111-2222",
        status: "active",
        licenseNumber: "DL123456",
        licenseState: "NM",
        licenseExpiration: new Date("2026-05-15"),
        medicalCardExpiration: new Date("2025-08-20"),
        hireDate: new Date("2022-03-10"),
        notes: "Experienced driver with hazmat endorsement"
    },
    {
        id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dc",
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@example.com",
        phone: "555-222-3333",
        status: "active",
        licenseNumber: "DL234567",
        licenseState: "TX",
        licenseExpiration: new Date("2025-11-30"),
        medicalCardExpiration: new Date("2025-04-15"),
        hireDate: new Date("2021-06-22"),
        notes: "Team driver capability"
    },
    {
        id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dd",
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@example.com",
        phone: "555-333-4444",
        status: "active",
        licenseNumber: "DL345678",
        licenseState: "AZ",
        licenseExpiration: new Date("2024-09-18"),
        medicalCardExpiration: new Date("2024-12-05"),
        hireDate: new Date("2023-01-15"),
        notes: "Prefers southwest routes"
    },
    {
        id: "f81d4e2e-bcf2-11e6-869b-7df92533d2de",
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "555-444-5555",
        status: "active",
        licenseNumber: "DL456789",
        licenseState: "NM",
        licenseExpiration: new Date("2025-07-22"),
        medicalCardExpiration: new Date("2024-08-30"),
        hireDate: new Date("2022-11-08"),
        notes: "Excellent safety record"
    },
    {
        id: "f81d4e2e-bcf2-11e6-869b-7df92533d2df",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        phone: "555-555-6666",
        status: "inactive",
        licenseNumber: "DL567890",
        licenseState: "CA",
        licenseExpiration: new Date("2026-02-14"),
        medicalCardExpiration: new Date("2025-03-10"),
        hireDate: new Date("2021-09-30"),
        terminationDate: new Date("2023-10-15"),
        notes: "On extended leave"
    }
]

// Mock recent loads
const mockRecentLoads = [
    {
        id: "a81d4e2e-bcf2-11e6-869b-7df92533d2db",
        referenceNumber: "L-1001",
        status: "in_transit",
        originCity: "El Paso",
        originState: "TX",
        destinationCity: "Albuquerque",
        destinationState: "NM",
        pickupDate: new Date("2025-05-01"),
        deliveryDate: new Date("2025-05-02")
    },
    {
        id: "a81d4e2e-bcf2-11e6-869b-7df92533d2dd",
        referenceNumber: "L-1003",
        status: "completed",
        originCity: "Tucson",
        originState: "AZ",
        destinationCity: "El Paso",
        destinationState: "TX",
        pickupDate: new Date("2025-04-28"),
        deliveryDate: new Date("2025-04-29")
    }
]

export default function DriversPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDriver, setSelectedDriver] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const { company } = useAuth()

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const handleDriverClick = (driver: any) => {
        setSelectedDriver(driver)
        setIsDetailsOpen(true)
    }

    const activeDrivers = mockDrivers.filter(driver => driver.status === "active")
    const inactiveDrivers = mockDrivers.filter(driver => driver.status === "inactive")

    const filteredDrivers = mockDrivers.filter(driver =>
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredActiveDrivers = activeDrivers.filter(driver =>
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredInactiveDrivers = inactiveDrivers.filter(driver =>
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!company) {
        return <div>Company not found. Please create a company first.</div>
    }

    return (
        <DashboardShell>
            <PageHeader
                title="Drivers"
                description="Manage your driver roster"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Drivers", href: "/drivers" }
                ]}
                actions={
                    <Link href="/drivers/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Driver
                        </Button>
                    </Link>
                }
            />

            {isLoading ? (
                <div className="space-y-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-full sm:w-10" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full" />
                            ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search drivers..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-full sm:w-auto h-10 sm:h-10 sm:aspect-square"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="sm:hidden ml-2">Filter</span>
                        </Button>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">
                                All{" "}
                                <Badge className="ml-2 bg-primary">{filteredDrivers.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="active">
                                Active{" "}
                                <Badge className="ml-2 bg-green-500">
                                    {filteredActiveDrivers.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="inactive">
                                Inactive{" "}
                                <Badge className="ml-2 bg-red-500">
                                    {filteredInactiveDrivers.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDrivers.map(driver => (
                                    <DriverCard
                                        key={driver.id}
                                        driver={driver}
                                        onClick={() => handleDriverClick(driver)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="active" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredActiveDrivers.map(driver => (
                                    <DriverCard
                                        key={driver.id}
                                        driver={driver}
                                        onClick={() => handleDriverClick(driver)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="inactive" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredInactiveDrivers.map(driver => (
                                    <DriverCard
                                        key={driver.id}
                                        driver={driver}
                                        onClick={() => handleDriverClick(driver)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {selectedDriver && (
                        <DriverDetailsDialog
                            driver={selectedDriver}
                            recentLoads={mockRecentLoads}
                            isOpen={isDetailsOpen}
                            onClose={() => setIsDetailsOpen(false)}
                        />
                    )}
                </div>
            )}
        </DashboardShell>
    )
}
