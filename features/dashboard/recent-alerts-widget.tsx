// features/dashboard/recent-alerts-widget.tsx
import { AlertTriangle, Clock } from 'lucide-react';

import { getDashboardAlertsAction } from '@/lib/actions/dashboardActions';
import type { DashboardAlert } from '@/lib/actions/dashboardActions';

interface Alert extends DashboardAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface RecentAlertsWidgetProps {
  orgId: string;
}

export default async function RecentAlertsWidget({
  orgId,
}: RecentAlertsWidgetProps) {
  if (!orgId) {
    return <p className="text-red-400">Organization not found.</p>;
  }
  let alerts: Alert[] = [];
  try {
    const result = await getDashboardAlertsAction(orgId);
    if (result.success && Array.isArray(result.data)) {
      alerts = result.data;
    }
  } catch  {
    alerts = [];
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="border-border rounded-lg border bg-black p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded bg-yellow-300 p-1.5">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-foreground text-lg font-semibold">Recent Alerts</h2>
      </div>
      {alerts.length === 0 ? (
        <p className="text-muted-foreground">No recent alerts.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex flex-1 items-start gap-3">
                <div
                  className={`mt-2 h-2 w-2 rounded-full ${getSeverityColor(alert.severity)}`}
                />
                <div className="flex-1">
                  <p className="text-foreground text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground flex flex-shrink-0 items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  {alert.timestamp
                    ? new Date(alert.timestamp).toLocaleTimeString()
                    : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}{' '}
    </div>
  );
}
