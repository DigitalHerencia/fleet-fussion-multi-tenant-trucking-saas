// The server wrapper for performance metrics that fetches data
import { getDailyRevenueTimeline } from "../../lib/fetchers/analytics";

interface PerformanceMetricsServerProps {
  companyId: string;
  timeRange: string;
}

export async function PerformanceMetricsServer({
  companyId,
  timeRange,
}: PerformanceMetricsServerProps) {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  // Example: fetch data from lib/fetchers
  const data = await getDailyRevenueTimeline(companyId, startDate, endDate);
  return data;
}
