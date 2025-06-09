'use client';
import { useEffect, useState } from 'react';
// FIX: Import DashboardSummary from types, not fetchers
import { DashboardSummary } from '@/types/analytics';
import type { JSX } from 'react/jsx-runtime';

interface RealtimeDashboardProps {
  orgId: string;
  initial: DashboardSummary;
  timeRange: string;
  driver?: string;
  metrics: Array<{ icon: JSX.Element; label: string; value: string; change: string }>;
}

export function RealtimeDashboard({ orgId, initial, timeRange, driver, metrics: initialMetrics }: RealtimeDashboardProps) {
  const [summary, setSummary] = useState(initial);

  useEffect(() => {
    const params = new URLSearchParams({ timeRange });
    if (driver) params.set('driver', driver);
    const es = new EventSource(`/api/analytics/${orgId}/stream?` + params.toString());
    es.onmessage = evt => {
      try {
        const data = JSON.parse(evt.data) as DashboardSummary;
        setSummary(data);
      } catch {}
    };
    return () => es.close();
  }, [orgId, timeRange, driver]);

  const metrics = [
    { icon: initialMetrics[0].icon, label: 'Total Revenue', value: `$${summary.totalRevenue.toLocaleString()}`, change: initialMetrics[0].change },
    { icon: initialMetrics[1].icon, label: 'Total Miles', value: summary.totalMiles.toLocaleString(), change: initialMetrics[1].change },
    { icon: initialMetrics[2].icon, label: 'Load Count', value: summary.totalLoads.toLocaleString(), change: initialMetrics[2].change },
    { icon: initialMetrics[3].icon, label: 'Active Vehicles', value: summary.activeVehicles.toLocaleString(), change: initialMetrics[3].change },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <div key={i} className="flex flex-col justify-between rounded-md border border-gray-200 bg-black p-4">
          <div className="flex items-center gap-2">
            {m.icon}
            <span className="text-sm font-medium text-white">{m.label}</span>
          </div>
          <div className="mt-2 text-4xl font-extrabold text-white">{m.value}</div>
          <span className="text-muted-foreground mt-1 text-xs">{m.change}</span>
        </div>
      ))}
    </div>
  );
}
