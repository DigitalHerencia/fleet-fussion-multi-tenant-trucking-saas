// features/dashboard/todays-schedule-widget.tsx
import { Calendar, Sun, Sunset, Moon } from 'lucide-react';

import { getTodaysScheduleAction } from '@/lib/actions/dashboardActions';

interface ScheduleItem {
  id: string;
  description: string;
  timePeriod: string;
  count: number;
  type: string;
}

interface TodaysScheduleWidgetProps {
  orgId: string;
}

export default async function TodaysScheduleWidget({
  orgId,
}: TodaysScheduleWidgetProps) {
  if (!orgId) {
    return <p className="text-red-400">Organization not found.</p>;
  }
  let scheduleItems: ScheduleItem[] = [];
  try {
    const result = await getTodaysScheduleAction(orgId);
    if (result.success && Array.isArray(result.data)) {
      scheduleItems = result.data;
    }
  } catch (e) {
    scheduleItems = [];
  }

  const getTimePeriodIcon = (timePeriod: string) => {
    switch (timePeriod) {
      case 'Morning':
        return <Sun className="text-warning h-4 w-4" />;
      case 'Afternoon':
        return <Sunset className="text-accent h-4 w-4" />;
      case 'Evening':
        return <Moon className="text-primary h-4 w-4" />;
      default:
        return <Calendar className="text-muted-foreground h-4 w-4" />;
    }
  };

  const getTimePeriodColor = (timePeriod: string) => {
    switch (timePeriod) {
      case 'Morning':
        return 'text-warning';
      case 'Afternoon':
        return 'text-accent';
      case 'Evening':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="border-border rounded-lg border bg-black p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded bg-blue-500 p-1.5">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-foreground text-lg font-semibold">
          Today's Schedule
        </h2>
      </div>
      {scheduleItems.length === 0 ? (
        <p className="text-muted-foreground">No items scheduled for today.</p>
      ) : (
        <div className="space-y-4">
          {scheduleItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex flex-1 items-center gap-3">
                {getTimePeriodIcon(item.timePeriod)}
                <span className="text-foreground text-sm">
                  {item.description}
                </span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {item.count > 1 ? `(${item.count})` : null}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${getTimePeriodColor(item.timePeriod)}`}
              >
                {item.timePeriod}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
