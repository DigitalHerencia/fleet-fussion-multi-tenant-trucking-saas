"use client"

import { useState } from "react"
import { Truck, Gauge, FileText, PenToolIcon as Tool, AlertTriangle, MapPin } from "lucide-react"
import Link from "next/link"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatDate, formatCurrency } from "@/lib/utils/utils"


interface Vehicle {
  id: string
  unitNumber: string
  type: string
  status: string
  make?: string
  model?: string
  year?: number
  vin?: string
  licensePlate?: string
  state?: string
  currentOdometer?: number
  lastOdometerUpdate?: Date
  fuelType?: string
}

interface MaintenanceRecord {
  id: string
  type: string
  status: string
  description: string
  odometer?: number
  cost?: number
  vendor?: string
  completedDate?: Date
  scheduledDate?: Date
  notes?: string
}

interface Inspection {
  id: string
  type: string
  status: string
  date: Date
  location?: string
  notes?: string
  defects?: any
}

interface Load {
  id: string
  referenceNumber: string
  status: string
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  pickupDate: Date
  deliveryDate: Date
  driver?: {
    firstName: string
    lastName: string
  }
}

interface VehicleDetailsDialogProps {
  vehicle: Vehicle
  maintenanceRecords?: MaintenanceRecord[]
  inspections?: Inspection[]
  recentLoads?: Load[]
  isOpen: boolean
  onClose: () => void
}

export function VehicleDetailsDialog({
  vehicle,
  maintenanceRecords = [],
  inspections = [],
  recentLoads = [],
  isOpen,
  onClose,
}: VehicleDetailsDialogProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInspectionStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLoadStatusColor = (status: string) => {
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

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingStatus(false)
      onClose()
    }, 1000)
  }

  const upcomingMaintenance = maintenanceRecords.filter(
    (record) => record.status === "scheduled" && record.scheduledDate,
  )
  const completedMaintenance = maintenanceRecords.filter((record) => record.status === "completed")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Vehicle Details</DialogTitle>
            <Badge className={getStatusColor(vehicle.status)}>{vehicle.status.replace("_", " ")}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="loads">Loads</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted rounded-full p-3">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{vehicle.unitNumber}</h2>
                <p className="text-muted-foreground">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <div className="font-medium capitalize">{vehicle.type}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <div>
                          <Badge className={getStatusColor(vehicle.status)}>{vehicle.status.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">VIN</Label>
                      <div className="font-medium font-mono">{vehicle.vin || "N/A"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">License Plate</Label>
                        <div className="font-medium">{vehicle.licensePlate || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-xs">State</Label>
                        <div className="font-medium">{vehicle.state || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Usage Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Gauge className="h-3 w-3" /> Current Odometer
                      </Label>
                      <div className="font-medium">
                        {vehicle.currentOdometer ? `${vehicle.currentOdometer.toLocaleString()} miles` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Last Odometer Update</Label>
                      <div className="font-medium">
                        {vehicle.lastOdometerUpdate ? formatDate(vehicle.lastOdometerUpdate) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Fuel Type</Label>
                      <div className="font-medium capitalize">{vehicle.fuelType || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {upcomingMaintenance.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Upcoming Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {upcomingMaintenance.map((record) => (
                        <div key={record.id} className="flex items-start gap-2 p-2 border rounded-md">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-medium">{record.description}</div>
                            <div className="text-sm text-muted-foreground">
                              Scheduled: {record.scheduledDate ? formatDate(record.scheduledDate) : "N/A"}
                            </div>
                            {record.notes && <div className="text-sm mt-1">{record.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
                <CardDescription>View and manage maintenance for this vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-medium">Schedule Maintenance</h4>
                    <p className="text-sm text-muted-foreground">Add a new maintenance record</p>
                  </div>
                  <Button variant="outline">
                    <Tool className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>

                {maintenanceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceRecords.map((record) => (
                      <div key={record.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{record.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.type.charAt(0).toUpperCase() + record.type.slice(1)} maintenance
                            </div>
                          </div>
                          <Badge className={getMaintenanceStatusColor(record.status)}>
                            {record.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span>
                              {record.completedDate
                                ? formatDate(record.completedDate)
                                : record.scheduledDate
                                  ? formatDate(record.scheduledDate)
                                  : "N/A"}
                            </span>
                          </div>
                          {record.odometer && (
                            <div>
                              <span className="text-muted-foreground">Odometer: </span>
                              <span>{record.odometer.toLocaleString()} miles</span>
                            </div>
                          )}
                          {record.cost && (
                            <div>
                              <span className="text-muted-foreground">Cost: </span>
                              <span>{formatCurrency(record.cost)}</span>
                            </div>
                          )}
                          {record.vendor && (
                            <div>
                              <span className="text-muted-foreground">Vendor: </span>
                              <span>{record.vendor}</span>
                            </div>
                          )}
                        </div>
                        {record.notes && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Notes: </span>
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Tool className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No maintenance records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Records</CardTitle>
                <CardDescription>View and manage inspections for this vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-medium">Record Inspection</h4>
                    <p className="text-sm text-muted-foreground">Add a new inspection record</p>
                  </div>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Inspection
                  </Button>
                </div>

                {inspections.length > 0 ? (
                  <div className="space-y-4">
                    {inspections.map((inspection) => (
                      <div key={inspection.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)} Inspection
                            </div>
                            <div className="text-sm text-muted-foreground">{formatDate(inspection.date)}</div>
                          </div>
                          <Badge className={getInspectionStatusColor(inspection.status)}>
                            {inspection.status.replace("_", " ")}
                          </Badge>
                        </div>
                        {inspection.location && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{inspection.location}</span>
                          </div>
                        )}
                        {inspection.notes && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Notes: </span>
                            <span>{inspection.notes}</span>
                          </div>
                        )}
                        {inspection.defects && inspection.defects.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Defects:</div>
                            <ul className="mt-1 text-sm list-disc list-inside">
                              {inspection.defects.map((defect: any, index: number) => (
                                <li key={index}>
                                  {defect.component}: {defect.description} ({defect.severity} severity)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No inspection records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loads" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Loads</CardTitle>
                <CardDescription>Recent and upcoming loads assigned to this vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoads.length > 0 ? (
                  <div className="space-y-4">
                    {recentLoads.map((load) => (
                      <div key={load.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{load.referenceNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(load.pickupDate)} - {formatDate(load.deliveryDate)}
                            </div>
                          </div>
                          <Badge className={getLoadStatusColor(load.status)}>{load.status.replace("_", " ")}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {load.originCity}, {load.originState} to {load.destinationCity}, {load.destinationState}
                          </span>
                        </div>
                        {load.driver && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Driver: </span>
                            <span>
                              {load.driver.firstName} {load.driver.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent loads found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/vehicles/${vehicle.id}/edit`}>Edit Vehicle</Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="flex gap-2">
            {vehicle.status === "active" && (
              <Button variant="outline" onClick={() => handleStatusUpdate("maintenance")} disabled={isUpdatingStatus}>
                Mark for Maintenance
              </Button>
            )}
            {vehicle.status === "maintenance" && (
              <Button variant="outline" onClick={() => handleStatusUpdate("active")} disabled={isUpdatingStatus}>
                Mark as Active
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
