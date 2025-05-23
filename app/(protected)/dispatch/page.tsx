"use client"

import { useEffect, useState } from "react"
import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { Button } from "@/components/ui/button"
import { Filter, Plus, PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock data
const mockLoads = [
	{
		id: "a81d4e2e-bcf2-11e6-869b-7df92533d2db",
		referenceNumber: "L-1001",
		status: "in_transit",
		customerName: "ABC Distributors",
		originCity: "El Paso",
		originState: "TX",
		destinationCity: "Albuquerque",
		destinationState: "NM",
		pickupDate: new Date("2025-05-01"),
		deliveryDate: new Date("2025-05-02"),
		driver: {
			id: "f81d4e2e-bcf2-11e6-869b-7df92533d2db",
			firstName: "John",
			lastName: "Smith",
		},
		vehicle: {
			id: "d81d4e2e-bcf2-11e6-869b-7df92533d2db",
			unitNumber: "T-101",
		},
		trailer: {
			id: "e81d4e2e-bcf2-11e6-869b-7df92533d2db",
			unitNumber: "TR-201",
		},
		commodity: "Electronics",
		weight: 15000,
		rate: 2500,
		miles: 267,
	},
	{
		id: "a81d4e2e-bcf2-11e6-869b-7df92533d2dc",
		referenceNumber: "L-1002",
		status: "assigned",
		customerName: "XYZ Logistics",
		originCity: "Las Cruces",
		originState: "NM",
		destinationCity: "Phoenix",
		destinationState: "AZ",
		pickupDate: new Date("2025-05-02"),
		deliveryDate: new Date("2025-05-03"),
		driver: {
			id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dc",
			firstName: "Maria",
			lastName: "Garcia",
		},
		vehicle: {
			id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dc",
			unitNumber: "T-102",
		},
		trailer: {
			id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dc",
			unitNumber: "TR-202",
		},
		commodity: "Auto Parts",
		weight: 22000,
		rate: 3200,
		miles: 390,
	},
	{
		id: "a81d4e2e-bcf2-11e6-869b-7df92533d2dd",
		referenceNumber: "L-1003",
		status: "completed",
		customerName: "Southwest Freight",
		originCity: "Tucson",
		originState: "AZ",
		destinationCity: "El Paso",
		destinationState: "TX",
		pickupDate: new Date("2025-04-28"),
		deliveryDate: new Date("2025-04-29"),
		driver: {
			id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dd",
			firstName: "Robert",
			lastName: "Johnson",
		},
		vehicle: {
			id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dd",
			unitNumber: "T-103",
		},
		trailer: {
			id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dd",
			unitNumber: "TR-203",
		},
		commodity: "Building Materials",
		weight: 28000,
		rate: 2800,
		miles: 317,
	},
	{
		id: "a81d4e2e-bcf2-11e6-869b-7df92533d2de",
		referenceNumber: "L-1004",
		status: "pending",
		customerName: "Desert Shipping Co.",
		originCity: "Denver",
		originState: "CO",
		destinationCity: "Santa Fe",
		destinationState: "NM",
		pickupDate: new Date("2025-05-05"),
		deliveryDate: new Date("2025-05-06"),
		driver: null,
		vehicle: null,
		trailer: null,
		commodity: "Food Products",
		weight: 18000,
		rate: 3500,
		miles: 412,
	},
	{
		id: "a81d4e2e-bcf2-11e6-869b-7df92533d2df",
		referenceNumber: "L-1005",
		status: "pending",
		customerName: "Mountain Transport",
		originCity: "Salt Lake City",
		originState: "UT",
		destinationCity: "Las Vegas",
		destinationState: "NV",
		pickupDate: new Date("2025-05-07"),
		deliveryDate: new Date("2025-05-08"),
		driver: null,
		vehicle: null,
		trailer: null,
		commodity: "Retail Goods",
		weight: 16000,
		rate: 2900,
		miles: 421,
	},
]

const mockDrivers = [
	{
		id: "f81d4e2e-bcf2-11e6-869b-7df92533d2db",
		firstName: "John",
		lastName: "Smith",
		status: "active",
		email: "john.smith@example.com",
		phone: "555-111-2222",
	},
	{
		id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dc",
		firstName: "Maria",
		lastName: "Garcia",
		status: "active",
		email: "maria.garcia@example.com",
		phone: "555-222-3333",
	},
	{
		id: "f81d4e2e-bcf2-11e6-869b-7df92533d2dd",
		firstName: "Robert",
		lastName: "Johnson",
		status: "active",
		email: "robert.johnson@example.com",
		phone: "555-333-4444",
	},
	{
		id: "f81d4e2e-bcf2-11e6-869b-7df92533d2de",
		firstName: "Sarah",
		lastName: "Williams",
		status: "active",
		email: "sarah.williams@example.com",
		phone: "555-444-5555",
	},
]

const mockVehicles = [
	{
		id: "d81d4e2e-bcf2-11e6-869b-7df92533d2db",
		unitNumber: "T-101",
		status: "active",
		type: "tractor",
		make: "Freightliner",
		model: "Cascadia",
	},
	{
		id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dc",
		unitNumber: "T-102",
		status: "active",
		type: "tractor",
		make: "Peterbilt",
		model: "579",
	},
	{
		id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dd",
		unitNumber: "T-103",
		status: "active",
		type: "tractor",
		make: "Kenworth",
		model: "T680",
	},
	{
		id: "e81d4e2e-bcf2-11e6-869b-7df92533d2db",
		unitNumber: "TR-201",
		status: "active",
		type: "trailer",
		make: "Great Dane",
		model: "Everest",
	},
	{
		id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dc",
		unitNumber: "TR-202",
		status: "active",
		type: "trailer",
		make: "Utility",
		model: "3000R",
	},
	{
		id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dd",
		unitNumber: "TR-203",
		status: "active",
		type: "trailer",
		make: "Wabash",
		model: "DuraPlate",
	},
]

export default function DispatchPage() {
	const [isLoading, setIsLoading] = useState(true)
	const { company } = useAuth()

	useEffect(() => {
		// Simulate loading data
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)

		return () => clearTimeout(timer)
	}, [])

	if (!company) {
		return <div className="p-4 text-[hsl(var(--muted-foreground))]">Company not found. Please create a company first.</div>
	}

	if (isLoading) {
		return <DispatchSkeleton />
	}

	return (
		<div className="w-full max-w-7xl mx-auto flex flex-col gap-8 mt-10 dispatch-page">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
				<div>
					<h1 className="page-title">Dispatch Board</h1>
					<p className="page-subtitle">Manage and track your loads</p>
				</div>
				<div className="flex flex-col gap-6 w-full md:w-auto">
        		<div className="w-full sm:w-auto">
        			<Button size="sm" className="w-full sm:w-auto">
          			<PlusCircle className="h-4 w-4 mr-2" />
         			 New Load
        			</Button>
        		</div>
          			<Button variant="outline" size="sm" className="w-full sm:w-auto">
            		<Filter className="h-4 w-4 mr-2" />
            		Filter
          			</Button>
      				</div>
				
			</div>
			<DispatchBoard loads={mockLoads} drivers={mockDrivers} vehicles={mockVehicles} />
		</div>
	)
}


