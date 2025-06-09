import { Suspense } from 'react';

import { listVehiclesByOrg } from '@/lib/fetchers/vehicleFetchers';
import VehicleListClient from '@/features/vehicles/vehicle-list-client';

export default async function VehiclesPage({
  params,
}: {
  params: { orgId: string; userId?: string };
}) {
  const { orgId, userId } = params;
  const vehicles = await listVehiclesByOrg(orgId);
  return (
    <Suspense>
      <VehicleListClient orgId={orgId} initialVehicles={vehicles.vehicles} />
    </Suspense>
  );
}
