"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import { useAuth } from "@/context/auth-context"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"

// Mock vehicle data
const mockVehicles = [
    {
        id: "d81d4e2e-bcf2-11e6-869b-7df92533d2db",
        unitNumber: "T-101",
        type: "tractor",
        status: "active",
        make: "Freightliner",
        model: "Cascadia",
        year: 2022,
        vin: "1FUJGHDV0CLBP8834",
        licensePlate: "ABC1234",
        state: "NM",
        currentOdometer: 125000,
        lastOdometerUpdate: new Date("2025-04-30"),
        fuelType: "diesel",
        maintenanceRecords: [],
        number: "T-101",
        miles: 125000,
        utilization: 90,
        fuelEfficiency: 6.5,
        maintenance: 1000
    },
    {
        id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dc",
        unitNumber: "T-102",
        type: "tractor",
        status: "active",
        make: "Peterbilt",
        model: "579",
        year: 2021,
        vin: "1XPBD49X1MD456789",
        licensePlate: "XYZ5678",
        state: "NM",
        currentOdometer: 98000,
        lastOdometerUpdate: new Date("2025-04-28"),
        fuelType: "diesel",
        maintenanceRecords: [],
        number: "T-102",
        miles: 98000,
        utilization: 85,
        fuelEfficiency: 6.8,
        maintenance: 800
    },
    {
        id: "d81d4e2e-bcf2-11e6-869b-7df92533d2dd",
        unitNumber: "T-103",
        type: "tractor",
        status: "active",
        make: "Kenworth",
        model: "T680",
        year: 2023,
        vin: "1XKAD49X1NJ123456",
        licensePlate: "DEF9012",
        state: "NM",
        currentOdometer: 45000,
        lastOdometerUpdate: new Date("2025-04-25"),
        fuelType: "diesel",
        maintenanceRecords: [],
        number: "T-103",
        miles: 45000,
        utilization: 95,
        fuelEfficiency: 7.0,
        maintenance: 500
    },
    {
        id: "d81d4e2e-bcf2-11e6-869b-7df92533d2de",
        unitNumber: "T-104",
        type: "tractor",
        status: "maintenance",
        make: "Volvo",
        model: "VNL",
        year: 2020,
        vin: "4V4NC9EH4LN234567",
        licensePlate: "GHI3456",
        state: "NM",
        currentOdometer: 210000,
        lastOdometerUpdate: new Date("2025-04-20"),
        fuelType: "diesel",
        maintenanceRecords: [],
        number: "T-104",
        miles: 210000,
        utilization: 70,
        fuelEfficiency: 5.5,
        maintenance: 1500
    },
    {
        id: "e81d4e2e-bcf2-11e6-869b-7df92533d2db",
        unitNumber: "TR-201",
        type: "trailer",
        status: "active",
        make: "Great Dane",
        model: "Everest",
        year: 2021,
        vin: "1GRAA06Y5KM123456",
        licensePlate: "TRL1234",
        state: "NM",
        number: "TR-201",
        miles: 0,
        utilization: 0,
        fuelEfficiency: 0,
        maintenance: 0
    },
    {
        id: "e81d4e2e-bcf2-11e6-869b-7df92533d2dc",
        unitNumber: "TR-202",
        type: "trailer",
        status: "active",
        make: "Utility",
        model: "3000R",
        year: 2022,
        vin: "1UYVS2538NM234567",
        licensePlate: "TRL5678",
        state: "NM",
        number: "TR-202",
        miles: 0,
        utilization: 0,
        fuelEfficiency: 0,
        maintenance: 0
    },
    {
        id: "e81d4e2e-bcf2-11e6-869b-7df92533d2de",
        unitNumber: "TR-204",
        type: "trailer",
        status: "maintenance",
        make: "Hyundai",
        model: "Translead",
        year: 2019,
        vin: "3H3V532C1KT456789",
        licensePlate: "TRL3456",
        state: "NM",
        number: "TR-204",
        miles: 0,
        utilization: 0,
        fuelEfficiency: 0,
        maintenance: 0
    }
]

export default function VehiclesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("all")
    const { company } = useAuth()
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false)

    // Form state for new vehicle
    const [newVehicle, setNewVehicle] = useState({
        unitNumber: "",
        type: "tractor",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        licensePlate: "",
        state: "",
        status: "active"
    })

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const handleVehicleClick = (vehicle: any) => {
        setSelectedVehicle(vehicle)
        setIsDetailsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewVehicle(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setNewVehicle(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddVehicle = () => {
        // In a real app, this would send data to the server
        console.log("Adding new vehicle:", newVehicle)

        // Reset form and close dialog
        setNewVehicle({
            unitNumber: "",
            type: "tractor",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            vin: "",
            licensePlate: "",
            state: "",
            status: "active"
        })
        setIsAddVehicleOpen(false)
    }

    const filteredVehicles = mockVehicles.filter(vehicle => {
        // Filter by search term
        const matchesSearch =
            vehicle.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vehicle.make?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (vehicle.model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())

        // Filter by vehicle type
        if (activeTab === "all") return matchesSearch
        if (activeTab === "tractors") return matchesSearch && vehicle.type === "tractor"
        if (activeTab === "trailers") return matchesSearch && vehicle.type === "trailer"

        return matchesSearch
    })

    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader
                title="Vehicles"
                description="Manage your fleet of tractors and trailers"
                breadcrumbs={[{ label: "Vehicles", href: "/vehicles" }]}
                actions={
                    <Button onClick={() => setIsAddVehicleOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Vehicle
                    </Button>
                }
            />

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <Tabs
                    defaultValue="all"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full md:w-auto"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Vehicles</TabsTrigger>
                        <TabsTrigger value="tractors">Tractors</TabsTrigger>
                        <TabsTrigger value="trailers">Trailers</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-auto mt-2 md:mt-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-8 w-full md:w-[250px]"
                    />
                </div>
            </div>

            {filteredVehicles.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">
                        No vehicles found matching your criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVehicles.map(vehicle => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            onClick={() => handleVehicleClick(vehicle)}
                        />
                    ))}
                </div>
            )}

            {/* Add Vehicle Dialog */}
            <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Vehicle</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new vehicle. All fields marked with * are
                            required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitNumber">Unit Number *</Label>
                                <Input
                                    id="unitNumber"
                                    name="unitNumber"
                                    value={newVehicle.unitNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., T-105"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Vehicle Type *</Label>
                                <Select
                                    value={newVehicle.type}
                                    onValueChange={(value: string) =>
                                        handleSelectChange("type", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tractor">Tractor</SelectItem>
                                        <SelectItem value="trailer">Trailer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="make">Make</Label>
                                <Input
                                    id="make"
                                    name="make"
                                    value={newVehicle.make}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Freightliner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    value={newVehicle.model}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Cascadia"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    value={newVehicle.year}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2023"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={newVehicle.status}
                                    onValueChange={(value: string) =>
                                        handleSelectChange("status", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vin">VIN</Label>
                            <Input
                                id="vin"
                                name="vin"
                                value={newVehicle.vin}
                                onChange={handleInputChange}
                                placeholder="Vehicle Identification Number"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">License Plate</Label>
                                <Input
                                    id="licensePlate"
                                    name="licensePlate"
                                    value={newVehicle.licensePlate}
                                    onChange={handleInputChange}
                                    placeholder="e.g., ABC1234"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={newVehicle.state}
                                    onChange={handleInputChange}
                                    placeholder="e.g., NM"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddVehicle}>Add Vehicle</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
