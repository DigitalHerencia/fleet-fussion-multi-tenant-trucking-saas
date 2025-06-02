
// features/dashboard/fleet-overview-header.tsx
import { getOrganizationId } from "@/lib/auth/utils"; // Assuming this utility exists
import { getDashboardSummary } from "@/lib/fetchers/kpiFetchers";
import { RefreshCcw } from "lucide-react"; // Assuming lucide-react is installed

export default async function FleetOverviewHeader() {
  const organizationId = getOrganizationId(); // Helper to get current org ID
  if (!organizationId) {
    return <p className="text-destructive">Organization not found.</p>;
  }
  // TODO: Implement actual data fetching for last updated time
  const lastUpdated = "2 minutes ago"; // Placeholder

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fleet Overview</h1>
        <p className="text-sm text-foreground-muted">
          Real-time insights into your fleet operations and performance
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0 text-sm text-foreground-muted">
        <RefreshCcw className="h-4 w-4" />
        <span>Last updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
