"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Download, Eye } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

// Define the Document type
interface Document {
    id: string
    name: string
    type: string
    lastUpdated: string
    status: string
    assignedTo: string
}

// Export the columns definition
export const columns: ColumnDef<Document>[] = [
    {
        accessorKey: "name",
        header: "Document Name",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("name")}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return <Badge variant={type === "Required" ? "default" : "outline"}>{type}</Badge>
        }
    },
    {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("lastUpdated")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    className={
                        status === "Complete"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                >
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "assignedTo",
        header: "Assigned To"
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
                        <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]

// Mock documents data
const mockDocuments = [
    {
        id: "1",
        name: "Driver Qualification File",
        type: "Required",
        lastUpdated: "2024-04-10",
        status: "Complete",
        assignedTo: "All Drivers"
    },
    {
        id: "2",
        name: "Vehicle Inspection Reports",
        type: "Required",
        lastUpdated: "2024-04-15",
        status: "Complete",
        assignedTo: "All Vehicles"
    },
    {
        id: "3",
        name: "Hours of Service Logs",
        type: "Required",
        lastUpdated: "2024-04-18",
        status: "Incomplete",
        assignedTo: "All Drivers"
    },
    {
        id: "4",
        name: "Drug & Alcohol Testing Records",
        type: "Required",
        lastUpdated: "2024-03-30",
        status: "Complete",
        assignedTo: "All Drivers"
    },
    {
        id: "5",
        name: "Accident Register",
        type: "Required",
        lastUpdated: "2024-04-05",
        status: "Complete",
        assignedTo: "Company"
    }
]

export function ComplianceDocuments() {
    const [documents, setDocuments] = useState(mockDocuments)

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Compliance Documents</h2>
                <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {/* Document list would go here */}
            <div className="grid gap-4">
                {documents.map(doc => (
                    <div
                        key={doc.id}
                        className="border rounded-md p-4 flex justify-between items-center"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-medium">{doc.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    doc.status === "Complete"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-amber-100 text-amber-800"
                                }
                            >
                                {doc.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
