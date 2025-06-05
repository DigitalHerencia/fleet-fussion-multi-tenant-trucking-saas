// features/dashboard/kpi-grid.tsx
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { getOrganizationKPIs } from "@/lib/fetchers/kpiFetchers";

interface KpiGridProps {
  orgId: string;
}

export default async function KpiGrid({ orgId }: KpiGridProps) {
  if (!orgId) {
    return <p className="text-destructive">Organization not found.</p>;
  }

  const kpis = await getOrganizationKPIs(orgId);

  if (!kpis) {
    // Handle case where kpis might be null or undefined if fetch fails
    return <p className="text-destructive">Could not load KPIs.</p>;
  }

  // Assuming getOrganizationKPIs returns an object compatible with DashboardCardsProps['kpis']
  // If not, a transformation step will be needed here.
  // For now, we'll cast it, but this should be validated or typed correctly.
  const cardKpis = kpis as Parameters<typeof DashboardCards>[0]['kpis'];

  return <DashboardCards kpis={cardKpis} />;
}
