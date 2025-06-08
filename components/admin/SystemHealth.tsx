import { getSystemHealth } from '@/lib/fetchers/adminFetchers';

export async function SystemHealth() {
  const health = await getSystemHealth();
  return (
    <div className="space-y-2">
      <p>Uptime: {Math.floor(health.uptime)}s</p>
      <p>Database: {health.databaseStatus}</p>
      <p>Queue: {health.queueStatus}</p>
    </div>
  );
}
