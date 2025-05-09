"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export type IftaTrip = {
    id: string | number
    date: string
    driver: string
    vehicle: string
    origin: string
    destination: string
    miles: number
    jurisdictions: string
}

interface IftaTripTableProps {
    trips: IftaTrip[]
}

export function IftaTripTable({ trips }: IftaTripTableProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredTrips = trips.filter(
        trip =>
            trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search trips..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filter</Button>
                <Button>Add Trip</Button>
            </div>

            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left text-sm font-medium">Date</th>
                            <th className="p-2 text-left text-sm font-medium">Driver</th>
                            <th className="p-2 text-left text-sm font-medium">Vehicle</th>
                            <th className="p-2 text-left text-sm font-medium">Origin</th>
                            <th className="p-2 text-left text-sm font-medium">Destination</th>
                            <th className="p-2 text-right text-sm font-medium">Miles</th>
                            <th className="p-2 text-left text-sm font-medium">Jurisdictions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrips.map(trip => (
                            <tr key={trip.id} className="border-b">
                                <td className="p-2 text-sm">{trip.date}</td>
                                <td className="p-2 text-sm">{trip.driver}</td>
                                <td className="p-2 text-sm">{trip.vehicle}</td>
                                <td className="p-2 text-sm">{trip.origin}</td>
                                <td className="p-2 text-sm">{trip.destination}</td>
                                <td className="p-2 text-sm text-right">{trip.miles}</td>
                                <td className="p-2 text-sm">{trip.jurisdictions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
                <Button variant="outline" size="sm">
                    View All Trips
                </Button>
            </div>
        </div>
    )
}
