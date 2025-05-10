import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
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
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Vehicle Details: {vehicle.unitNumber}</DialogTitle>
                    <DialogDescription>View and manage vehicle information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
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
                </div>
                {children}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
