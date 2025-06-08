// features/dashboard/quick-actions-widget.tsx
'use client'; // Keep as client component if actions involve client-side routing or state

import { PlusCircle, CalendarClock, AlertTriangle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button'; // Assuming this exists

export default function QuickActionsWidget() {
  const router = useRouter();

  // TODO: Add permission checks for each action

  return (
    <div className="rounded-lg border border-gray-200 bg-black p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded bg-green-500 p-1.5">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="space-y-3">
        <Button
          variant="default"
          className="w-full justify-start border-gray-200 bg-neutral-900 text-left text-white hover:bg-gray-600"
          onClick={() => router.push('/dispatch/loads/new')} // Example route
        >
          <PlusCircle className="mr-3 h-5 w-5 text-green-400" />
          Create New Load
        </Button>
        <Button
          variant="default"
          className="w-full justify-start border-gray-200 bg-neutral-900 text-left text-white hover:bg-gray-600"
          onClick={() => router.push('/maintenance/schedule/new')} // Example route
        >
          <CalendarClock className="mr-3 h-5 w-5 text-blue-400" />
          Maintenance
        </Button>
        <Button
          variant="default"
          className="w-full justify-start border-gray-200 bg-neutral-900 text-left text-white hover:bg-gray-600"
          onClick={() => router.push('/compliance/alerts')} // Example route
        >
          <AlertTriangle className="mr-3 h-5 w-5 text-orange-400" />
          View Alerts
        </Button>
      </div>
    </div>
  );
}
