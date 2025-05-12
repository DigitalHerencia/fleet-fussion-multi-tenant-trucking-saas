
import { DialogCard } from "@/components/ui/dialog-card";
import type { Vehicle } from "@/types/types";
import { type ReactNode } from "react";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export function VehicleDetailsDialog({
  vehicle,
  isOpen,
  onClose,
  children,
}: VehicleDetailsDialogProps) {
  return (
    <DialogCard
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={`Vehicle Details: ${vehicle.unitNumber}`}
      description="View and manage vehicle information."
    >
      <div>
        <strong>Type:</strong> {vehicle.type}
      </div>
      <div>
        <strong>Status:</strong> {vehicle.status}
      </div>
      
      
      {children}
    </DialogCard>
  );
}
