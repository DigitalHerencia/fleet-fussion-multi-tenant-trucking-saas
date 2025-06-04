// features/dashboard/todays-schedule-widget.tsx
import { getOrganizationId } from "@/lib/auth/utils";
import { Calendar, Sun, Sunset, Moon } from "lucide-react";
import { getTodaysScheduleAction } from "@/lib/actions/dashboardActions";

interface ScheduleItem {
  id: string;
  description: string;
  timePeriod: string;
}

export default async function TodaysScheduleWidget() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return <p className="text-red-400">Organization not found.</p>;
  }

  let scheduleItems: ScheduleItem[] = [];
  try {
    const result = await getTodaysScheduleAction(organizationId);
    if (result.success && Array.isArray(result.data)) {
      scheduleItems = result.data.map((item: any) => ({
        id: item.id,
        description: item.description,
        timePeriod: item.timePeriod || "Today",
      }));
    }
  } catch (e) {
    scheduleItems = [];
  }

  const getTimePeriodIcon = (timePeriod: string) => {
    switch (timePeriod) {
      case "Morning":
        return <Sun className="h-4 w-4 text-warning" />;
      case "Afternoon":
        return <Sunset className="h-4 w-4 text-accent" />;
      case "Evening":
        return <Moon className="h-4 w-4 text-primary" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTimePeriodColor = (timePeriod: string) => {
    switch (timePeriod) {
      case "Morning":
        return "text-warning";
      case "Afternoon":
        return "text-accent";
      case "Evening":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-background border border-border p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-primary p-1.5 rounded">
          <Calendar className="h-4 w-4 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Today's Schedule
        </h2>
      </div>
      {scheduleItems.length === 0 ? (
        <p className="text-muted-foreground">No items scheduled for today.</p>
      ) : (
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                {getTimePeriodIcon(item.timePeriod)}
                <span className="text-sm text-foreground">
                  {item.description}
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
