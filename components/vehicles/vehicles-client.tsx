"use client"

import { useState } from "react"
import { VehicleCard } from "./vehicle-card"
import { VehicleDetailsDialog } from "./vehicle-details-dialog"
import { getDocumentsForVehicle } from "../../lib/fetchers/documents"
import VehicleDocuments from "../../features/vehicles/VehicleDocuments"
import { FlexLayout } from "../ui/flex-layout"
import type { Vehicle, Document } from "../../types/types"

interface VehiclesClientProps {
    vehicles: Vehicle[]
}

/**
 * Client component for rendering and interacting with vehicles
 * This component handles client-side interactions like opening
 * vehicle details and fetching documents
 */
export function VehiclesClient({ vehicles }: VehiclesClientProps) {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)

    async function handleOpen(vehicle: Vehicle) {
        setSelectedVehicle(vehicle)
        // Fetch documents for the selected vehicle
        const docs = await getDocumentsForVehicle(vehicle.id)
        setDocuments(
            docs.map(doc => ({
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
                    : "",
                updatedAt: doc.updatedAt
                    ? typeof doc.updatedAt === "string"
                        ? doc.updatedAt
                        : doc.updatedAt.toISOString()
                    : ""
            }))
        )
        setDialogOpen(true)
    }

    return (
        <div>
            <FlexLayout 
                direction="row" 
                wrap={true} 
                gap="md" 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
                {vehicles.map(vehicle => (
                    <VehicleCard
                        key={vehicle.id}
                        vehicle={{
                            ...vehicle,
                            make: (vehicle as any).make ?? "",
                            model: (vehicle as any).model ?? "",
                            year: (vehicle as any).year ?? 0
                        }}
                        onClick={() => handleOpen(vehicle)}
                    />
                ))}
            </FlexLayout>
            
            {selectedVehicle && (
                <VehicleDetailsDialog
                    vehicle={selectedVehicle}
                    isOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                >
                    <VehicleDocuments vehicleId={selectedVehicle.id} documents={documents} />
                </VehicleDetailsDialog>
            )}
        </div>
    )
}
