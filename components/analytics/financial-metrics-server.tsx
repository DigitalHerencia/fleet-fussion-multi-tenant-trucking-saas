// The server wrapper for financial metrics that fetches data
import { getRevenueMetrics } from "@/lib/fetchers/analytics";

interface FinancialMetricsServerProps {
  companyId: string;
  timeRange: string;
}

export async function FinancialMetricsServer({
  companyId,
  timeRange,
}: FinancialMetricsServerProps) {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  // Example: fetch data from lib/fetchers
  const data = await getRevenueMetrics(companyId, startDate, endDate);
  return data;
}
