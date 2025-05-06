"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User, Truck } from "lucide-react"
import { formatDate } from "@/lib/utils"

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
}

interface LoadCardProps {
  load: Load
  onClick: () => void
}

export function LoadCard({ load, onClick }: LoadCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "assigned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "in_transit":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{load.referenceNumber}</CardTitle>
          <Badge className={`${getStatusColor(load.status)}`}>{load.status.replace("_", " ")}</Badge>
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
              <p className="text-sm text-muted-foreground">{formatDate(load.pickupDate)}</p>
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
