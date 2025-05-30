"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function VehiclesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
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
    status: "active",
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
    setNewVehicle((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewVehicle((prev) => ({
      ...prev,
      [name]: value,
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
      status: "active",
    })
    setIsAddVehicleOpen(false)
  }


  return (
    <div className="vehicles-page space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-start space-y-2">
          <h1 className="page-title mt-2">Fleet Vehicles</h1>
          <p className="page-subtitle">Manage and track your fleet vehicles</p>
        </div>
        <div className="flex flex-col space-y-2 items-end">
          <Button className="btn btn-primary w-full" onClick={() => setIsAddVehicleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-[250px]"
            />
          </div>
        </div>
      </div>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4 tabs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          <TabsTrigger value="tractors">Tractors</TabsTrigger>
          <TabsTrigger value="trailers">Trailers</TabsTrigger>
        </TabsList>
      </Tabs>
        <div className="text-center py-10">
          <p className="text-[hsl(var(--muted-foreground))]">No vehicles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        </div>
      
      {/* Add Vehicle Dialog */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details for the new vehicle. All fields marked with * are required.
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
                <Select value={newVehicle.type} onValueChange={(value) => handleSelectChange("type", value)}>
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
                <Select value={newVehicle.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
              <Button variant="outline" className="btn btn-outline">Cancel</Button>
            </DialogClose>
            <Button className="btn btn-primary" onClick={handleAddVehicle}>Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* End Add Vehicle Dialog */}
    </div>
  )
}
