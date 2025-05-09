"use client"

import { useState } from "react"
import { VehicleCard } from "./vehicle-card"
import { VehicleDetailsDialog } from "./vehicle-details-dialog"
import { getDocumentsForVehicle } from "@/lib/fetchers/documents"
import VehicleDocuments from "@/features/vehicles/VehicleDocuments"
import type { Vehicle, Document } from "@/types/types"

interface VehiclesClientPageProps {
  vehicles: Vehicle[]
}

export function VehiclesClientPage({ vehicles }: VehiclesClientPageProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleOpen(vehicle: Vehicle) {
    setSelectedVehicle(vehicle)
    // Fetch documents for the selected vehicle
    const docs = await getDocumentsForVehicle(vehicle.id)
    setDocuments(
      docs.map((doc) => ({
        ...doc,
        driverId: doc.driverId ?? undefined,
        vehicleId: doc.vehicleId ?? undefined,
        loadId: doc.loadId ?? undefined,
        fileType: doc.fileType ?? undefined,
        fileSize: doc.fileSize ?? undefined,
        notes: doc.notes ?? undefined,
        createdAt: doc.createdAt
          ? typeof doc.createdAt === "string"
            ? doc.createdAt
            : doc.createdAt.toISOString()
          : '',
        updatedAt: doc.updatedAt
          ? typeof doc.updatedAt === "string"
            ? doc.updatedAt
            : doc.updatedAt.toISOString()
          : '',
      }))
    )
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={{
              ...vehicle,
              make: (vehicle as any).make ?? '',
              model: (vehicle as any).model ?? '',
              year: (vehicle as any).year ?? 0,
            }}
            onClick={() => handleOpen(vehicle)}
          />
        ))}
      </div>
      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicle={selectedVehicle}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          // ...pass other props as needed
        >
          <VehicleDocuments vehicleId={selectedVehicle.id} documents={documents} />
        </VehicleDetailsDialog>
      )}
    </div>
  )
}
