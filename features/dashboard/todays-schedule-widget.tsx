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
      case 'Morning': return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'Afternoon': return <Sunset className="h-4 w-4 text-orange-400" />;
      case 'Evening': return <Moon className="h-4 w-4 text-blue-400" />;
      default: return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTimePeriodColor = (timePeriod: string) => {
    switch (timePeriod) {
      case 'Morning': return 'text-yellow-400';
      case 'Afternoon': return 'text-orange-400';
      case 'Evening': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black border border-gray-200 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-500 p-1.5 rounded">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
      </div>
      {scheduleItems.length === 0 ? (
        <p className="text-gray-400">No items scheduled for today.</p>
      ) : (
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {getTimePeriodIcon(item.timePeriod)}
                <span className="text-sm text-gray-200">{item.description}</span>
              </div>
              <span className={`text-xs font-medium ${getTimePeriodColor(item.timePeriod)}`}>
                {item.timePeriod}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
