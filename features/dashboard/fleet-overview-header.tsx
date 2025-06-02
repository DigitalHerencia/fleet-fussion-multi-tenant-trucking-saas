
// features/dashboard/fleet-overview-header.tsx
import { getOrganizationId } from "@/lib/auth/utils"; // Assuming this utility exists
import { getDashboardSummary } from "@/lib/fetchers/kpiFetchers";
import { RefreshCcw } from "lucide-react"; // Assuming lucide-react is installed
import { Badge } from "@/components/ui/badge";

export default async function FleetOverviewHeader() {
  const organizationId = getOrganizationId(); // Helper to get current org ID
  if (!organizationId) {
    return <p className="text-red-400">Organization not found.</p>;
  }
  // TODO: Implement actual data fetching for last updated time
  const lastUpdated = "2 minutes ago"; // Placeholder

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
        <span>Last updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
