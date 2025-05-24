"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, AlertCircle, CheckCircle, Clock } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

// Define the Vehicle type
interface Vehicle {
  id: string
  unit: string
  status: string
  lastInspection: string
  nextInspection: string
  defects: string
  registrationExpiry: string
  type: string
}

// Export the columns definition
export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "unit",
    header: "Unit Number",
    cell: ({ row }) => <div className="font-medium">{row.getValue("unit")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex items-center gap-2">
          {status === "Compliant" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : status === "Warning" ? (
            <Clock className="h-4 w-4 text-amber-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <Badge
            className={
              status === "Compliant"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : status === "Warning"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "lastInspection",
    header: "Last Inspection",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("lastInspection")).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "nextInspection",
    header: "Next Inspection",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("nextInspection")).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "defects",
    header: "Defects",
    cell: ({ row }) => {
      const defects = row.getValue("defects") as string
      return defects === "None" ? (
        <span className="text-muted-foreground">None</span>
      ) : (
        <span className="text-red-600">{defects}</span>
      )
    },
  },
  {
    accessorKey: "registrationExpiry",
    header: "Registration Expiry",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("registrationExpiry")).toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
            <DropdownMenuItem>Schedule Inspection</DropdownMenuItem>
            <DropdownMenuItem>View Maintenance History</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const mockVehicles = [
  {
    id: "1",
    unit: "TRK-101",
    status: "Compliant",
    lastInspection: "2024-04-01",
    nextInspection: "2024-07-01",
    defects: "None",
    registrationExpiry: "2024-12-15",
    type: "Tractor",
  },
  {
    id: "2",
    unit: "TRL-202",
    status: "Warning",
    lastInspection: "2024-03-15",
    nextInspection: "2024-06-15",
    defects: "Minor - Tail Light",
    registrationExpiry: "2024-08-30",
    type: "Trailer",
  },
  {
    id: "3",
    unit: "TRK-103",
    status: "Non-Compliant",
    lastInspection: "2024-01-10",
    nextInspection: "2024-04-10",
    defects: "Major - Brake System",
    registrationExpiry: "2024-10-20",
    type: "Tractor",
  },
  {
    id: "4",
    unit: "TRL-204",
    status: "Compliant",
    lastInspection: "2024-03-25",
    nextInspection: "2024-06-25",
    defects: "None",
    registrationExpiry: "2025-01-15",
    type: "Trailer",
  },
  {
    id: "5",
    unit: "TRK-105",
    status: "Compliant",
    lastInspection: "2024-04-05",
    nextInspection: "2024-07-05",
    defects: "None",
    registrationExpiry: "2024-11-10",
    type: "Tractor",
  },
]

export function VehicleComplianceTable() {
  const [vehicles, setVehicles] = useState(mockVehicles)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vehicle Compliance</h2>
        <Button>Schedule Inspection</Button>
      </div>

      {/* Vehicle list would go here */}
      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="border rounded-md p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{vehicle.unit}</h3>
                <Badge variant="outline">{vehicle.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Registration expires: {new Date(vehicle.registrationExpiry).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-1">
                {vehicle.status === "Compliant" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : vehicle.status === "Warning" ? (
                  <Clock className="h-4 w-4 text-amber-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge
                  className={
                    vehicle.status === "Compliant"
                      ? "bg-green-100 text-green-800"
                      : vehicle.status === "Warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {vehicle.status}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
