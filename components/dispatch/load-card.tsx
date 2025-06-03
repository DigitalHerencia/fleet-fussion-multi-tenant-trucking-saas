"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, Truck, MoreVertical } from "lucide-react"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  onStatusUpdate?: (loadId: string, status: string) => void
  isUpdating?: boolean
}

export function LoadCard({ load, onClick, onStatusUpdate, isUpdating }: LoadCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-500 text-white"
      case "in_transit": return "bg-yellow-500 text-black"
      case "delivered": return "bg-green-500 text-white"
      case "cancelled": return "bg-red-500 text-white"
      default: return "bg-gray-600 text-white"
    }
  }

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "assigned": return ["in_transit", "cancelled"]
      case "in_transit": return ["delivered", "cancelled"]
      case "delivered": return []
      default: return ["assigned"]
    }
  }

  const nextStatusOptions = getNextStatusOptions(load.status)

  const handleStatusClick = (e: React.MouseEvent, status: string) => {
    e.stopPropagation()
    if (onStatusUpdate) onStatusUpdate(load.id, status)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{load.referenceNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(load.status)}>{load.status.replace(/_/g, " ")}</Badge>
          </div>
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
      {nextStatusOptions.length > 0 && (
        <div className="flex gap-2 mt-2">
          {nextStatusOptions.map((status) => (
            <Button
              key={status}
              size="sm"
              variant="secondary"
              className="text-xs px-3 py-1"
              disabled={isUpdating}
              onClick={(e) => handleStatusClick(e, status)}
            >
              {isUpdating ? "Updating..." : `Mark as ${status.replace(/_/g, " ")}`}
            </Button>
          ))}
        </div>
      )}
    </Card>
  )
}
