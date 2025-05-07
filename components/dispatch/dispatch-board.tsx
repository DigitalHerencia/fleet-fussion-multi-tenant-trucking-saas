"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadCard } from "@/components/dispatch/load-card"
import { LoadDetailsDialog } from "@/components/dispatch/load-details-dialog"
import { PlusCircle, Filter } from "lucide-react"
import Link from "next/link"

interface Driver {
    id: string
    firstName: string
    lastName: string
    status: string
    email?: string
    phone?: string
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
    vehicle: {
        id: string
        unitNumber: string
    } | null
    trailer: {
        id: string
        unitNumber: string
    } | null
    commodity: string
    weight: number
    rate: number
    miles: number
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

interface DispatchBoardProps {
    loads: Load[]
    drivers: Driver[]
    vehicles: Vehicle[]
}

export function DispatchBoard({ loads, drivers, vehicles }: DispatchBoardProps) {
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const pendingLoads = loads.filter(load => load.status === "pending")
    const assignedLoads = loads.filter(load => load.status === "assigned")
    const inTransitLoads = loads.filter(load => load.status === "in_transit")
    const completedLoads = loads.filter(load => load.status === "completed")

    const handleLoadClick = (load: Load) => {
        setSelectedLoad(load)
        setIsDetailsOpen(true)
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>
                <Link href="/dispatch/new" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Load
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="grid grid-cols-5 w-full min-w-[500px]">
                        <TabsTrigger value="all">
                            All <Badge className="ml-2 bg-primary">{loads.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            Pending{" "}
                            <Badge className="ml-2 bg-yellow-500">{pendingLoads.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="assigned">
                            Assigned{" "}
                            <Badge className="ml-2 bg-blue-500">{assignedLoads.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="in_transit">
                            In Transit{" "}
                            <Badge className="ml-2 bg-indigo-500">{inTransitLoads.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed{" "}
                            <Badge className="ml-2 bg-green-500">{completedLoads.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loads.length > 0 ? (
                            loads.map(load => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    onClick={() => handleLoadClick(load)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No loads found.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingLoads.length > 0 ? (
                            pendingLoads.map(load => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    onClick={() => handleLoadClick(load)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No pending loads found.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="assigned" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedLoads.length > 0 ? (
                            assignedLoads.map(load => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    onClick={() => handleLoadClick(load)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No assigned loads found.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="in_transit" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inTransitLoads.length > 0 ? (
                            inTransitLoads.map(load => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    onClick={() => handleLoadClick(load)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No in-transit loads found.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedLoads.length > 0 ? (
                            completedLoads.map(load => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    onClick={() => handleLoadClick(load)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No completed loads found.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {selectedLoad && (
                <LoadDetailsDialog
                    load={selectedLoad}
                    drivers={drivers}
                    isOpen={isDetailsOpen}
                    vehicles={vehicles}
                    onClose={() => setIsDetailsOpen(false)}
                />
            )}
        </div>
    )
}
