// features/dashboard/fleet-overview-header.tsx
import { getOrganizationId } from "@/lib/auth/utils";
import { getDashboardSummary } from "@/lib/fetchers/kpiFetchers";
import type { DashboardSummary } from "@/types/kpi";
import { RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function FleetOverviewHeader() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return <p className="text-red-400">Organization not found.</p>;
  }
  // Fetch dashboard summary to get last updated time
  let lastUpdated: string | null = null;
  try {
    const summary: DashboardSummary = await getDashboardSummary(organizationId);
    lastUpdated =
      summary && summary.lastUpdated
        ? new Date(summary.lastUpdated).toLocaleString()
        : null;
  } catch (e) {
    lastUpdated = null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">Fleet Overview</h1>
          <Badge className="bg-green-500 text-green-100 border-green-400">
            Live
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          Real-time insights into your fleet operations and performance
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0 text-sm text-gray-400">
        <RefreshCcw className="h-4 w-4" />
        <span>Last updated: {lastUpdated ? lastUpdated : "N/A"}</span>
      </div>
    </div>
  );
}
