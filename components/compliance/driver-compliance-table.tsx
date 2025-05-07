"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { AlertCircle, CheckCircle, Clock, MoreHorizontal, Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

// Define the Driver type
interface Driver {
    id: string
    name: string
    status: string
    licenseExpiry: string
    medicalExpiry: string
    lastHosViolation: string
    dutyStatus: string
    availableHours: number
}

// Export the columns definition
export const columns: ColumnDef<Driver>[] = [
    {
        accessorKey: "name",
        header: "Driver Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className="flex items-center gap-2">
                    {status === "Compliant" || status === "Valid" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : status === "Warning" || status === "Expiring Soon" ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge
                        className={
                            status === "Compliant" || status === "Valid"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : status === "Warning" || status === "Expiring Soon"
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
        accessorKey: "licenseExpiry",
        header: "License Expiry",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("licenseExpiry")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "medicalExpiry",
        header: "Medical Expiry",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("medicalExpiry")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "lastHosViolation",
        header: "Last Violation",
        cell: ({ row }) => {
            const violation = row.getValue("lastHosViolation") as string
            return violation === "None" ? (
                <span className="text-muted-foreground">None</span>
            ) : (
                new Date(violation).toLocaleDateString()
            )
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
                        <DropdownMenuItem>View Documents</DropdownMenuItem>
                        <DropdownMenuItem>View HOS Logs</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]

const mockDrivers = [
    {
        id: "1",
        name: "John Smith",
        cdlStatus: "Valid",
        cdlExpiration: "2025-06-15",
        medicalStatus: "Expiring Soon",
        medicalExpiration: "2023-07-10",
        hosStatus: "Compliant",
        lastViolation: "2023-04-22"
    },
    {
        id: "2",
        name: "Maria Garcia",
        cdlStatus: "Valid",
        cdlExpiration: "2024-08-22",
        medicalStatus: "Valid",
        medicalExpiration: "2024-02-18",
        hosStatus: "Violation",
        lastViolation: "2023-06-05"
    },
    {
        id: "3",
        name: "Robert Johnson",
        cdlStatus: "Valid",
        cdlExpiration: "2026-03-30",
        medicalStatus: "Valid",
        medicalExpiration: "2023-11-12",
        hosStatus: "Compliant",
        lastViolation: "None"
    },
    {
        id: "4",
        name: "Sarah Williams",
        cdlStatus: "Expiring Soon",
        cdlExpiration: "2023-07-28",
        medicalStatus: "Valid",
        medicalExpiration: "2024-05-20",
        hosStatus: "Compliant",
        lastViolation: "2023-02-14"
    },
    {
        id: "5",
        name: "Michael Brown",
        cdlStatus: "Valid",
        cdlExpiration: "2025-11-05",
        medicalStatus: "Expired",
        medicalExpiration: "2023-06-01",
        hosStatus: "Compliant",
        lastViolation: "2023-01-30"
    }
]

export function DriverComplianceTable() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredDrivers = mockDrivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Valid":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
                )
            case "Expiring Soon":
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Expiring Soon
                    </Badge>
                )
            case "Expired":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
            case "Violation":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Violation</Badge>
            case "Compliant":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Compliant
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Valid":
            case "Compliant":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "Expiring Soon":
                return <Clock className="h-4 w-4 text-amber-500" />
            case "Expired":
            case "Violation":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search drivers..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="outline" className="flex-1 sm:flex-none">
                        Filter
                    </Button>
                    <Button className="flex-1 sm:flex-none">Add Driver</Button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Driver Name</TableHead>
                            <TableHead>CDL Status</TableHead>
                            <TableHead>Medical Status</TableHead>
                            <TableHead>HOS Status</TableHead>
                            <TableHead>Last Violation</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDrivers.map(driver => (
                            <TableRow key={driver.id}>
                                <TableCell className="font-medium">{driver.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(driver.cdlStatus)}
                                        <div>
                                            {getStatusBadge(driver.cdlStatus)}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Exp:{" "}
                                                {new Date(
                                                    driver.cdlExpiration
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(driver.medicalStatus)}
                                        <div>
                                            {getStatusBadge(driver.medicalStatus)}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Exp:{" "}
                                                {new Date(
                                                    driver.medicalExpiration
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(driver.hosStatus)}
                                        {getStatusBadge(driver.hosStatus)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {driver.lastViolation === "None" ? (
                                        <span className="text-muted-foreground">None</span>
                                    ) : (
                                        new Date(driver.lastViolation).toLocaleDateString()
                                    )}
                                </TableCell>
                                <TableCell>
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
                                            <DropdownMenuItem>View Documents</DropdownMenuItem>
                                            <DropdownMenuItem>View HOS Logs</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
