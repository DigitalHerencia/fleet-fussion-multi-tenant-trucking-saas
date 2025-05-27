"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DriverCard } from "@/components/drivers/driver-card"
import { DriverDetailsDialog } from "@/components/drivers/driver-details-dialog"
import { Search, Filter } from "lucide-react"
import { useAuth } from "@/components/auth/context"

// Mock Drivers data (replace with import if you have real data elsewhere)
const Drivers = [
	{
		id: "1",
		firstName: "John",
		lastName: "Doe",
		status: "active",
	},
	{
		id: "2",
		firstName: "Jane",
		lastName: "Smith",
		status: "inactive",
	},
	// Add more mock drivers as needed
]

export default function DriversPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedDriver, setSelectedDriver] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)
	const { company } = useAuth()

	useEffect(() => {
		// Simulate loading data
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)
		return () => clearTimeout(timer)
	}, [])

	const handleDriverClick = (driver: any) => {
		setSelectedDriver(driver)
		setIsDetailsOpen(true)
	}

	const activeDrivers = Drivers.filter((driver) => driver.status === "active")
	const inactiveDrivers = Drivers.filter((driver) => driver.status === "inactive")

	const filteredDrivers = Drivers.filter((driver) =>
		`${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
	)
	const filteredActiveDrivers = activeDrivers.filter((driver) =>
		`${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
	)
	const filteredInactiveDrivers = inactiveDrivers.filter((driver) =>
		`${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	if (!company) {
		return <div className="text-[hsl(var(--muted-foreground))]">Company not found. Please create a company first.</div>
	}

	return (
		<div className="drivers-page">
			<div className="space-y-2 mb-2 mt-14">
				<h1 className="page-title">Driver Roster</h1>
				<p className="page-subtitle">Manage your driver roster</p>
			</div>
			<div className="space-y-6 mt-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
						<Input
							type="search"
							placeholder="Search drivers..."
							className="pl-8 w-full"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Button variant="outline" size="icon" className="btn btn-outline w-full sm:w-auto h-10 sm:h-10 sm:aspect-square">
						<Filter className="h-4 w-4" />
						<span className="sm:hidden ml-2">Filter</span>
					</Button>
				</div>
				<Tabs defaultValue="all" className="w-full">
					<TabsList className="tabs grid w-full grid-cols-3">
						<TabsTrigger value="all">
							All <Badge className="badge ml-2">{filteredDrivers.length}</Badge>
						</TabsTrigger>
						<TabsTrigger value="active">
							Active <Badge className="badge badge-success ml-2">{filteredActiveDrivers.length}</Badge>
						</TabsTrigger>
						<TabsTrigger value="inactive">
							Inactive <Badge className="badge badge-danger ml-2">{filteredInactiveDrivers.length}</Badge>
						</TabsTrigger>
					</TabsList>
					<TabsContent value="all" className="mt-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredDrivers.map((driver) => (
								<DriverCard key={driver.id} driver={driver} onClick={() => handleDriverClick(driver)} />
							))}
						</div>
					</TabsContent>
					<TabsContent value="active" className="mt-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredActiveDrivers.map((driver) => (
								<DriverCard key={driver.id} driver={driver} onClick={() => handleDriverClick(driver)} />
							))}
						</div>
					</TabsContent>
					<TabsContent value="inactive" className="mt-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredInactiveDrivers.map((driver) => (
								<DriverCard key={driver.id} driver={driver} onClick={() => handleDriverClick(driver)} />
							))}
						</div>
					</TabsContent>
				</Tabs>
				{selectedDriver && (
					<DriverDetailsDialog
						driver={selectedDriver}
						recentLoads={[]}
						isOpen={isDetailsOpen}
						onClose={() => setIsDetailsOpen(false)}
					/>
				)}
			</div>
		</div>
	)
}

