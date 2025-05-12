import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DispatchBoard } from "@/components/dispatch/dispatch-board";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getCurrentCompanyId } from "@/lib/auth";
import { getLoadsForCompany } from "@/lib/loads";
import { Suspense } from "react";
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton";
import type { LoadWithRelations } from "@/lib/actions/load-actions";

// Redefine types to match DispatchBoard expectations
interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  email?: string;
  phone?: string;
}

interface Vehicle {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  status: string;
  type: string;
}

interface Load {
  id: string;
  referenceNumber: string;
  status: string;
  customerName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: Date;
  deliveryDate: Date;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    unitNumber: string;
  } | null;
  trailer?: {
    id: string;
    unitNumber: string;
  } | null;
  commodity: string;
  weight: number;
  rate: number;
  miles: number;
}

export default async function DispatchPage() {
  // Get company context on the server
  let companyId: string | null = null;
  try {
    companyId = await getCurrentCompanyId();
  } catch {
    return (
      <div className="p-4">
        Company not found. Please create a company first.
      </div>
    );
  }

  // Fetch loads for the company
  const loadsResult = await getLoadsForCompany(companyId);
  let loads: Load[] = [];
  let drivers: Driver[] = [];
  let vehicles: Vehicle[] = [];

  if (loadsResult.success) {
    loads = (loadsResult.data as LoadWithRelations[]).map((load) => ({
      id: load.id,
      referenceNumber: load.referenceNumber || "",
      status: load.status || "pending",
      customerName: load.customerName || "",
      originCity: load.originCity || "",
      originState: load.originState || "",
      destinationCity: load.destinationCity || "",
      destinationState: load.destinationState || "",
      pickupDate: load.pickupDate ? new Date(load.pickupDate) : new Date(),
      deliveryDate: load.deliveryDate
        ? new Date(load.deliveryDate)
        : new Date(),
      driver: load.driver
        ? {
            id: load.driver.id,
            firstName: load.driver.firstName,
            lastName: load.driver.lastName,
          }
        : null,
      vehicle:
        load.vehicle !== undefined
          ? load.vehicle
            ? { id: load.vehicle.id, unitNumber: load.vehicle.unitNumber }
            : null
          : null,
      trailer:
        load.trailer !== undefined
          ? load.trailer
            ? { id: load.trailer.id, unitNumber: load.trailer.unitNumber }
            : null
          : null,
      commodity: load.commodity || "",
      weight: Number(load.weight) || 0,
      rate: Number(load.rate) || 0,
      miles: Number(load.miles) || 0,
    }));
    // Extract unique drivers from loads
    const uniqueDrivers = new Map<string, Driver>();
    loads.forEach((load) => {
      if (load.driver) {
        uniqueDrivers.set(load.driver.id, {
          id: load.driver.id,
          firstName: load.driver.firstName,
          lastName: load.driver.lastName,
          status: "active",
        });
      }
    });
    drivers = Array.from(uniqueDrivers.values());
    // Extract unique vehicles from loads
    const uniqueVehicles = new Map<string, Vehicle>();
    loads.forEach((load) => {
      if (load.vehicle) {
        uniqueVehicles.set(load.vehicle.id, {
          id: load.vehicle.id,
          unitNumber: load.vehicle.unitNumber,
          make: "",
          model: "",
          year: 0,
          status: "active",
          type: "tractor",
        });
      }
      if (load.trailer) {
        uniqueVehicles.set(load.trailer.id, {
          id: load.trailer.id,
          unitNumber: load.trailer.unitNumber,
          make: "",
          model: "",
          year: 0,
          status: "active",
          type: "trailer",
        });
      }
    });
    vehicles = Array.from(uniqueVehicles.values());
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dispatch Board"
        text="Manage and track your loads"
      >
        <Link href="/dispatch/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Load
          </Button>
        </Link>
      </DashboardHeader>
      <Suspense fallback={<DispatchSkeleton />}>
        <DispatchBoard drivers={drivers} vehicles={vehicles} loads={loads} />
      </Suspense>
    </DashboardShell>
  );
}
