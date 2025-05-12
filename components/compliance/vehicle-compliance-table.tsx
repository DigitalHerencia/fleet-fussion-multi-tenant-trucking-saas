"use client"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu"
import { MoreHorizontal, AlertCircle, CheckCircle, Clock } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../components/ui/table"

// Vehicle interface definition
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
        cell: ({ row }) => <div className="font-medium">{row.getValue("unit")}</div>
    },
    {
        accessorKey: "type",
        header: "Type"
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
        }
    },
    {
        accessorKey: "lastInspection",
        header: "Last Inspection",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("lastInspection")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "nextInspection",
        header: "Next Inspection",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("nextInspection")).toLocaleDateString()}</div>
        }
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
        }
    },
    {
        accessorKey: "registrationExpiry",
        header: "Registration Expiry",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("registrationExpiry")).toLocaleDateString()}</div>
        }
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
        }
    }
]

export function VehicleComplianceTable({ vehicles }: { vehicles: Vehicle[] }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vehicle Compliance</h2>
                <Button>Schedule Inspection</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Unit Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Inspection</TableHead>
                        <TableHead>Next Inspection</TableHead>
                        <TableHead>Defects</TableHead>
                        <TableHead>Registration Expiry</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vehicles.map(vehicle => (
                        <TableRow key={vehicle.id}>
                            <TableCell>{vehicle.unit}</TableCell>
                            <TableCell>{vehicle.type}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
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
                            </TableCell>
                            <TableCell>
                                {new Date(vehicle.lastInspection).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {new Date(vehicle.nextInspection).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {vehicle.defects === "None" ? (
                                    <span className="text-muted-foreground">None</span>
                                ) : (
                                    <span className="text-red-600">{vehicle.defects}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(vehicle.registrationExpiry).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
