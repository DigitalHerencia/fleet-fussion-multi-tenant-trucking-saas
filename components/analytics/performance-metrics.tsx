"use client";


interface PerformanceMetricsProps {
  timeRange: string;
  data: Array<{
    date: string;
    loads: number;
    miles: number;
    onTimeDelivery: number;
    utilization: number;
  }>;
  comparisonData: {
    loadCount: { current: number; previous: number; change: string };
    miles: { current: number; previous: number; change: string };
    onTimeDelivery: { current: number; previous: number; change: string };
    utilization: { current: number; previous: number; change: string };
  };
}

export function PerformanceMetrics({
  timeRange,
  data,
  comparisonData,
}: PerformanceMetricsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Performance Metrics ({timeRange})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th>Date</th>
              <th>Loads</th>
              <th>Miles</th>
              <th>On Time Delivery</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.loads}</td>
                <td>{row.miles}</td>
                <td>{row.onTimeDelivery}</td>
                <td>{row.utilization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="font-medium mt-2">Comparison</h4>
        <ul className="list-disc ml-6">
          <li>Load Count: {comparisonData.loadCount.current} (Prev: {comparisonData.loadCount.previous}, Change: {comparisonData.loadCount.change})</li>
          <li>Miles: {comparisonData.miles.current} (Prev: {comparisonData.miles.previous}, Change: {comparisonData.miles.change})</li>
          <li>On Time Delivery: {comparisonData.onTimeDelivery.current} (Prev: {comparisonData.onTimeDelivery.previous}, Change: {comparisonData.onTimeDelivery.change})</li>
          <li>Utilization: {comparisonData.utilization.current} (Prev: {comparisonData.utilization.previous}, Change: {comparisonData.utilization.change})</li>
        </ul>
      </div>
    </div>
  );
}
