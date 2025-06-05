import Link from "next/link";

import { listVehiclesByOrg } from "@/lib/fetchers/vehicleFetchers";
import { VehicleTable } from "@/components/vehicles/vehicle-table";

interface VehicleListPageProps {
  orgId: string;
  page?: number;
}

export default async function VehicleListPage({ orgId, page = 1 }: VehicleListPageProps) {
  const { vehicles, totalPages } = await listVehiclesByOrg(orgId, { page });

  return (
    <div className="space-y-4">
      <VehicleTable vehicles={vehicles} />
      <div className="flex items-center justify-between">
        <Link
          href={`?page=${page - 1}`}
          className={`btn btn-outline ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Link
          href={`?page=${page + 1}`}
          className={`btn btn-outline ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
