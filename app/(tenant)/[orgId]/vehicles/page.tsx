import { Suspense } from 'react';

import { listVehiclesByOrg } from '@/lib/fetchers/vehicleFetchers';
import VehicleListClient from '@/features/vehicles/vehicle-list-client';

export default async function VehiclesPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const vehicles = await listVehiclesByOrg(orgId);
  return (
    <Suspense>
      <VehicleListClient orgId={orgId} initialVehicles={vehicles.vehicles} />
    </Suspense>
  );
}
