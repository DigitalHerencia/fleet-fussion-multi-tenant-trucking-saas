import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { DialogCard } from "@/components/ui/dialog-card"
import type { Vehicle } from "@/types/types"
import { type ReactNode } from "react"
import { Button } from "../ui/button"

interface VehicleDetailsDialogProps {
    vehicle: Vehicle
    isOpen: boolean
    onClose: () => void
    children?: ReactNode
}

export function VehicleDetailsDialog({
    vehicle,
    isOpen,
    onClose,
    children
}: VehicleDetailsDialogProps) {
    return (
        <DialogCard
            open={isOpen}
            onOpenChange={open => !open && onClose()}
            title={`Vehicle Details: ${vehicle.unitNumber}`}
            description="View and manage vehicle information."
        >
            <div>
                <strong>Type:</strong> {vehicle.type}
            </div>
            <div>
                <strong>Status:</strong> {vehicle.status}
            </div>
            <div>
                <strong>Make:</strong> {(vehicle as any).make ?? ""}
            </div>
            <div>
                <strong>Model:</strong> {(vehicle as any).model ?? ""}
            </div>
            <div>
                <strong>Year:</strong> {(vehicle as any).year ?? ""}
            </div>
            {children}
        </DialogCard>
    )
}
