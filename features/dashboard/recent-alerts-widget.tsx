// features/dashboard/recent-alerts-widget.tsx
import { getOrganizationId } from "@/lib/auth/utils";
import { getDashboardAlertsAction } from "@/lib/actions/dashboardActions";
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  message: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
}

export default async function RecentAlertsWidget() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return <p className="text-red-400">Organization not found.</p>;
  }

  let alerts: Alert[] = [];
  try {
    const result = await getDashboardAlertsAction(organizationId);
    if (result.success && Array.isArray(result.data)) {
      alerts = result.data.map((a: any) => ({
        id: a.id,
        message: a.message,
        severity: a.severity as Alert['severity'],
        timestamp: a.timestamp,
      }));
    }
  } catch (e) {
    alerts = [];
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-black border border-gray-200 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-red-500 p-1.5 rounded">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
      </div>
      {alerts.length === 0 ? (
        <p className="text-gray-400">No recent alerts.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-200 leading-relaxed">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>{alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}    </div>
  );
}
