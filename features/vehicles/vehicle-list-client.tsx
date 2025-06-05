"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import type { Vehicle } from "@/types/vehicles"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import AddVehicleDialog from "./add-vehicle-dialog"

interface Props {
  orgId: string
  initialVehicles: Vehicle[]
}

export default function VehicleListClient({ orgId, initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = vehicles.filter(v =>
    [v.unitNumber, v.vin, v.make, v.model]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleAdd = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle])
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-start space-y-2">
          <h1 className="text-2xl font-bold">Fleet Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet vehicles</p>
        </div>
        <div className="flex flex-col space-y-2 items-end">
          <Button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-full md:w-[250px]"
            />
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No vehicles found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <VehicleCard key={v.id} vehicle={v as any} onClick={() => {}} />
          ))}
        </div>
      )}
      <AddVehicleDialog orgId={orgId} onSuccess={handleAdd} open={open} onOpenChange={setOpen} />
    </div>
  )
}
