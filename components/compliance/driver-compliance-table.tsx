"use client"

import { useState, ChangeEvent, type JSX } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

// Add interface for compliance table driver
interface ComplianceDriver {
  id: string
  name: string
  cdlStatus: string
  cdlExpiration: string
  medicalStatus: string
  medicalExpiration: string
  hosStatus: string
  lastViolation: string
}

// Export the columns definition
export const columns: ColumnDef<Driver>[] = [
  {
    accessorKey: "name",
    header: "Driver Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
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
    },
  },
  {
    accessorKey: "licenseExpiry",
    header: "License Expiry",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("licenseExpiry")).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "medicalExpiry",
    header: "Medical Expiry",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("medicalExpiry")).toLocaleDateString()}</div>
    },
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
            <DropdownMenuItem>View Documents</DropdownMenuItem>
            <DropdownMenuItem>View HOS Logs</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function DriverComplianceTable() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "Valid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
      case "Expiring Soon":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Expiring Soon</Badge>
      case "Expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
      case "Violation":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Violation</Badge>
      case "Compliant":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Compliant</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string): JSX.Element | null => {
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
            className="pl-8 w-full bg-neutral-900"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button variant="default" className="flex-1 sm:flex-none p-4.5 border border-gray-200 bg-neutral-900 hover:bg-gray-600">
            Filter
          </Button>
          <Button variant="default" className="flex-1 sm:flex-none p-4.5 border border-gray-200 bg-neutral-900 hover:bg-gray-600">Add Driver</Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-900">
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
            {/* TODO: Replace with real driver data */}
            {[1,2,3].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Compliant</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">None</span>
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