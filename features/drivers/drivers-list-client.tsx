"use client";

import { useState } from "react";
import { DriverDetailsDialog } from "@/components/drivers/driver-details-dialog";
import { getDocumentsForDriver } from "@/lib/fetchers/documents";
import DriverDocuments from "@/features/drivers/DriverDocuments";
import type { Driver, Document } from "@/types/types";

interface DriversListClientProps {
  drivers: Driver[];
}

export function DriversListClient({ drivers }: DriversListClientProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleOpen(driver: Driver) {
    setSelectedDriver(driver);
    // Fetch documents for the selected driver
    const docs = await getDocumentsForDriver(driver.id);
    setDocuments(
      docs.map((doc: any) => ({
        ...doc,
        driverId: doc.driverId === null ? undefined : doc.driverId,
        vehicleId: doc.vehicleId === null ? undefined : doc.vehicleId,
        loadId: doc.loadId === null ? undefined : doc.loadId,
        fileType: doc.fileType === null ? undefined : doc.fileType,
        fileSize: doc.fileSize === null ? undefined : doc.fileSize,
        notes: doc.notes === null ? undefined : doc.notes,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }))
    );
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            onClick={() => handleOpen(driver)}
            className="cursor-pointer border rounded p-4 hover:bg-muted"
          >
            <div className="font-bold">
              {driver.firstName} {driver.lastName}
            </div>
            <div className="text-sm text-muted-foreground">{driver.status}</div>
          </div>
        ))}
      </div>
      {selectedDriver && (
        <DriverDetailsDialog
          driver={selectedDriver}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        >
          <DriverDocuments driverId={selectedDriver.id} documents={documents} />
        </DriverDetailsDialog>
      )}
    </div>
  );
}
