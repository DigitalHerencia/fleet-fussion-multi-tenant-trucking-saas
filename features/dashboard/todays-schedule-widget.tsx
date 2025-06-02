// features/dashboard/todays-schedule-widget.tsx
import { getOrganizationId } from "@/lib/auth/utils";
// import { getTodaysScheduleAction } from "@/lib/actions/dashboardActions"; // Assuming this action exists

interface ScheduleItem {
  id: string;
  description: string;
  timePeriod: "Morning" | "Afternoon" | "Evening"; // Example time periods
}

async function fetchSchedule(organizationId: string): Promise<ScheduleItem[]> {
  // const result = await getTodaysScheduleAction(organizationId);
  // if (result.success && result.data) {
  //   return result.data as ScheduleItem[];
  // }
  // return [];

  // Placeholder data
  return [
    { id: "1", description: "5 loads departing", timePeriod: "Morning" },
    { id: "2", description: "3 loads arriving", timePeriod: "Afternoon" },
    { id: "3", description: "2 maintenance scheduled", timePeriod: "Evening" },
  ];
}

export default async function TodaysScheduleWidget() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return <p className="text-destructive">Organization not found.</p>;
  }

  const scheduleItems = await fetchSchedule(organizationId);

  return (
    <div className="bg-background-soft p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-foreground mb-4">Today's Schedule</h2>
      {scheduleItems.length === 0 ? (
        <p className="text-foreground-muted">No items scheduled for today.</p>
      ) : (
        <ul className="space-y-3">
          {scheduleItems.map((item) => (
            <li key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-foreground-subtle">{item.description}</span>
              <span className="text-xs text-foreground-muted">{item.timePeriod}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
