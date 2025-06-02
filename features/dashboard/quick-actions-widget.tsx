
// features/dashboard/quick-actions-widget.tsx
"use client"; // Keep as client component if actions involve client-side routing or state

import { Button } from "@/components/ui/button"; // Assuming this exists
import { PlusCircle, CalendarClock, AlertTriangle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsWidget() {
  const router = useRouter();

  // TODO: Add permission checks for each action

  return (
    <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-green-500 p-1.5 rounded">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="space-y-3">
        <Button
          variant="default"
          className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
          onClick={() => router.push("/dispatch/loads/new")} // Example route
        >
          <PlusCircle className="mr-3 h-5 w-5 text-green-400" />
          Create New Load
        </Button>
        <Button
          variant="default"
          className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
          onClick={() => router.push("/maintenance/schedule/new")} // Example route
        >
          <CalendarClock className="mr-3 h-5 w-5 text-blue-400" />
          Maintenance
        </Button>
        <Button
          variant="default"
          className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
          onClick={() => router.push("/compliance/alerts")} // Example route
        >
          <AlertTriangle className="mr-3 h-5 w-5 text-orange-400" />
          View Alerts
        </Button>
      </div>
    </div>
  );
}
