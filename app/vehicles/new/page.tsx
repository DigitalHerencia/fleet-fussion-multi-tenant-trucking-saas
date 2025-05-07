import { VehicleForm } from "@/features/vehicles/VehicleForm"

export default function NewVehiclePage() {
    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Add New Vehicle</h1>
            <VehicleForm />
        </div>
    )
}
