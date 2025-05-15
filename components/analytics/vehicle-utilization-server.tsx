// The server wrapper for vehicle utilization metrics that fetches data
import { getVehicleUtilization } from "../../lib/fetchers/analytics";

interface VehicleUtilizationServerProps {
  companyId: string;
  timeRange: string;
}

export async function VehicleUtilizationServer({
  companyId,
  timeRange,
}: VehicleUtilizationServerProps) {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  // Example: fetch data from lib/fetchers
  const data = await getVehicleUtilization(companyId, startDate, endDate);
  return data;
}
