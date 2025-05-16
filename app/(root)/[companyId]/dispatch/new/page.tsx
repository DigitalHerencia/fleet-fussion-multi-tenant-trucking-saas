import { getDriversForCompany } from "@/lib/fetchers/drivers";
import { getVehiclesForCompany } from "@/lib/fetchers/vehicles";
import LoadForm from "@/features/dispatch/LoadForm";
import { getCurrentCompanyId } from "@/lib/auth";

export default async function NewLoadPage() {
  const companyIdStr = await getCurrentCompanyId();
  const companyId = Number(companyIdStr);
  const driversRaw = await getDriversForCompany(companyId);
  const vehicles = await getVehiclesForCompany(companyId);

  // Map drivers to expected shape: { id: number; name: string }
  const drivers = driversRaw.map(
    (driver: { id: string; firstName: string; lastName: string }) => {
      return {
        id: Number(driver.id),
        name: `${driver.firstName} ${driver.lastName}`.trim(),
      };
    },
  );

  // Map vehicles to expected shape: { id: number; licensePlate: string }
  const vehiclesMapped = (vehicles ?? []).map(
    (vehicle: { id: string; licensePlate: string | null }) => {
      return {
        id: Number(vehicle.id),
        licensePlate: vehicle.licensePlate ? vehicle.licensePlate : "",
      };
    },
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create New Load</h1>
      <LoadForm drivers={drivers} vehicles={vehiclesMapped} />
    </div>
  );
}
