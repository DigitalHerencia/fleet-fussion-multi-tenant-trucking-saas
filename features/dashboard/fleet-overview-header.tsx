// features/dashboard/fleet-overview-header.tsx
import { RefreshCcw } from 'lucide-react';

import { getDashboardSummary } from '@/lib/fetchers/kpiFetchers';
import type { DashboardSummary } from '@/types/kpi';
import { Badge } from '@/components/ui/badge';

interface FleetOverviewHeaderProps {
  orgId: string;
}

export default async function FleetOverviewHeader({
  orgId,
}: FleetOverviewHeaderProps) {
  if (!orgId) {
    return <p className="text-red-400">Organization not found.</p>;
  }

  // Fetch dashboard summary to get last updated time
  let lastUpdated: string | null = null;
  try {
    const summary: DashboardSummary = await getDashboardSummary(orgId);
    lastUpdated =
      summary && summary.lastUpdated
        ? new Date(summary.lastUpdated).toLocaleString()
        : null;
  } catch (e) {
    lastUpdated = null;
  }

  return (
    <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Fleet Overview</h1>
          <Badge className="border-green-400 bg-green-500 text-green-100">
            Live
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          Real-time insights into your fleet operations and performance
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 sm:mt-0">
        <RefreshCcw className="h-4 w-4" />
        <span>Last updated: {lastUpdated ? lastUpdated : 'N/A'}</span>
      </div>
    </div>
  );
}
