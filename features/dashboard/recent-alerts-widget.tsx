// features/dashboard/recent-alerts-widget.tsx
import { getOrganizationId } from "@/lib/auth/utils";
import { getDashboardAlertsAction } from "@/lib/actions/dashboardActions"; // Assuming this action exists and fetches alerts
import { getOrganizationKPIs } from "@/lib/fetchers/kpiFetchers";

interface Alert {
  id: string;
  message: string;
  severity: "high" | "medium" | "low"; // Example severity levels
  timestamp: string; // Or Date object, then format it
}

async function fetchAlerts(organizationId: string): Promise<Alert[]> {
  // const result = await getDashboardAlertsAction(organizationId);
  // if (result.success && result.data) {
  //   return result.data as Alert[]; // Cast if necessary, ensure type safety
  // }
  // return []; // Fallback to empty array

  // Placeholder data until the action is fully implemented
  return [
    { id: "1", message: "Vehicle #1234 maintenance due", severity: "high", timestamp: "2h ago" },
    { id: "2", message: "HOS violation detected", severity: "medium", timestamp: "4h ago" },
    { id: "3", message: "Load #5678 delayed", severity: "low", timestamp: "6h ago" },
  ];
}

export default async function RecentAlertsWidget() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return <p className="text-destructive">Organization not found.</p>;
  }

  const alerts = await fetchAlerts(organizationId);

  return (
    <div className="bg-background-soft p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-foreground-muted">No recent alerts.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex justify-between items-center text-sm">
              <span className="text-foreground-subtle">{alert.message}</span>
              <span className="text-xs text-foreground-muted">{alert.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
