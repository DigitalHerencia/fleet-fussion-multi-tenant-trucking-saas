import { listVehiclesByOrg } from "@/lib/fetchers/vehicleFetchers";
import { VehicleForm } from "@/components/vehicles/VehicleForm";

export default async function VehicleListPage({ orgId }: { orgId: string }) {
  const vehicles = await listVehiclesByOrg(orgId, {});
  // ...render vehicle list and form...
  return <div>{/* ...vehicle list... */}</div>;
}
