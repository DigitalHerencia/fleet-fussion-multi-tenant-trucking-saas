// features/dashboard/todays-schedule-widget.tsx
import { getOrganizationId } from "@/lib/auth/utils";
import { Calendar, Sun, Sunset, Moon } from "lucide-react";
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
    return <p className="text-red-400">Organization not found.</p>;
  }

  const scheduleItems = await fetchSchedule(organizationId);

  const getTimePeriodIcon = (timePeriod: ScheduleItem['timePeriod']) => {
    switch (timePeriod) {
      case 'Morning': return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'Afternoon': return <Sunset className="h-4 w-4 text-orange-400" />;
      case 'Evening': return <Moon className="h-4 w-4 text-blue-400" />;
      default: return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTimePeriodColor = (timePeriod: ScheduleItem['timePeriod']) => {
    switch (timePeriod) {
      case 'Morning': return 'text-yellow-400';
      case 'Afternoon': return 'text-orange-400';
      case 'Evening': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-lg">
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
