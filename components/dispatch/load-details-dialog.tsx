"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, DollarSign, Package, FileText, Truck, User, Weight, Route } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { DocumentUpload, DocumentListEmpty } from "@/components/shared/DocumentUpload"

interface Driver {
  id: string
  firstName: string
  lastName: string
  status: string
}

interface Vehicle {
  make: ReactNode
  model: ReactNode
  id: string
  unitNumber: string
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
  commodity?: string
  weight?: number
  rate?: number
  miles?: number
}

interface LoadDetailsDialogProps {
  load: Load
  drivers: Driver[]
  vehicles: Vehicle[]
  isOpen: boolean
  onClose: () => void
}

export function LoadDetailsDialog({ load, drivers, vehicles, isOpen, onClose }: LoadDetailsDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState(load.driver?.id || "")
  const [selectedVehicleId, setSelectedVehicleId] = useState(load.vehicle?.id || "")
  const [selectedTrailerId, setSelectedTrailerId] = useState(load.trailer?.id || "")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-indigo-100 text-indigo-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const tractors = vehicles.filter((vehicle) => vehicle.type === "tractor" && vehicle.status === "active")
  const trailers = vehicles.filter((vehicle) => vehicle.type === "trailer" && vehicle.status === "active")
  const activeDrivers = drivers.filter((driver) => driver.status === "active")

  const handleAssign = async () => {
    setIsAssigning(true)
    // Simulate API call
    setTimeout(() => {
      setIsAssigning(false)
      onClose()
    }, 1000)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingStatus(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700 shadow-2xl text-zinc-100">
        <style>{`
          .select-menu-bg-fix [role='listbox'],
          .select-menu-bg-fix [data-radix-popper-content-wrapper],
          .select-menu-bg-fix .bg-popover,
          .select-menu-bg-fix .bg-background {
            background-color: #18181b !important;
            --tw-bg-opacity: 1 !important;
          }
        `}</style>
        <div className="select-menu-bg-fix">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Load {load.referenceNumber}</DialogTitle>
              <Badge className={getStatusColor(load.status)}>{load.status.replace("_", " ")}</Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Customer Name</Label>
                        <div className="font-medium">{load.customerName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Reference Number</Label>
                          <div className="font-medium">{load.referenceNumber}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Status</Label>
                          <div>
                            <Badge className={getStatusColor(load.status)}>{load.status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Load Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Package className="h-3 w-3" /> Commodity
                          </Label>
                          <div className="font-medium">{load.commodity || "N/A"}</div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Weight className="h-3 w-3" /> Weight
                          </Label>
                          <div className="font-medium">{load.weight ? `${load.weight.toLocaleString()} lbs` : "N/A"}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Rate
                          </Label>
                          <div className="font-medium">{load.rate ? formatCurrency(load.rate) : "N/A"}</div>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <Route className="h-3 w-3" /> Miles
                          </Label>
                          <div className="font-medium">{load.miles ? load.miles.toLocaleString() : "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Origin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {load.originCity}, {load.originState}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm">Pickup Date</p>
                          <p className="font-medium">{formatDate(load.pickupDate)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Destination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {load.destinationCity}, {load.destinationState}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm">Delivery Date</p>
                          <p className="font-medium">{formatDate(load.deliveryDate)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <User className="h-3 w-3" /> Driver
                        </Label>
                        <div className="font-medium">
                          {load.driver ? `${load.driver.firstName} ${load.driver.lastName}` : "Not Assigned"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Tractor
                        </Label>
                        <div className="font-medium">{load.vehicle ? load.vehicle.unitNumber : "Not Assigned"}</div>
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Trailer
                        </Label>
                        <div className="font-medium">{load.trailer ? load.trailer.unitNumber : "Not Assigned"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Resources</CardTitle>
                  <CardDescription>Select a driver and equipment for this load</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger id="driver">
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">Not Assigned</SelectItem>
                        {activeDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tractor">Tractor</Label>
                    <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                      <SelectTrigger id="tractor">
                        <SelectValue placeholder="Select a tractor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">Not Assigned</SelectItem>
                        {tractors.map((tractor) => (
                          <SelectItem key={tractor.id} value={tractor.id}>
                            {tractor.unitNumber} - {tractor.make} {tractor.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailer">Trailer</Label>
                    <Select value={selectedTrailerId} onValueChange={setSelectedTrailerId}>
                      <SelectTrigger id="trailer">
                        <SelectValue placeholder="Select a trailer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">Not Assigned</SelectItem>
                        {trailers.map((trailer) => (
                          <SelectItem key={trailer.id} value={trailer.id}>
                            {trailer.unitNumber} - {trailer.make} {trailer.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Load Documents</CardTitle>
                  <CardDescription>Manage documents related to this load</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DocumentUpload label="Upload Document" description="Add BOL, POD, or other documents" />
                  <DocumentListEmpty />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Load History</CardTitle>
                  <CardDescription>Track changes and updates to this load</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-muted pl-4 py-2">
                      <p className="text-sm font-medium">Load created</p>
                      <p className="text-xs text-muted-foreground">2025-05-01 09:30 AM</p>
                    </div>
                    <div className="border-l-2 border-muted pl-4 py-2">
                      <p className="text-sm font-medium">Status changed to assigned</p>
                      <p className="text-xs text-muted-foreground">2025-05-01 10:15 AM</p>
                    </div>
                    <div className="border-l-2 border-muted pl-4 py-2">
                      <p className="text-sm font-medium">Driver assigned: John Smith</p>
                      <p className="text-xs text-muted-foreground">2025-05-01 10:15 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dispatch/${load.id}/edit`}>Edit Load</Link>
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex gap-2">
              {load.status === "pending" && (
                <Button onClick={handleAssign} disabled={isAssigning}>
                  {isAssigning ? "Assigning..." : "Assign Load"}
                </Button>
              )}
              {load.status === "assigned" && (
                <Button onClick={() => handleStatusUpdate("in_transit")} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? "Updating..." : "Mark In Transit"}
                </Button>
              )}
              {load.status === "in_transit" && (
                <Button onClick={() => handleStatusUpdate("completed")} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? "Updating..." : "Mark Completed"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
