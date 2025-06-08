import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrganizationStats } from '@/lib/fetchers/adminFetchers';

export async function OrganizationStats({ orgId }: { orgId: string }) {
  const stats = await getOrganizationStats(orgId);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.userCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.activeUserCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.vehicleCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.driverCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.loadCount}</span>
        </CardContent>
      </Card>
    </div>
  );
}
