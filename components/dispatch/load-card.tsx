"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, User, Truck } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Load, LoadCardProps } from "@/types/dispatch"

export function LoadCard({ load, onClick }: LoadCardProps) {
    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{load.referenceNumber}</CardTitle>
                    <StatusBadge status={load.status} />
                </div>
                <p className="text-sm text-muted-foreground">{load.customerName}</p>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Origin</p>
                            <p className="text-sm text-muted-foreground">
                                {load.originCity}, {load.originState}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Destination</p>
                            <p className="text-sm text-muted-foreground">
                                {load.destinationCity}, {load.destinationState}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Pickup</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(load.pickupDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
                <div className="w-full space-y-1">
                    {load.driver ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Driver:</span>
                            </div>
                            <span className="text-xs font-medium">
                                {load.driver.firstName} {load.driver.lastName}
                            </span>
                        </div>
                    ) : null}
                    {load.vehicle ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Vehicle:</span>
                            </div>
                            <span className="text-xs font-medium">{load.vehicle.unitNumber}</span>
                        </div>
                    ) : null}
                </div>
            </CardFooter>
        </Card>
    )
}
