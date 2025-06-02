
// features/dashboard/quick-actions-widget.tsx
"use client"; // Keep as client component if actions involve client-side routing or state

import { Button } from "@/components/ui/button"; // Assuming this exists
import { PlusCircle, CalendarClock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsWidget() {
  const router = useRouter();

  // TODO: Add permission checks for each action

  return (
    <div className="bg-background-soft p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => router.push("/dispatch/loads/new")} // Example route
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Load
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => router.push("/maintenance/schedule/new")} // Example route
        >
          <CalendarClock className="mr-2 h-5 w-5" />
          Schedule Maintenance
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => router.push("/compliance/alerts")} // Example route
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          View Alerts
        </Button>
      </div>
    </div>
  );
}
