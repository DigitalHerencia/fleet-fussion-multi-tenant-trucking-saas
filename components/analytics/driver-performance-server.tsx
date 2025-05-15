// The server wrapper for driver performance metrics that fetches data
import { getDriverPerformance } from "lib/fetchers/analytics";

interface DriverPerformanceServerProps {
  companyId: string;
  timeRange: string;
}

export async function DriverPerformanceServer({
  companyId,
  timeRange,
}: DriverPerformanceServerProps) {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  // Example: fetch data from lib/fetchers
  const data = getDriverPerformance( companyId, startDate, endDate );
  return data;
}
