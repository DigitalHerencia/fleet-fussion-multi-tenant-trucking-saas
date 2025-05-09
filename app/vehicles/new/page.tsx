import { VehicleForm } from "@/features/vehicles/VehicleForm"
import { PageHeader } from "@/components/ui/page-header"

export default function NewVehiclePage() {
    return (
        <div className="max-w-lg mx-auto p-6">
            <PageHeader title="Add New Vehicle" />
            <VehicleForm />
        </div>
    )
}
